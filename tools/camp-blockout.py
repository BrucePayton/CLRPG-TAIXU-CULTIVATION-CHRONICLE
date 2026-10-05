"""Blender development-only orthographic lodge reference, not final game artwork."""
import bpy
from mathutils import Vector
from pathlib import Path

root = Path(__file__).resolve().parents[1] / 'docs/production/visual-v1'
root.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

def material(name, color):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1)
    mat.use_nodes = True
    mat.node_tree.nodes.get('Principled BSDF').inputs['Base Color'].default_value = (*color, 1)
    mat.node_tree.nodes.get('Principled BSDF').inputs['Roughness'].default_value = .88
    return mat

plaster = material('warm plaster', (.57, .58, .48))
wood = material('aged cedar', (.22, .14, .10))
roof = material('muted jade tile', (.08, .23, .23))
stone = material('blue grey footing', (.25, .34, .34))
dark = material('door recess', (.035, .06, .065))
gold = material('brass lantern', (.76, .48, .16))

def box(name, location, scale, mat):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.materials.append(mat)
    return obj

box('stone foundation', (0, 0, .12), (5.5, 3.2, .24), stone)
box('plaster body', (0, 0, 1.4), (5, 2.7, 2.55), plaster)
box('doorway', (0, -1.366, 1.02), (.85, .07, 1.9), dark)
for x in [-2.45, -1.15, 1.15, 2.45]:
    box('front post', (x, -1.40, 1.43), (.13, .16, 2.6), wood)
for z in [.32, 2.42]:
    box('front beam', (0, -1.41, z), (5.08, .17, .14), wood)
for x in [-1.73, 1.73]:
    box('window', (x, -1.38, 1.45), (.88, .10, .94), dark)
    for offset in [-.36, -.12, .12, .36]:
        box('window lattice', (x+offset, -1.45, 1.45), (.045, .05, .94), wood)
    for z in [1.10, 1.40, 1.76]:
        box('window crossbar', (x, -1.45, z), (.91, .05, .045), wood)
verts = [(-3,-1.95,2.55),(3,-1.95,2.55),(-3,0,3.9),(3,0,3.9),(-3,1.95,2.55),(3,1.95,2.55)]
mesh=bpy.data.meshes.new('roof slopes');mesh.from_pydata(verts,[],[(0,1,3,2),(2,3,5,4)]);mesh.update()
obj=bpy.data.objects.new('separate roof reference',mesh);bpy.context.collection.objects.link(obj);obj.data.materials.append(roof)
box('ridge', (0,0,3.92), (6.2,.17,.16), wood)
for x in [-2.65,2.65]:
    box('lantern', (x,-1.7,2.13), (.25,.25,.36), gold)
for i in range(3):
    box('step', (0,-1.6-i*.24,.18-i*.05), (1.3+i*.24,.27,.10), stone)

bpy.ops.object.camera_add(location=(3,-12,9.5))
camera=bpy.context.object
camera.rotation_euler=(Vector((0,0,1.7))-camera.location).to_track_quat('-Z','Y').to_euler()
camera.data.type='ORTHO';camera.data.ortho_scale=9.4
scene=bpy.context.scene;scene.camera=camera
scene.render.engine='CYCLES';scene.cycles.samples=16
scene.render.resolution_x=768;scene.render.resolution_y=640;scene.render.resolution_percentage=100
scene.world.color=(.65,.65,.65)
bpy.ops.object.light_add(type='AREA',location=(-3,-5,9))
bpy.context.object.data.energy=900;bpy.context.object.data.shape='DISK';bpy.context.object.data.size=7
scene.render.film_transparent=True
scene.render.image_settings.file_format='PNG'
scene.render.filepath=str(root/'lodge-blockout.png')
bpy.ops.wm.save_as_mainfile(filepath=str(root/'lodge-blockout.blend'))
bpy.ops.render.render(write_still=True)
