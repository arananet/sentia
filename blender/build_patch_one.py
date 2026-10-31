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
        mod=o.modifiers.new('Machined edges','BEVEL');mod.width=bevel;mod.segments=2
        bpy.ops.object.modifier_apply(modifier=mod.name)
        mod=o.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
        bpy.ops.object.modifier_apply(modifier=mod.name)
    # Bevel interpolates unused cube UVs with tiny run-dependent rounding.
    # These untextured parts need no UVs; remove them for byte-identical exports.
    for uv in list(o.data.uv_layers):o.data.uv_layers.remove(uv)
    return attach(o,name,parent,mat)


def disc(name,parent,mat,x,y,r,z,h):
    bpy.ops.mesh.primitive_cylinder_add(vertices=48,radius=r,depth=h,location=(x,y,z))
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



def build():
    assert bpy.app.version == (4,5,15), bpy.app.version_string
    bpy.ops.wm.read_factory_settings(use_empty=True)
    OUT.mkdir(parents=True,exist_ok=True)
    scene=bpy.context.scene
    scene.unit_settings.system='METRIC';scene.unit_settings.scale_length=.001;scene.unit_settings.length_unit='MILLIMETERS'
    silicone=material('Matte off white silicone',(.83,.82,.77),.82)
    ink=material('SENTIA charcoal ink',(.018,.024,.021),.9)
    teal=material('Teal cyan LED',(.015,.65,.59),.3)
    p=teal.node_tree.nodes.get('Principled BSDF');p.inputs['Emission Color'].default_value=(.01,.65,.59,1);p.inputs['Emission Strength'].default_value=.5
    foam=material('Porous warm gray foam',(.72,.70,.65),.95);foam_texture(foam)
    pcb=material('Ink green solder mask',(.014,.052,.037),.65)
    chip=material('Ceramic packages',(.018,.022,.021),.6)
    metal=material('Brushed component shielding',(.38,.41,.39),.36,.5)
    trace=material('Muted plated contacts',(.39,.33,.20),.4,.72)
    film=material('Translucent adhesive film',(.77,.83,.78),.28,alpha=.38)
    liner=material('Frosted release film',(.9,.91,.86),.52,alpha=.82)
    parents=[]
    for i,name in enumerate(NAMES):
        o=bpy.data.objects.new(name,None);bpy.context.collection.objects.link(o)
        o.location.z=sum(THICKNESS[i+1:])+THICKNESS[i]/2;parents.append(o)
    # Several cross sections roll the edge into a very gentle crown, not a box bevel.
    shell('Crowned silicone shell',parents[0],silicone,[(.985,-.3),(1,-.21),(1,-.06),(.994,.08),(.975,.19),(.90,.265),(.65,.29),(.35,.295)])
    bpy.ops.object.text_add(location=(0,-.4,.298))
    word=bpy.context.object;word.data.body='SENTIA';word.data.align_x='CENTER';word.data.size=4.2;word.data.space_character=1.18;word.data.resolution_u=5
    bpy.ops.object.convert(target='MESH');attach(bpy.context.object,'SENTIA wordmark',parents[0],ink)
    box('LED recessed socket',parents[0],metal,(0,-3.2,.282),(10,.82,.026),.012)
    box('Teal LED line',parents[0],teal,(0,-3.2,.301),(9.6,.55,.018),.008)
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
        for y in [-11.5,12]:
            box('Passive package',b,chip,(x,y,.025),(.85,1.6,.16),.02)
            for dy in [-.65,.65]:box('Solder termination',b,metal,(x,y+dy,.06),(.9,.3,.1),0)
    for i in range(10):
        x=-6+i*.75
        box('Fine copper trace',b,trace,(x,7,-.045),(.09,6+i*.18,.018),0)
        box('Trace return',b,trace,(x+1.6,10+i*.18,-.045),(3.2,.09,.018),0)
    for x,y in [(-13,0),(13,-7),(0,14),(0,-14)]:
        disc('Test pad',b,trace,x,y,.6,-.035,.035)
    # Batch repeated parts without losing the independently modeled components.
    for prefix in ['Processor pin','Passive package','Solder termination','Fine copper trace','Trace return','Test pad']:
        bpy.ops.object.select_all(action='DESELECT')
        parts=[o for o in b.children if o.name.split('.')[0]==prefix]
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
