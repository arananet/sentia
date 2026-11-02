"""Deterministic entry: blender --background --python blender/build_all.py."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_patch_one import build
build()
