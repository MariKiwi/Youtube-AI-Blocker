# AGENTS.md

## Purpose
This file is the documentation index for agents working in the TryggBridge repository.

## Mandatory Test Policy
- For every new function and every new feature, add or update a dedicated executable test file under `tests/`.
- Keep single-command test execution working with `make test-all`.
- Do not mark a feature complete unless corresponding tests are included and passing.
- Keep `tests/TEST_CATALOG.md` updated whenever tests are added, removed, renamed, or behavior/requirements change.

## Core Documentation
- `README.md` - project overview and current status
- `TODO.md` - phased implementation roadmap and status
- `project.md` - target system architecture and security model
