# jstack harness tree

This folder is generated from `jstack/skills`, `jstack/agents`, `jstack/docs/guide`, `jstack/docs/harness`, `jstack/README.md`, `jstack/LICENSE`, and `jstack/plugin.json`. Do not edit it by hand.

Cursor uses `jstack/` directly. Claude Code installs `claude-code/`, and pi installs `pi/`. Each tree leaves out the rest of `jstack/`, such as `jstack/automations` and `jstack/assets`. A relative link to a jstack file that a tree leaves out points at its absolute path in `jstack/` instead.

After editing those sources, run `node scripts/generate-jstack-harness-trees.mjs` from the repository root and commit the result.
