---
title: 'Isaac Sim note 1(placeholder)'
date: 2026-02-10
permalink: /posts/2026/02/isaac-sim-note-1/
tags:
  - Isaac Sim
---

Disclaimer: **NO** generative ai was used in writing or editing in this post and later posts. This series are my notes during my study of how to use Isaac Sim. So it hopefully can help those audience also new to this software.

outline
 - how does isaac sim work: the architecture
 - first step, install isaac sim
 - chose where to do your development in the architecture
 - fast change history of api

As an alternative of real robot experiment, Isaac Sim is included to vlidate some ideas first.

The Isaac Sim I am using is the latest stable version: `5.1.0`. Isaac Sim is iterating so fast that version 5.1.0 has rendered many old tutorials' APIs broken. I'm writing this note to keep track of the challenges and solutions I found during my journey with environment setup and camera systems.Nvidia provides multiple ways to install Isaac Sim. I choose to install in with building from source. Build as instructed after clone the repo from github to local. In my environment, the built isaac sim software is at the folder `$~/isaacsim/_build/linux-x86_64/release`. The standard way to boot up Isaac Sim with gui is `$~/isaacsim/_build/linux-x86_64/release/isaac-sim.sh`. Also you can run standalone python scripts by `~$/isaacsim/_build/linux-x86_64/release/python.sh <python standalone script>`. There is the second way to execute pyhton script: `windwos>script editer`, which I will talk about later. And the third way is to use ROS bridge. But I havent tried it for now.

Although it is very straightford to creatingclick buttons in gui, using program to describe simulation gives more control on the process.

Isaac Sim is iterating so fast that version 5.1.0 has rendered many old tutorials' APIs broken. I'm writing this note to keep track of the challenges and solutions I found during my journey with environment setup and camera systems.
- Implementation Mechanism: The Isaac Sim Python API is essentially a wrapper for C++ functional components.
- Binding: Through the "Binding" mechanism, Python functions serve as interfaces to invoke the underlying C++ core logic.
- these interfaces can be found at `/~/isaacsim/_build/linux-x86_64/release/exts`
