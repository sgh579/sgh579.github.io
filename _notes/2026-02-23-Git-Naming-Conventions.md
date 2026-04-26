---
title: 'Git Naming Conventions'
date: 2026-02-23
permalink: /posts/2026/02/Git-Naming-Conventions/
tags:
  - Naming Conventions
  - Git
---

Eazy, automatic and trackable.

## Branch naming

For individual developers, it is very smooth to develop along the main branch.

- `main` branch: Always keep the code runnable and deployable.
- `feature` branches: When develop new features and fix large bug, create a temporary branch from the main branch. Examples:
  - `feat/ui-update`: New features
  - `fix/login-bug`: Fix bugs
  - `refactor/xxx`: 
  - `docs/xxx`
- branch merging: Do Pull Request on the website. Check the Diff mannually online.

## Commit naming

- `feat:`: new features
- `fix `
- `docs`
- `style`
- `refactor`
- `chore `