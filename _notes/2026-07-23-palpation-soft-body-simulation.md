---
title: "How I simulated palpation for the WKS paper"
date: 2026-07-23
excerpt: "The Newton/VBD simulation used to generate the synthetic force-depth dataset for my RSS workshop paper."
lang: en
published: false
tags:
  - simulation
  - biomechanics
  - robotic palpation
  - soft body
---

This note records the simulation used in my RSS workshop submission, *Is
Stiffness Sufficient for Palpation Lesion Localization?* It does not cover
simulators I explored later.

The paper needed paired inputs for a controlled comparison: the complete
force-depth process and a two-point stiffness value computed from that same
process. The simulator was therefore designed as a synthetic data generator,
not as a patient-specific tissue model.

The code excerpts below are abridged from the generator version used for the
WKS dataset (`cbb77c3`).

## Phantom and material

I used the [Newton Physics Engine](https://github.com/newton-physics/newton) and
its GPU vertex block descent (VBD) solver. Each phantom was a
\\(180\times180\times80\\) mm soft block discretised as a structured
\\(48\times48\times16\\)-cell tetrahedral mesh. The bottom surface was fixed and
gravity was disabled.

The mesh used a Neo-Hookean-like material assignment. Each phantom contained
one to four analytic inclusions chosen from spheres, ellipsoids, boxes,
cylinders, and capsules. A tetrahedron was assigned to an inclusion when its
centroid lay inside that analytic shape; inclusion elements used \\(20\times\\)
the base stiffness in the reported experiments. In code, the per-element scale
\\(s_e\\) was applied as
\\((\mu_e,\lambda_e,c_e)=(s_e\mu_0,s_e\lambda_0,\sqrt{s_e}c_0)\\):

```python
stiffness = np.ones(mesh.tets.shape[0], dtype=np.float32)
for lump in lump_list:
    inside = lump_membership(mesh.tet_centroids, lump, project_xy=False)
    update = inside & (lump.stiffness_multiplier > stiffness)
    stiffness[update] = lump.stiffness_multiplier

k_mu = np.full(mesh.tets.shape[0], material.k_mu, dtype=np.float32) * stiffness
k_lambda = np.full(mesh.tets.shape[0], material.k_lambda, dtype=np.float32) * stiffness
k_damp = np.full(mesh.tets.shape[0], material.k_damp, dtype=np.float32) * np.sqrt(stiffness)
```

![Designed inclusion geometry and the corresponding tetrahedral soft-body phantom used in the palpation simulator](/images/20260723-131025-palpation-phantom-soft-body-mesh.png)

*Analytic inclusions, left, and their discretised material assignment, right.*

## Simulated palpation

A kinematic spherical probe pressed normally into the top surface. For every
phantom, it visited a \\(20\times20\\) scan grid and advanced through 20
indentation samples at each location. Newton generated particle-shape contacts,
and VBD updated the tetrahedral mesh over several substeps and local solver
iterations. The phantom state was reset between scan locations.

```python
probe_body = builder.add_body(..., is_kinematic=True)
shape_cfg.ke = material.soft_contact_ke
shape_cfg.kd = material.soft_contact_kd
shape_cfg.mu = material.probe_contact_mu
probe_shape = builder.add_shape_sphere(
    probe_body, radius=scan.probe_radius, cfg=shape_cfg
)

for step, depth in enumerate(depths):
    target_z = phantom.height + scan.probe_radius + scan.preload_gap - depth
    substeps = max(scan.sim_substeps_per_depth, 1)
    for substep in range(substeps):
        alpha = (substep + 1) / substeps
        z_1 = previous_z + (target_z - previous_z) * alpha
        _set_probe_kinematic_pose(..., state_1, probe_body, ..., z_1, ...)
        collision_pipeline.collide(state_1, contacts)
        solver.step(state_0, state_1, control, contacts, scan.sim_dt)
        state_0, state_1 = state_1, state_0

    force_z, _ = _estimate_probe_reaction_z(
        model, state_0, contacts, solver, probe_shape, material
    )
    presses[row, col, step] = (depth, force_z)
```

The output of one sample was

$$
\mathbf P\in\mathbb R^{20\times20\times20\times2},
$$

where the last dimension stored indentation \\(d\\) and normal reaction \\(F_z\\).
The analytic inclusion geometry also produced a \\(128\times128\\) projected mask
for segmentation.

## How I estimated \\(F_z\\)

The kinematic probe did not expose a force-sensor reading. After each VBD solve,
I selected the soft contacts whose shape ID matched the probe. For contact
\\(c\\), penetration was

$$
\delta_c=
\max\left[
-\mathbf n_c^\mathsf T
(\mathbf x_c-\mathbf x_c^{\mathrm{probe}})
+r_c,\;0
\right].
$$

Using Newton's effective contact penalty \\(k_c\\), I estimated the normal probe
reaction as

$$
F_z=
\max\left(
-\sum_{c\in\mathcal C_{\mathrm{probe}}}
k_c\delta_c n_{c,z},
\;0
\right).
$$

```python
shape = contacts.soft_contact_shape.numpy()[:count]
idx = np.nonzero(shape == probe_shape)[0]

particles = contacts.soft_contact_particle.numpy()[:count][idx].astype(np.int64)
body_pos = contacts.soft_contact_body_pos.numpy()[:count][idx]
normals = contacts.soft_contact_normal.numpy()[:count][idx]
particle_q = state.particle_q.numpy()[particles]
particle_radius = model.particle_radius.numpy()[particles]
shape_body = model.shape_body.numpy()[probe_shape]
body_q = state.body_q.numpy()[shape_body]
bx = _transform_points(body_q, body_pos)

penetration = -(
    np.einsum("ij,ij->i", normals, particle_q - bx) - particle_radius
)
penetration = np.maximum(penetration, 0.0)
ke = solver.body_particle_contact_penalty_k.numpy()[:count][idx]
particle_force = normals * (penetration * ke)[:, None]
reaction_z = max(float(-np.sum(particle_force[:, 2])), 0.0)
```

This is the \\(F_z\\) used in the WKS dataset. It is a per-probe
penalty-contact estimate: contacts are grouped by probe shape, so it is not a
bottom-boundary reaction. However, it reconstructs only the normal elastic
penalty term after a finite VBD solve; it is not a validated load-cell
measurement or an exact quasi-static reaction.

## How the paper used the data

The dataset contained 1000 training, 400 validation, and 400 test phantoms. The
curve representation stacked the 20 displacement and \\(F_z\\) samples as 40
channels over the scan grid. The scalar baseline reduced each press to

$$
k_{i,j}=
\frac{F_{z,i,j,T}-F_{z,i,j,1}}
{d_{i,j,T}-d_{i,j,1}}.
$$

The generated curves were loading-only, so \\(T\\) was the peak—and normally
the final—indentation sample:

```python
z = displacement - displacement[0]
f = force - force[0]
peak = int(np.nanargmax(z))
dz = float(z[peak] - z[0])
df = float(f[peak] - f[0])
stiffness = max(df / dz, 0.0) if abs(dz) >= 1e-9 else 0.0
```

Both representations were evaluated with the same U-Net family and target
masks. This kept the comparison focused on what was lost when the press process
was compressed to one number.

## What I learned

First, the slope above is an apparent indentation stiffness, not Young's
modulus. It also depends on probe geometry, boundary conditions, indentation
range, contact, and the subsurface material field.

Second, a controlled simulator can support a representation comparison without
being physical ground truth: both inputs came from the same simulated curves,
so the experiment tested information loss under matched conditions. The claim
must remain simulation-only.

Third, force extraction is part of the model. The WKS implementation was useful
for that controlled benchmark, but future physical claims require the complete
per-probe contact wrench, mesh and solver convergence checks, and validation
against measured phantom data.

## References

- [Newton Physics Engine](https://github.com/newton-physics/newton)
- [Chen et al., “Vertex Block Descent,” ACM Transactions on Graphics, 2024](https://doi.org/10.1145/3658179)
- [Smith et al., “Stable Neo-Hookean Flesh Simulation,” ACM Transactions on Graphics, 2018](https://doi.org/10.1145/3180491)
