"""Patch One in mm. Blender 4.5.15; no external models, fonts or textures.
The glTF numbers intentionally remain millimetres (exporter does not rescale).
All detail is parent-local. Only the five layer parents are exported.
"""
import base64
import math
import random
import tempfile
from pathlib import Path
import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'evidence/take-apart-product-model'
NAMES = ['Top cover', 'Comfort foam', 'Sensing and processing board', 'Adhesive layer', 'Release liner']
THICKNESS = [.6, .7, .5, .4, .3]


def material(name, rgb, roughness=.7, metallic=0, alpha=1):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value = (*rgb, alpha)
    p.inputs['Roughness'].default_value = roughness
    p.inputs['Metallic'].default_value = metallic
    if alpha < 1:
        p.inputs['Alpha'].default_value = alpha
        m.surface_render_method = 'DITHERED'
    return m


def attach(obj, name, parent, mat):
    obj.name = name
    obj.parent = parent
    obj.data.materials.append(mat)
    return obj


def outline(a=18, r=9, count=16):
    points = []
    for cx, cy, start in [(a-r,a-r,0),(-a+r,a-r,90),(-a+r,-a+r,180),(a-r,-a+r,270)]:
        for i in range(count):
            angle = math.radians(start+i*90/(count-1))
            points.append((cx+r*math.cos(angle),cy+r*math.sin(angle)))
    return points


def shell(name, parent, mat, rings, peel=False):
    pts = outline()
    verts = []
    for scale, z in rings:
        for x,y in pts:
            lift = .12 * max(0, (x-y-21)/9)**2 if peel else 0
            verts.append((x*scale,y*scale,z+lift))
    n = len(pts)
    faces = [tuple(reversed(range(n)))]
    for j in range(len(rings)-1):
        for i in range(n):
            k=(i+1)%n
            faces.append((j*n+i,j*n+k,(j+1)*n+k,(j+1)*n+i))
    faces.append(tuple(range((len(rings)-1)*n,len(rings)*n)))
    mesh=bpy.data.meshes.new(name)
    mesh.from_pydata(verts,[],faces); mesh.update()
    obj=bpy.data.objects.new(name,mesh); bpy.context.collection.objects.link(obj)
    attach(obj,name,parent,mat)
    for p in mesh.polygons: p.use_smooth = len(p.vertices)==4
    uv=mesh.uv_layers.new(name='UVMap')
    for poly in mesh.polygons:
        for index in poly.loop_indices:
            co=mesh.vertices[mesh.loops[index].vertex_index].co
            if len(poly.vertices)==4:
                uv.data[index].uv=((co.x+co.y+36)/36,co.z/9)
            else:
                uv.data[index].uv=((co.x+18)/36,(co.y+18)/36)
    return obj


def box(name,parent,mat,xyz,size,bevel=.025):
    bpy.ops.mesh.primitive_cube_add(size=1,location=xyz)
    o=bpy.context.object; o.dimensions=size
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    if bevel:
        mod=o.modifiers.new('Machined edges','BEVEL');mod.width=bevel;mod.segments=1
        bpy.ops.object.modifier_apply(modifier=mod.name)
        mod=o.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
        bpy.ops.object.modifier_apply(modifier=mod.name)
    # Bevel interpolates unused cube UVs with tiny run-dependent rounding.
    # These untextured parts need no UVs; remove them for byte-identical exports.
    for uv in list(o.data.uv_layers):o.data.uv_layers.remove(uv)
    return attach(o,name,parent,mat)


def disc(name,parent,mat,x,y,r,z,h):
    bpy.ops.mesh.primitive_cylinder_add(vertices=32,radius=r,depth=h,location=(x,y,z))
    o=bpy.context.object
    for p in o.data.polygons: p.use_smooth=len(p.vertices)==4
    return attach(o,name,parent,mat)


