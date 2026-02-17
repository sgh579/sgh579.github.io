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

## Architecture of the tool chain

![](/images/img_2026-02-12-18-09-15.png)
>The purpose of Isaac Sim is to support the creation of new robotics tools and empower the ones that already exist. The platform provides a flexible API for both C++ and Python and can be integrated into a project to varying degrees depending on your needs. The goal of the platform is not to compete with current or existing software, but to collaborate with and enhance it. To this end, many components of Isaac Sim are open source and freely available for independent use. You may want to design your robot in OnShape, simulate its sensors with Isaac Sim, and control the stage through ROS or some other messaging system. Likewise, it is also possible to build a complete, standalone application entirely on the platform provided by Isaac Sim!

The image above is an overview of the tool chain provided in the documentation. [Physx](https://developer.nvidia.com/physx-sdk) is the Physics Engine that drives the simulation. They claim that they compute deformable bodies in the method of FEM. 

>Finite Element Method (FEM) simulation of soft bodies allows for accurate and efficient models of elastic deformable bodies.

So I would not be worried about scientific correctness when my robot touch deformable bodies and my elastic-spring-based force sensor. Though I will do some behavior verification later. 

Another core engine is RTX, who take responsibiliy for rendering. Given Isaac sim is made by NVIDIA, it is no surprise that isaac sim get a great performance with the support of their GPUs. 

From an architectural perspective, Isaac Sim is not a monolithic application but a sophisticated collection of Extensions built upon the Omniverse Kit platform. While the PhysX and RTX engines provide the foundational scientific accuracy for physics and rendering, higher-level tools like Replicator and Isaac Sim leverage these cores to provide specialized robotics functionalities. When we develop standalone Python scripts using SimulationApp(seen a lot in Isaac Sim to show how their module works, but it is better for simple validation instead of complicated algorithm deployment which can be done by Isaac Lab), we are essentially interfacing directly with the Omniverse Kit's modular framework. In this sense, a standalone script operates at the same hierarchical level as the Isaac Sim GUI; both are distinct application-layer implementations that orchestrate the underlying Kit-based microservices to achieve simulation goals.

Furthermore, Isaac Lab, ROS and other App view isaac sim as a platform. NVIDIA Isaac Lab is well known as a robot learning framework built on Isaac Sim. NVIDIA Isaac ROS allow you to use powerful application building toolkits from ROS(to be specific, ROS2). For example, in the stereo camera demo, with ROS bridge, it is possible to send realtime camera captures to some topic and print them on the screen. Or inversely, by ROS bridge, ROS nodes can send control command to objects in Isaac Sim, from predefined robots, articulations to pose of simpler objects. 


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

make sure you execute this two lines before importing anything related to Omniver Kit. Not sure about the official name of this process(TODO). It will have you the access to those packages, inlcuding `isaacsim.core.utils.prims.prim_utils`, `isaacsim.core.api.World` and so on. [Light source](https://openusd.org/release/user_guides/schemas/usdLux/DomeLight.html) is also added to make you able to see.

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

You can also add gravity and collision box if you want. More related example of Isaac Sim apis can be found at standalone python scripts provided by Isaac Sim itself. If you want to implement somthing that you think Isaac Sim could be able to do, check their Physical/Robotic Example first. Read examples' source code to understand how those methods work. Go check them and it's better to do this before reading Documantion and google your questions.



## Mismatching in old version's tutorials

Isaac Sim is iterating so fast that version `5.1.0` has rendered many old tutorials' APIs broken. And unfortunately generative ai tools can't give effective solutions because their data is outdated for this version. For example, Google Gemini's latest training data is up to Jan 2025[[1]](#ref1). But there is a huge change in their `5.0.0`'s [Release Note](https://docs.isaacsim.omniverse.nvidia.com/5.0.0/overview/release_notes.html#removed) in [Aug 2025](https://developer.nvidia.com/blog/isaac-sim-and-isaac-lab-are-now-available-for-early-developer-preview/). On top of the official documentaion and some long Youtube videos, there are another person doing the same thing, like writing [tutorial](https://github.com/cold-young/Isaacsim_tutorial/tree/sim-5.1.0) for Isaac Sim `5.1.0`. But She hasn't updated it since last month.

The biggest trouble is the mismatching of api when you are following some tutorials in old version. But luckily you can find the corresponding api in your local environment if you know the name. In my environment, it can be found at `/~/isaacsim/_build/linux-x86_64/release/exts`.





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