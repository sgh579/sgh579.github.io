---
title: 'Isaac Sim note 1'
date: 2026-02-10
permalink: /posts/2026/02/isaac-sim-note-1/
tags:
  - Isaac Sim
---

Disclaimer: **NO** generative ai was used in writing or editing in this post and later posts unless pointed out explicitly. This series are my notes during my study of how to use Isaac Sim. So it hopefully can help those audience also new to this software. My environment is Ubuntu 22.04. Please feel free to contact me for any quesitons during reading.

## Introductoin

Isaac Sim is included in my project for simulation validation before turning my ideas into real robots.

The Isaac Sim I am using is the latest stable version: `5.1.0`. It is the latest stable version. There is also an early developer release `6.0.0`, but for now I didn't see any new feature that can make me use it in sacrifice of stability.

## Installation

A good way tp start is the [front page](https://docs.isaacsim.omniverse.nvidia.com/5.1.0/index.html) of Isaac Sim Documentation. Under `>Installation>Quick Install`, an installer is given to install isaac software. But I chose to install it by building from the source code, because I saw their [github homepage](https://github.com/isaac-sim/IsaacSim) first. These two ways are supposed to be equivalent.

## Basic usage

After the software is installed, it is easy to play around in their gui to get familised with their modules, before writing any code.

So, in my environment, the built isaac sim software is at the folder `$~/isaacsim/_build/linux-x86_64/release`. The standard way to boot up Isaac Sim with gui is `$~/isaacsim/_build/linux-x86_64/release/isaac-sim.sh`.

![gui](/images/img_2026-02-12-16-14-41.png)

Also you can run standalone python scripts by `~$/isaacsim/_build/linux-x86_64/release/python.sh <python standalone script>`. There is the second way to execute pyhton script: `windwos>script editer`. I will talk about the difference later. And the third way is to use ROS bridge. But I havent tried it for now.

### Hello world

```python
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})
# just make sure these two lines are at the start

import isaacsim.core.utils.prims as prim_utils
from isaacsim.core.api import World
from pxr import Gf, UsdLux

my_world = World(stage_units_in_meters=1.0)
my_world.scene.add_default_ground_plane()

stage = prim_utils.get_current_stage()
UsdLux.DomeLight.Define(stage, "/World/DomeLight").CreateIntensityAttr(1200.0)
UsdLux.DistantLight.Define(stage, "/World/DistantLight").CreateIntensityAttr(2000.0)

my_world.reset()

while(True):
    my_world.step(render=True)
    simulation_app.update()
```

make sure you execute this two lines before importing anything related to Omniver Kit. Not sure about the official name of this process(TODO). It will have you the access to those packages, inlcuding `isaacsim.core.utils.prims.prim_utils`, `isaacsim.core.api.World` and so on.

As usual, use your `python.sh` to execute this "standalone python script".

![](/images/img_2026-02-16-16-50-37.png)

Congrats! You have created an virtual world and a luminous ground. You are able to rotate with you mouse. The left main window with the world inside is called "viewport". At right side, under the tab "Stage", a primitive tree is used to manage primitives of the world. Enter `ctrl`+`c` inside the terminal that runs the program to end the simulation.

Next Step, let's create some objects.

```python
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})
# just make sure these two lines are at the start

import isaacsim.core.utils.prims as prim_utils
from isaacsim.core.api import World
from pxr import Gf, UsdLux

# create the world, ground plane, and light source
my_world = World(stage_units_in_meters=1.0)
my_world.scene.add_default_ground_plane()

stage = prim_utils.get_current_stage()
UsdLux.DomeLight.Define(stage, "/World/DomeLight").CreateIntensityAttr(1200.0)
UsdLux.DistantLight.Define(stage, "/World/DistantLight").CreateIntensityAttr(2000.0)

# place objects
# Sphere. translation means the center's coordinate is (0, 0, 0.4) wrt. the world frame. And the scale is cofigued that the radius equals 0.3
prim_utils.create_prim("/World/obj_sphere", "Sphere", translation=(0.0, 0.0, 0.4), attributes={"radius": 0.3})

# Cube. attributes is as listed in parameters. Scale has 3 members, describing the scaling in 3 axis.
prim_utils.create_prim("/World/obj_cube", "Cube", translation=(2, 0, 0.4), scale=(0.2, 0.2, 0.2))

# Capsule 
prim_utils.create_prim("/World/obj_capsule", "Capsule", translation=(4, 0, 0.5), attributes={"radius": 0.2, "height": 0.6})

# Cone 
prim_utils.create_prim("/World/obj_cone", "Cone", translation=(6, 0, 0.5), attributes={"radius": 0.3, "height": 0.8})

# Cylinder 
prim_utils.create_prim("/World/obj_cylinder", "Cylinder", translation=(8, 0, 0.5), attributes={"radius": 0.3, "height": 0.6})

my_world.reset()

while(True):
    my_world.step(render=True)
    simulation_app.update()
```

![](/images/img_2026-02-16-17-34-06.png)


## Mismatching in old version's tutorials

Isaac Sim is iterating so fast that version `5.1.0` has rendered many old tutorials' APIs broken. And unfortunately generative ai tools can't give effective solutions because their data is outdated for this version. For example, Google Gemini's latest training data is up to Jan 2025[[1]](#ref1). But there is a huge change in their `5.0.0`'s [Release Note](https://docs.isaacsim.omniverse.nvidia.com/5.0.0/overview/release_notes.html#removed) in [Aug 2025](https://developer.nvidia.com/blog/isaac-sim-and-isaac-lab-are-now-available-for-early-developer-preview/). On top of the official documentaion and some long Youtube videos, there are another person doing the same thing, like writing [tutorial](https://github.com/cold-young/Isaacsim_tutorial/tree/sim-5.1.0) for Isaac Sim `5.1.0`. But She hasn't updated it since last month.

The biggest trouble is the mismatching of api when you are following some tutorials in old version. But luckily you can find the corresponding api in your local environment if you know the name. In my environment, it can be found at `/~/isaacsim/_build/linux-x86_64/release/exts`.

## Architecture of the tool chain

![](/images/img_2026-02-12-18-09-15.png)
>The purpose of Isaac Sim is to support the creation of new robotics tools and empower the ones that already exist. The platform provides a flexible API for both C++ and Python and can be integrated into a project to varying degrees depending on your needs. The goal of the platform is not to compete with current or existing software, but to collaborate with and enhance it. To this end, many components of Isaac Sim are open source and freely available for independent use. You may want to design your robot in OnShape, simulate its sensors with Isaac Sim, and control the stage through ROS or some other messaging system. Likewise, it is also possible to build a complete, standalone application entirely on the platform provided by Isaac Sim!

The image above is an overview of the tool chain provided in the documentation. [Physx](https://developer.nvidia.com/physx-sdk) is the Physics Engine that drives the simulation. They claim that they compute deformable bodies in the method of FEM. 

>Finite Element Method (FEM) simulation of soft bodies allows for accurate and efficient models of elastic deformable bodies.

So I would not be worried about scientific correctness when my robot touch deformable bodies and my elastic-spring-based force sensor. Though I will do some behavior verification later. 

Another core engine is RTX, who take responsibiliy for rendering. Given Isaac sim is made by NVIDIA, it is no surprise that isaac sim get a great performance with the support of their GPUs. 

From an architectural perspective, Isaac Sim is not a monolithic application but a sophisticated collection of Extensions built upon the Omniverse Kit platform. While the PhysX and RTX engines provide the foundational scientific accuracy for physics and rendering, higher-level tools like Replicator and Isaac Sim leverage these cores to provide specialized robotics functionalities. When we develop standalone Python scripts using SimulationApp(seen a lot in Isaac Sim to show how their module works, but it is better for simple validation instead of complicated algorithm deployment which can be done by Isaac Lab), we are essentially interfacing directly with the Omniverse Kit's modular framework. In this sense, a standalone script operates at the same hierarchical level as the Isaac Sim GUI; both are distinct application-layer implementations that orchestrate the underlying Kit-based microservices to achieve simulation goals.

Furthermore, Isaac Lab, ROS and other App view isaac sim as a platform. NVIDIA Isaac Lab is well known as a robot learning framework built on Isaac Sim. NVIDIA Isaac ROS allow you to use powerful application building toolkits from ROS(to be specific, ROS2). For example, in the stereo camera demo, with ROS bridge, it is possible to send realtime camera captures to some topic and print them on the screen. Or inversely, by ROS bridge, ROS nodes can send control command to objects in Isaac Sim, from predefined robots, articulations to pose of simpler objects. 



## A simple stereo camera demo

(To explain this later ...)

(fix view rotation and give intrinsic matrix, camera pose)

```python
from isaacsim import SimulationApp
import os
import numpy as np
from PIL import Image

# 1. start App
simulation_app = SimulationApp({"headless": False})

from isaacsim.core.api import World
import isaacsim.core.utils.prims as prim_utils
from isaacsim.sensors.camera import Camera
from isaacsim.core.utils.stage import add_reference_to_stage
from pxr import Gf, UsdLux

# Calculate the rotation of the base as viewed from the target (parallel configuration).
def get_rig_orientation(eye_pos, target_pos):
    eye = Gf.Vec3d(*eye_pos.tolist())
    target = Gf.Vec3d(*target_pos.tolist())
    up = Gf.Vec3d(0, 0, 1)
    
    # Construct the LookAt matrix
    lookat_m = Gf.Matrix4d().SetLookAt(eye, target, up)
    # Acquire rotation and perform Isaac camera axial correction (+X forward).
    cam_matrix = lookat_m.GetInverse()
    correction = Gf.Matrix4d().SetRotate(Gf.Rotation(Gf.Vec3d(0, 1, 0), 90))
    final_matrix = correction * cam_matrix
    
    q = final_matrix.ExtractRotationQuat()
    return np.array([q.GetReal(), *q.GetImaginary()])

# 2. Initialize environment
output_dir = os.path.abspath("./stereo_parallel_recording")
os.makedirs(output_dir, exist_ok=True)

my_world = World(stage_units_in_meters=1.0)
my_world.scene.add_default_ground_plane()

# 3. Scene setup (light sources and objects)
stage = prim_utils.get_current_stage()
UsdLux.DomeLight.Define(stage, "/World/DomeLight").CreateIntensityAttr(1200.0)
UsdLux.DistantLight.Define(stage, "/World/DistantLight").CreateIntensityAttr(2000.0)

# Place objects
prim_utils.create_prim("/World/obj_sphere", "Sphere", translation=(0.0, 0.0, 0.4), attributes={"radius": 0.3})
prim_utils.create_prim("/World/obj_cube", "Cube", translation=(0.6, -0.6, 0.25), scale=(0.4, 0.4, 0.4))
usd_url = "http://omniverse-content-production.s3-us-west-2.amazonaws.com/Assets/Isaac/2023.1.1/Isaac/Samples/Inventory/Screwdriver/screwdriver.usd"
add_reference_to_stage(usd_path=usd_url, prim_path="/World/irregular_obj")

my_world.reset()

# 4. Initialize the camera
# Note: We placed the camera under an Xform to achieve parallel control.
cam_l = Camera(prim_path="/World/cam_l", resolution=(1280, 720))
cam_r = Camera(prim_path="/World/cam_r", resolution=(1280, 720))
cam_l.initialize()
cam_r.initialize()

# 5. Record loop
NUM_FRAMES = 150
RADIUS = 3.5 
HEIGHT = 1.2
BASELINE = 0.06
TARGET_POINT = np.array([0.0, 0.0, 0.3])

print(">>> Preheat Renderer...")
for _ in range(30):
    my_world.step(render=True)



try:
    for i in range(NUM_FRAMES):
        # 1. Calculate the position of the base (center point)
        angle_rad = np.radians((i / NUM_FRAMES) * 360)
        center_pos = np.array([RADIUS * np.cos(angle_rad), RADIUS * np.sin(angle_rad), HEIGHT])
        
        # 2. Calculate the base rotation so that it faces the origin.
        rig_quat = get_rig_orientation(center_pos, TARGET_POINT)
        
        # 3. Calculating the world coordinates of the left and right cameras in a "parallel configuration" We need to find the "right direction" vector of the base to offset the cameras.
        view_dir_h = np.array([center_pos[0], center_pos[1], 0]) / RADIUS
        side_vec = np.array([-view_dir_h[1], view_dir_h[0], 0]) 
        
        pos_l = center_pos + side_vec * (BASELINE / 2.0)
        pos_r = center_pos - side_vec * (BASELINE / 2.0)
        
        # 4. Application pose: Different positions, but completely identical rotation (rig_quat), ensuring optical axis parallelism.
        for cam, pos in [(cam_l, pos_l), (cam_r, pos_r)]:
            cam.set_world_pose(position=pos, orientation=rig_quat)
        
        # Rendering update
        my_world.step(render=True)
        simulation_app.update()
        
        # 5. Capture and correct rotation save
        img_l = cam_l.get_rgba()
        img_r = cam_r.get_rgba()
        
        if img_l is not None and img_l.size > 0:
            # Correct the 90-degree clockwise rotation.
            l_final = np.rot90(img_l[:, :, :3].astype(np.uint8), k=-1)
            r_final = np.rot90(img_r[:, :, :3].astype(np.uint8), k=-1)
            
            Image.fromarray(l_final).save(os.path.join(output_dir, f"{i:04d}_L.png"))
            Image.fromarray(r_final).save(os.path.join(output_dir, f"{i:04d}_R.png"))
            
        if i % 20 == 0:
            print(f"schedule: {i}/{NUM_FRAMES} (radius: {RADIUS}m)")

finally:
    print(f">>> Task completed. Folder: {output_dir}")
    simulation_app.close()
```

run this code:

```bash
$~/isaacsim/_build/linux-x86_64/release/python.sh ~/isaacsim_scripts/stereo_recording/run.py
```

## A simple deformable behavior verification

TBD

## Soft body dynamics: how did they do FEM from the mesh

TBD

## equivalent force sensor

calculate from displacement

read join drive

## Robotic surgery simulation

[NVIDIA Isaac for Healthcare](https://isaac-for-healthcare.github.io/i4h-docs/models/#what-are-models-policies)


## References

* <a id="ref1"></a> [1] Google Gemini, "Response to 'when is your latest training data up to?'," private communication, Feb. 12, 2026.