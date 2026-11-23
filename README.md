# plugins

Jisang Yun's agent plugins. The layout follows [cursor/plugins](https://github.com/cursor/plugins): each plugin is one folder at the repository root, and the marketplace files at the root list the plugins.

## Plugins

| `name` | Folder | Description |
|---|---|---|
| `jstack` | [`jstack/`](jstack/) | A copy of [pstack](https://github.com/cursor/plugins/tree/main/pstack) (poteto, MIT) with renamed commands. Talk notes: [`jstack/docs/talk.md`](jstack/docs/talk.md) |

## Layout

```text
plugins/
├── .cursor-plugin/marketplace.json   plugin list for Cursor
├── .claude-plugin/marketplace.json   plugin list for Claude Code, points at harness/
├── jstack/                           plugin source. Edit only here
├── harness/jstack/                   generated install trees (pi/, claude-code/). Do not edit by hand
└── scripts/                          tree generator and docs checker
```

## Install

| Harness | Steps |
|---|---|
| pi | `pi install ~/git/00_about/plugins/harness/jstack/pi`, then `/reload`. Run `/skill:jstack-mode <task>` |
| Claude Code | `/plugin marketplace add ~/git/00_about/plugins`, then `/plugin install jstack@jisang-plugins`. Run `/jstack:jstack-mode <task>` |
| Cursor | Copy or link `jstack/` into `~/.cursor/plugins/local/jstack` |

## Change jstack

1. Edit files under `jstack/`.
2. Run `node scripts/generate-jstack-harness-trees.mjs` to rebuild the install trees.
3. Run `node scripts/check-jstack-docs.mjs` to check the docs against the skill list.
4. Run `/reload` in pi, then commit.

## Add a plugin

1. Create `<name>/` at the root with `.cursor-plugin/plugin.json`, `README.md`, `LICENSE`, and `skills/`.
2. Add it to `plugins` in `.cursor-plugin/marketplace.json`.
3. To use it in Claude Code or pi, add it to `.claude-plugin/marketplace.json`. If its skills use Cursor names, generate per-harness trees as jstack does.
4. Add a row to the table above.

## jstack source

- Upstream: <https://github.com/cursor/plugins/tree/main/pstack>, commit `7a583913eb1b` (pstack 0.15.46)
- Renames: `pstack`→`jstack`, `poteto-mode`→`jstack-mode`, `poteto-agent`→`jstack-agent`, `poteto-help`→`jstack-help`, `setup-pstack`→`setup-jstack`
- Added: pi harness (`jstack/docs/harness/pi.md`, `harness/jstack/pi/`) and talk notes (`jstack/docs/talk.md`)
- Not copied: `cursor-team-kit` (`/deslop`, `control-cli`, `control-ui`), the upstream CI, and schema validation
- License: MIT, [`jstack/LICENSE`](jstack/LICENSE)
