# jstack

A copy of [pstack](https://github.com/cursor/plugins/tree/main/pstack) (poteto, MIT) kept as my own version. The content is pstack's. Only the names changed.

| pstack | jstack |
|---|---|
| `pstack` | `jstack` |
| `poteto-mode` | `jstack-mode` |
| `poteto-agent` | `jstack-agent` |
| `poteto-help` | `jstack-help` |
| `setup-pstack` | `setup-jstack` |

Talk notes: [`jstack/docs/talk.md`](jstack/docs/talk.md). Skills: [`jstack/README.md`](jstack/README.md). Guide: [`jstack/docs/guide/`](jstack/docs/guide/README.md).

## Layout

```text
jstack/                     source. Edit only here
harness/jstack/             generated install trees (pi/, claude-code/). Do not edit by hand
scripts/                    tree generator and docs checker
.claude-plugin/marketplace.json
```

## Change jstack

1. Edit files under `jstack/`.
2. Run `node scripts/generate-jstack-harness-trees.mjs`.
3. Run `node scripts/check-jstack-docs.mjs`.
4. Run `/reload` in pi, then commit.

## Source

- Upstream: <https://github.com/cursor/plugins/tree/main/pstack>, commit `7a583913eb1b` (pstack 0.15.46)
- License: MIT, [`jstack/LICENSE`](jstack/LICENSE)