def foam_texture(mat):
    # Seeded cell pits, generated in-process and embedded in GLB. A repeating
    # microcell tile provides real surface detail in both renderers.
    rng=random.Random(12)
    size=256
    values=[.88]* (size*size)
    for _ in range(1800):
        x,y=rng.randrange(size),rng.randrange(size);r=rng.choice([1,1,2,3])
        for dy in range(-r,r+1):
            for dx in range(-r,r+1):
                d=(dx*dx+dy*dy)/(r*r)
                if d<=1:
                    idx=((y+dy)%size)*size+(x+dx)%size
                    values[idx]=min(values[idx], .67+.21*d)
    img=bpy.data.images.new('Generated foam microcells',width=size,height=size)
    pixels=[]
    for v in values: pixels.extend((v,v*.98,v*.93,1))
    img.pixels=pixels;img.pack()
    nt=mat.node_tree;p=nt.nodes.get('Principled BSDF')
    tex=nt.nodes.new('ShaderNodeTexImage');tex.image=img
    uv=nt.nodes.new('ShaderNodeTexCoord');mapping=nt.nodes.new('ShaderNodeMapping');mapping.inputs['Scale'].default_value=(4,4,1)
    nt.links.new(uv.outputs['UV'],mapping.inputs['Vector']);nt.links.new(mapping.outputs[0],tex.inputs['Vector'])
    nt.links.new(tex.outputs['Color'],p.inputs['Base Color'])
    normal_image=bpy.data.images.new('Generated foam pore normals',width=size,height=size)
    normal_image.colorspace_settings.name='Non-Color'
    normals=[]
    for y in range(size):
        for x in range(size):
            dx=values[y*size+(x+1)%size]-values[y*size+(x-1)%size]
            dy=values[((y+1)%size)*size+x]-values[((y-1)%size)*size+x]
            v=Vector((-dx,-dy,1)).normalized()
            normals.extend((v.x*.5+.5,v.y*.5+.5,v.z*.5+.5,1))
    normal_image.pixels=normals;normal_image.pack()
    normal_tex=nt.nodes.new('ShaderNodeTexImage');normal_tex.image=normal_image
    nt.links.new(mapping.outputs[0],normal_tex.inputs['Vector'])
    normal=nt.nodes.new('ShaderNodeNormalMap');normal.inputs['Strength'].default_value=.45
    nt.links.new(normal_tex.outputs['Color'],normal.inputs['Color']);nt.links.new(normal.outputs[0],p.inputs['Normal'])



def silicone_texture(mat):
    # Generated silicone grain: seeded normal tile, no silhouette displacement.
    rng=random.Random(4515);size=128
    heights=[rng.uniform(-1,1) for _ in range(size*size)]
    pixels=[]
    for y in range(size):
        for x in range(size):
            dx=heights[y*size+(x+1)%size]-heights[y*size+(x-1)%size]
            dy=heights[((y+1)%size)*size+x]-heights[((y-1)%size)*size+x]
            v=Vector((dx*.24,dy*.24,1)).normalized()
            pixels.extend((v.x*.5+.5,v.y*.5+.5,v.z*.5+.5,1))
    img=bpy.data.images.new('Generated silicone micrograin normals',width=size,height=size)
    img.colorspace_settings.name='Non-Color';img.pixels=pixels;img.pack()
    nt=mat.node_tree;tex=nt.nodes.new('ShaderNodeTexImage');tex.image=img
    uv=nt.nodes.new('ShaderNodeTexCoord');mapping=nt.nodes.new('ShaderNodeMapping')
    mapping.inputs['Scale'].default_value=(3,3,1)
    nt.links.new(uv.outputs['UV'],mapping.inputs['Vector']);nt.links.new(mapping.outputs[0],tex.inputs['Vector'])
    normal=nt.nodes.new('ShaderNodeNormalMap');normal.inputs['Strength'].default_value=.5
    nt.links.new(tex.outputs['Color'],normal.inputs['Color']);nt.links.new(normal.outputs[0],nt.nodes.get('Principled BSDF').inputs['Normal'])


def copper_run(parent,mat,points,width=.085):
    for a,b in zip(points,points[1:]):
        dx,dy=b[0]-a[0],b[1]-a[1]
        o=box('Routed copper trace',parent,mat,((a[0]+b[0])/2,(a[1]+b[1])/2,-.043),(math.hypot(dx,dy)+width,width,.012),0)
        o.rotation_euler.z=math.atan2(dy,dx)


