---
name: architect
description: "Sketch types, signatures, and module structure before code, then stay in the loop while implementation fills in. Use for /architect, 'architect this', 'design this', or non-trivial work where jumping to code would lock in the wrong shape."
disable-model-invocation: true
---

# Architect

In pi, read [the pi adapter](../../docs/harness/pi.md) once per session before you follow this skill. It maps the Cursor names in jstack skills to pi.

Before writing code, trace every system the change touches, then sketch two different shapes for it (types, signatures, module boundaries) and pick the one where each piece of state has one owner, each task has one way to do it, and callers need to know least. Redesign instead of patching if workarounds repeat.

Walk one user action through the proposed design: where does it start, which function makes the decision, and what observable result would prove it worked? Justify a split by what it makes easier. For example, changing a tagging threshold should let the user rerun tagging without extracting the raw data again. If a new layer changes nothing for the caller or the test, leave it out.

For a large or contested design, run the **arena** skill instead of sketching alone.
