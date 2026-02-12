---
title: 'Isaac Sim note 1(placeholder)'
date: 2026-02-10
permalink: /posts/2026/02/isaac-sim-note-1/
tags:
  - Isaac Sim
---

Disclaimer: **NO** generative ai was used in writing or editing in this post and later posts unless pointed out explicitly. This series are my notes during my study of how to use Isaac Sim. So it hopefully can help those audience also new to this software. My environment is Ubuntu 22.04.

outline
 - how does isaac sim work: the architecture
 - first step, install isaac sim
 - chose where to do your development in the architecture
 - fast change history of api

# Introductoin

As an alternative of real robot experiment, Isaac Sim is included in my project for vlidation before turing my ideas into real robots.

# Installation

The Isaac Sim I am using is the latest stable version: `5.1.0`. Isaac Sim is iterating so fast that this version of isaacsim has rendered many old tutorials' APIs broken.

A good way tp start is the [front page](https://docs.isaacsim.omniverse.nvidia.com/5.1.0/index.html) of Isaac Sim Documentation. Under `>Installation>Quick Install`, an installer is given to install isaac software. But I chose to install it by building from the source code, because I saw their [github homepage](https://github.com/isaac-sim/IsaacSim) first. These two ways are supposed to be equivalent.

# Basic usage

After the software is installed, it is easy to play around in their gui to get familised with their modules, before writing any code.

So, in my environment, the built isaac sim software is at the folder `$~/isaacsim/_build/linux-x86_64/release`. The standard way to boot up Isaac Sim with gui is `$~/isaacsim/_build/linux-x86_64/release/isaac-sim.sh`.

![gui](/images/img_2026-02-12-16-14-41.png)


Also you can run standalone python scripts by `~$/isaacsim/_build/linux-x86_64/release/python.sh <python standalone script>`. There is the second way to execute pyhton script: `windwos>script editer`. I will talk about the difference later. And the third way is to use ROS bridge. But I havent tried it for now.

Isaac Sim is iterating so fast that version 5.1.0 has rendered many old tutorials' APIs broken. And generative ai tools can't give effective solutions because their data is outdated for this version[[1]](#ref1).
- Implementation Mechanism: The Isaac Sim Python API is essentially a wrapper for C++ functional components.
- Binding: Through the "Binding" mechanism, Python functions serve as interfaces to invoke the underlying C++ core logic.
- these interfaces can be found at `/~/isaacsim/_build/linux-x86_64/release/exts`


# References

* <a id="ref1"></a> [1] NVIDIA, "Isaac Sim API Reference," *NVIDIA Omniverse Documentation*, 2025.