def build():
    assert bpy.app.version == (4,5,15), bpy.app.version_string
    bpy.ops.wm.read_factory_settings(use_empty=True)
    OUT.mkdir(parents=True,exist_ok=True)
    scene=bpy.context.scene
    scene.unit_settings.system='METRIC';scene.unit_settings.scale_length=.001;scene.unit_settings.length_unit='MILLIMETERS'
    silicone=material('Matte off white silicone',(.83,.82,.77),.82);silicone_texture(silicone)
    ink=material('SENTIA charcoal ink',(.018,.024,.021),.9)
    teal=material('Teal cyan LED',(.015,.65,.59),.3)
    p=teal.node_tree.nodes.get('Principled BSDF');p.inputs['Emission Color'].default_value=(.01,.65,.59,1);p.inputs['Emission Strength'].default_value=1.4
    foam=material('Porous warm gray foam',(.72,.70,.65),.95);foam_texture(foam)
    pcb=material('Ink green solder mask',(.014,.052,.037),.65)
    chip=material('Molded epoxy packages',(.018,.022,.021),.64)
    ceramic=material('Warm ceramic capacitors',(.46,.35,.22),.52)
    solder=material('Reflowed tin solder',(.72,.76,.74),.22,.92)
    nickel=material('Nickel terminal plating',(.29,.32,.34),.31,.85)
    resin=material('Ferrite inductors',(.095,.105,.11),.46)
    copper=material('Copper under solder mask',(.16,.20,.10),.4,.65)
    metal=material('Brushed component shielding',(.56,.59,.57),.27,.88)
    trace=material('Muted plated contacts',(.58,.38,.12),.28,.85)
    film=material('Translucent adhesive film',(.77,.83,.78),.28,alpha=.38)
    liner=material('Frosted release film',(.9,.91,.86),.52,alpha=.82)
    parents=[]
    for i,name in enumerate(NAMES):
        o=bpy.data.objects.new(name,None);bpy.context.collection.objects.link(o)
        o.location.z=sum(THICKNESS[i+1:])+THICKNESS[i]/2;parents.append(o)
    # Several cross sections roll the edge into a very gentle crown, not a box bevel.
    cover=shell('Crowned silicone shell',parents[0],silicone,[(.985,-.3),(1,-.21),(1,-.06),(.994,.08),(.975,.19),(.90,.265),(.65,.29),(.35,.295)])
    # Planar crown UVs keep the silicone grain isotropic across every ring.
    for loop in cover.data.loops:
        co=cover.data.vertices[loop.vertex_index].co
        cover.data.uv_layers.active.data[loop.index].uv=((co.x+18)/36,(co.y+18)/36)
    bpy.ops.object.text_add(location=(0,-.4,.298))
    word=bpy.context.object;word.data.body='SENTIA';word.data.align_x='CENTER';word.data.size=4.2;word.data.space_character=1.18;word.data.resolution_u=5
    bpy.ops.object.convert(target='MESH');attach(bpy.context.object,'SENTIA wordmark',parents[0],ink)
    # A real pocket removes silicone above the optical assembly.
    cutter=box('Pocket tool',parents[0],ink,(0,-3.2,.34),(10.04,.86,.4),.06)
    bpy.context.view_layer.objects.active=cover
    mod=cover.modifiers.new('Recessed LED pocket','BOOLEAN');mod.operation='DIFFERENCE';mod.object=cutter
    bpy.ops.object.modifier_apply(modifier=mod.name);bpy.data.objects.remove(cutter,do_unlink=True)
    box('LED recessed socket',parents[0],ink,(0,-3.2,.155),(10,.82,.03),.012)
    box('Teal LED line',parents[0],teal,(0,-3.2,.20),(9.6,.55,.018),.008)
    glass=material('Optical silicone window',(.72,.92,.89),.12,alpha=.24)
    glass.node_tree.nodes.get('Principled BSDF').inputs['Coat Weight'].default_value=.8
    box('Recessed optical lens',parents[0],glass,(0,-3.2,.242),(9.8,.67,.028),.012)
    shell('Microcell comfort foam',parents[1],foam,[(.985,-.35),(1,-.28),(1,.27),(.985,.35)])
    shell('PCB substrate',parents[2],pcb,[(.965,-.25),(.965,-.06)])
    b=parents[2]
    box('Main processing chip',b,chip,(-3,-2,.07),(7,7,.26),.045)
    box('Chip shield',b,metal,(-3,-2,.217),(6.5,6.5,.036),.015)
    box('Thin film battery',b,metal,(7,4,.075),(9,12,.3),.06)
    box('Battery insulating rim',b,chip,(7,4,-.04),(9.6,12.6,.035),.01)
    for x,y in [(-10,7),(-10,-10)]:
        disc('Sensor plated rim',b,trace,x,y,2.5,.025,.16)
        disc('Sensor disc',b,metal,x,y,2.15,.135,.12)
        disc('Sensor aperture',b,chip,x,y,.35,.202,.008)
    for side in [-1,1]:
        for i in range(14):
            y=-5.05+i*.47
            box('Processor pin',b,trace,(-3+side*3.85,y,-.005),(.6,.19,.09),0)
    for i in range(10):
        x=-6+i*1.9
        for row in [-1,1]:
            y=row*(11.5+(i%3)*.55)
            length=[1.1,1.6,1.3][i%3];width=[.65,.85,.75][i%3]
            box('Passive package',b,ceramic if i%3 else resin,(x,y,.025),(width,length,.16),.02)
            for dy in [-length*.4,length*.4]:
                box('Solder termination',b,solder if i%2 else nickel,(x,y+dy,.06),(width+.05,.26,.1),.012)
    # Functional clusters in the free spaces around processor, battery and sensors.
    for i,(x,y,w,h) in enumerate([(-11,1,2,3),(-11,-4,2.4,1.8),(-5,7,3,2.4),
        (0,6,2,2),(8,-7,3.4,2),(12,-10,1.5,2),(3,-8,2.5,1.4),(-4,-8,1.5,1.2),
        (-1,2.6,1.6,1.3),(13,1,1.3,2.4),(-7,14,1.8,1),(-12,11,1.2,1.5)]):
        mat=[chip,ceramic,resin][i%3];height=[.18,.12,.22][i%3]
        box(['Auxiliary IC','MLCC capacitor','Ferrite inductor'][i%3],b,mat,(x,y,-.04+height/2),(w,h,height),.025)
        for side in [-1,1]:
            box('Nickel terminal',b,nickel,(x+side*w*.42,y,.025),(w*.18,h*.92,.12),.015)
            box('Solder joint fillet',b,solder,(x+side*(w*.5+.12),y,-.005),(.32,h*.8,.10),.04)
        # Orthogonal routes with 45 degree bends and distinct lengths.
        yy=y+h/2+.4;end=x+(.7+i%3*.35)
        copper_run(b,copper,[(x,yy),(end,yy),(end+.5,yy+.5),(end+.5,yy+1.2)])
        disc('Copper via annulus',b,trace,end+.5,yy+1.2,.22,-.038,.022)
        disc('Via drill',b,chip,end+.5,yy+1.2,.105,-.022,.008)
    for x,y in [(-13,0),(13,-7),(0,14),(0,-14)]:
        disc('Test contact pad',b,trace,x,y,.6,-.035,.035)
    for i in range(8):
        x=-5+i*.65
        copper_run(b,copper,[(x,2),(x,3+i*.22),(x-1,4+i*.22),(-7,4+i*.22)])
    # Decoupling groups and small signal packages fill the routing corridors.
    for i,(x,y) in enumerate([(-14,3),(-14,-3),(-7.5,-5.5),(-8,2),(-5,9.5),
        (-1,8.8),(1,10),(4,-5),(6,-10),(9,-10),(14,5),(13,9),(-3,-14),(3,-14)]):
        width=.7 if i%2 else 1.1;length=1.3 if i%3 else 2
        box('Signal resistor' if i%2 else 'Decoupling capacitor',b,chip if i%2 else ceramic,
            (x,y,.025),(width,length,.15),.018)
        for side in [-1,1]:
            box('Tinned contact',b,solder,(x,y+side*length*.42,.02),(width+.1,.25,.15),.018)
        copper_run(b,trace,[(x,y-length*.5-.1),(x,y-length*.5-.6),(x+.6,y-length*.5-1.2)],.07)
    # Exposed shield flanges and a pin-one dimple distinguish the main package.
    for y in [-5.3,1.3]:
        box('Shield folded flange',b,nickel,(-3,y,.185),(6.4,.12,.08),.018)
    disc('Processor pin one dimple',b,chip,-5.7,-4.7,.18,.239,.006)
    # Battery folded foil seams and terminal tabs catch the studio key.
    for x in [2.65,11.35]:
        box('Battery foil seam',b,nickel,(x,4,.232),(.14,11.6,.022),.008)
    for y in [1.2,6.8]:
        box('Battery contact tab',b,trace,(1.9,y,.015),(.8,1.1,.1),.025)
    # Batch leads together and copper by routing quadrant, preserving inspectable
    # networks rather than flattening all routes into one bounding rectangle.
    groups=[[o for o in b.children if o.name.split('.')[0]=='Processor pin']]
    routes=[o for o in b.children if o.name.split('.')[0]=='Routed copper trace']
    groups.extend([[o for o in routes if (o.location.x>=0)==right and (o.location.y>=0)==upper]
                   for right in [False,True] for upper in [False,True]])
    for parts in groups:
        if not parts:continue
        bpy.ops.object.select_all(action='DESELECT')
        for o in parts:o.select_set(True)
        bpy.context.view_layer.objects.active=parts[0]
        bpy.ops.object.join()
    shell('Optically translucent adhesive',parents[3],film,[(.99,-.2),(.996,-.16),(.996,.16),(.99,.2)])
    shell('Peeled release liner',parents[4],liner,[(1,-.15),(1,.15)],peel=True)
    # Export only the product, before creating the studio. Axis conversion maps
    # Blender Z to glTF Y; the parent origins become (0, layerCenterMm, 0).
    bpy.ops.object.select_all(action='SELECT')
    with tempfile.TemporaryDirectory() as tmp:
        path=Path(tmp)/'patch-one.glb'
        bpy.ops.export_scene.gltf(filepath=str(path),export_format='GLB',use_selection=True,export_yup=True,export_apply=True,export_animations=False,export_cameras=False,export_lights=False,export_extras=False)
        data=path.read_bytes()
        assert len(data)<=800*1024, len(data)
        (ROOT/'src/patch-one-glb.js').write_text("// Generated by blender/build_all.py (Blender 4.5.15).\nexport const PATCH_ONE_GLB_B64 = '"+base64.b64encode(data).decode()+"';\n")
        print('patch-one.glb bytes:',len(data))
    # Studio render uses the same exported geometry and materials, true scale.
    scene.render.engine='CYCLES';scene.cycles.samples=48;scene.cycles.seed=12;scene.cycles.use_denoising=True
    scene.render.resolution_x=1000;scene.render.resolution_y=1000;scene.render.resolution_percentage=100
    scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGBA';scene.render.image_settings.color_depth='8'
    scene.render.film_transparent=True
    scene.world=bpy.data.worlds.new('Soft studio');scene.world.use_nodes=True
    scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.75,.78,.8,1)
    scene.world.node_tree.nodes['Background'].inputs[1].default_value=.5
    scene.view_settings.view_transform='Standard';scene.view_settings.look='None';scene.view_settings.exposure=0
    bpy.ops.object.light_add(type='AREA',location=(-30,-35,65));key=bpy.context.object;key.data.energy=35000;key.data.shape='DISK';key.data.size=55
    key.rotation_euler=(Vector((0,0,0))-key.location).to_track_quat('-Z','Y').to_euler()
    bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.03))
    floor=bpy.context.object;floor.is_shadow_catcher=True
    floor.data.materials.append(material('Studio shadow surface',(.955973,.955973,.921582),.85))
    bpy.ops.object.camera_add(location=(40,-62,54));cam=bpy.context.object;scene.camera=cam;cam.data.type='ORTHO';cam.data.ortho_scale=59
    # Alpha over exact brand paper in linear space, no visible studio rectangle.
    scene.use_nodes=True;nt=scene.node_tree;nt.nodes.clear()
    layers=nt.nodes.new('CompositorNodeRLayers');over=nt.nodes.new('CompositorNodeAlphaOver');over.inputs[1].default_value=(.955973,.955973,.921582,1)
    nt.links.new(layers.outputs['Image'],over.inputs[2]);comp=nt.nodes.new('CompositorNodeComposite');nt.links.new(over.outputs[0],comp.inputs[0])
    for exploded,file in [(False,'render-assembled.png'),(True,'render-exploded.png')]:
        for i,o in enumerate(parents):o.location.z=sum(THICKNESS[i+1:])+THICKNESS[i]/2+((4-i)*18 if exploded else 0)
        target=Vector((0,0,36 if exploded else 1.25))
        cam.location=target+Vector((40,-62,35 if exploded else 54));cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.ortho_scale=100 if exploded else 53
        floor.hide_render=exploded
        if exploded:
            key.location=(-60,-70,150);key.data.energy=120000;key.data.size=100
            key.rotation_euler=(target-key.location).to_track_quat('-Z','Y').to_euler()
        scene.render.filepath=str(OUT/file);bpy.ops.render.render(write_still=True)

if __name__=='__main__':build()
