---
title: 'Isaac Sim note 1(placeholder)'
date: 2026-02-10
permalink: /posts/2026/02/isaac-sim-note-1/
tags:
  - Isaac Sim
---

Disclaimer: **NO** generative ai was used in writing or editing in this post and later posts unless pointed out explicitly. This series are my notes during my study of how to use Isaac Sim. So it hopefully can help those audience also new to this software. My environment is Ubuntu 22.04. Please feel free to contact for any quesitons during reading.

outline
 - how does isaac sim work: the architecture
 - first step, install isaac sim
 - chose where to do your development in the architecture
 - fast change history of api

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

## How to learn the advanced usage?

Isaac Sim is iterating so fast that version 5.1.0 has rendered many old tutorials' APIs broken. And generative ai tools can't give effective solutions because their data is outdated for this version. For example, Google Gemini's latest training data is up to Jan 2025[[1]](#ref1). But there is a huge change in their `5.0.0`'s [Release Note](https://docs.isaacsim.omniverse.nvidia.com/5.0.0/overview/release_notes.html#removed) in [Aug 2025](https://developer.nvidia.com/blog/isaac-sim-and-isaac-lab-are-now-available-for-early-developer-preview/). On top of the official documentaion and some long Youtube videos, there are another person doing the same thing, like writing [tutorial](https://github.com/cold-young/Isaacsim_tutorial/tree/sim-5.1.0) for Isaac Sim `5.1.0`. But She has updated it since last month.

The biggest trouble is the mismatching of api when you are follow some tutorials in old version. But luckily you can find the corresponding api in your local environment if you know the name.In my environment, it can be found at `/~/isaacsim/_build/linux-x86_64/release/exts`.


## References

* <a id="ref1"></a> [1] Google Gemini, "Response to 'when is your latest training data up to?'," private communication, Feb. 12, 2026.