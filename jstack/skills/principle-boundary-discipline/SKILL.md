---
name: principle-boundary-discipline
description: "Apply when wiring validation, error handling, or framework adapters. Concentrate guards at system boundaries (CLI, config, network, external APIs); trust internal types and keep business logic in pure functions."
disable-model-invocation: true
---

# Boundary Discipline

Validate, narrow types, and handle errors where data crosses a system boundary (CLI args, config files, external APIs, network). Inside, trust only what those types guarantee. Check each remaining condition where the required information first comes together: a sample can establish that its timestamp is finite, but only a sequence can establish that timestamps increase. Parse raw data into domain types at the boundary, and keep transport and framework types out of the public surface. Business logic lives in pure functions with no framework dependencies. The shell that calls them is thin.

Two tests. Which earlier check or type already guarantees this condition? If one does, do not check it again. Can this be a pure function the shell just calls? If yes, extract it.
