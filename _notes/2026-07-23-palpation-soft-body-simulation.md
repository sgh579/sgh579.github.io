---
title: "Palpation soft-body simulation (Editing)"
date: 2026-07-23
excerpt: "Notes on FEM soft-body simulation, Newton/VBD, and my custom palpation simulator."
lang: en
tags:
  - simulation
  - biomechanics
  - robotic palpation
  - soft body
---

## FEM soft-body simulation

Soft-body simulation describes how an object deforms under external forces. Elasticity defines the relation between deformation and internal stress. The finite element method (FEM) divides the object into small elements, such as tetrahedra, and computes the elastic response of every element. A numerical solver then updates the complete mesh while satisfying material, boundary, and contact constraints. A soft-body simulator combines these models and numerical methods into a usable system.

## Newton simulator

The simulator used in this project is Newton, an open-source GPU-accelerated physics engine built on NVIDIA Warp. I use its vertex block descent (VBD) solver for soft-body simulation. Newton represents the phantom as a tetrahedral mesh, applies a Neo-Hookean material, handles soft contact with a kinematic spherical probe, and updates the deformed mesh over several substeps and solver iterations.

## My custom simulation

My `custom_simulation` project builds the palpation task with Newton's framework. It creates the tetrahedral phantom, assigns material parameters to normal and inclusion elements, fixes the bottom surface, and adds a kinematic spherical probe. It then uses Newton's collision pipeline and VBD solver to move the probe to each indentation depth, solve the mesh deformation, and estimate the probe reaction force. The same process is repeated over an \\((x,y)\\) scan grid.

![Designed inclusion geometry and the corresponding tetrahedral soft-body phantom used in the palpation simulator](/images/20260723-131025-palpation-phantom-soft-body-mesh.png)

## Reference

- [Newton Physics on GitHub](https://github.com/newton-physics/newton)
