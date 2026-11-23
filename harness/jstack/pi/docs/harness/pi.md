# jstack in pi

jstack skills use Cursor names. In pi, read this file once per session, then map each Cursor name in a skill with the tables below. `<jstack>` means the folder that holds `skills/` and `docs/`. If a Cursor field has no row, drop it and say so. Never pass a field or value the tool schema rejects.

pi loads jstack as a local package from `harness/jstack/pi`. The skills come from its `skills/`, and the `jstack-agent` and `comment-sicko` subagents come from its `agents/` through `pi-subagents`.

## Tools

| Cursor | pi |
| --- | --- |
| `Task` | The `subagent` tool from `pi-subagents`: `{ agent, task }` for one child, `{ workflow: "parallel", args: { tasks: [...] } }` for independent children. If only `subagents_enable` is listed, call it first. Delegate only when the operator has requested it directly or through applicable project instructions. Selecting a skill is not permission to spawn agents. Otherwise work in this session; ask first if independent agents are essential. |
| `AskQuestion` | `ask_user_question`. In `pi -p` mode it is absent, so ask in plain text. |
| Open a todolist, or copy steps into the todolist tool | `todo` with `action: "create"` and `tasks: [...]`. Without it, keep the list in your reply and update it at each phase. |
| Run another jstack skill (`/name` or "the **name** skill") | `read` `<jstack>/skills/<name>/SKILL.md` and follow it. When you tell the user to type it, write `/skill:<name>`. |
| `Grep`, `Glob` | `bash` with `rg` or `find`. |

## Subagent fields

| Cursor | pi |
| --- | --- |
| `subagent_type: generalPurpose` | `agent: "delegate"` |
| `jstack-agent`, `comment-sicko` | `agent: "jstack-agent"`, `agent: "comment-sicko"`. The generated agent files already hold a pi model. Pass `model` on the call only when the role in `jstack-models.md` says otherwise. |
| `readonly: true` | `agent: "scout"`, or `"reviewer"` for a review. The brief also says "do not edit files", and you check `git status` afterward. |
| `readonly: false` | `agent: "delegate"`, or `"worker"` for implementation. |
| `environment: "cloud"` | `worktree: true` on the `subagent` call. Name the branch or commit the worker checks out. |
| `environment: "local"` | Omit. |
| `cloud_base_branch: <b>` | Tell the worker to check out `<b>` first. |
| `run_in_background: true` | `async: true`. Completion wakes this session, so do not sleep or poll. |
| `resume` | `{ action: "resume", id, message }` when the child was retained. Otherwise spawn a new agent and paste the earlier result into its brief. |
| `file_attachments` | List the paths in the brief. |

## Models

| Cursor | pi |
| --- | --- |
| `claude-<family>-<version>-<effort>[-fast]`, such as `claude-opus-5-5-xhigh` | `model: "claude-<family>-<version>:<effort>"`, such as `claude-opus-5-5:xhigh`. Drop `-fast`. |
| A `gpt-*`, `grok-*`, `gemini-*`, or other non-Claude slug | Use the closest id that `pi --list-models` lists, with `:<effort>`. If none is listed, omit `model` so the agent runs on the session model, and say so. |
| `auto` or `inherit-parent` | Omit `model`. |
| The `jstack-models.mdc` rule, `~/.cursor/rules/jstack-models.mdc` | `~/.pi/agent/jstack-models.md`. pi does not load it on its own, so read it before you pick a model for a role. If the file or the role's line is missing, use the skill's default slug. |
| A role value `<model> <effort>`, such as `claude-opus-5-5 high` | `model: "claude-opus-5-5:high"`. |

## setup-jstack

Follow its steps with these changes:

- Detect. The detected models are the ids that `pi --list-models` prints. Write a real model as `<model> <effort>`, such as `claude-opus-5-5 xhigh`. The effort is the last token, so the budget step works as written.
- Defaults. Map each default slug with the rows above: `claude-opus-5-5-xhigh-fast` is `claude-opus-5-5 xhigh`, `claude-opus-5-5-high-fast` is `claude-opus-5-5 high`, `claude-fable-5-2-high` is `claude-fable-5-2 high`, and `gemini-4-neon-xhigh` is `inherit-parent` unless `pi --list-models` lists a Gemini model.
- Write. Write `~/.pi/agent/jstack-models.md` with no frontmatter, then the comment lines, the `# budget` line, and one line per role from step 5. Overwrite the whole file. Never put the role lines in `AGENTS.md`.

## Paths

| Cursor | pi |
| --- | --- |
| `.cursor/skills/`, `~/.cursor/skills/` | `.pi/skills/` or `.agents/skills/` in the project, `~/.pi/agent/skills/` or `~/.agents/skills/` for the user. |
| `~/.cursor/plugins/`, `.cursor-plugin/plugin.json` | The jstack package, `~/git/00_about/plugins/harness/jstack/pi/` unless `pi list` shows another path, and its `package.json`. |
| `.cursor/rules/*.mdc`, always-applied rules | `AGENTS.md` in the project, or `~/.pi/agent/AGENTS.md` for every project. pi never reads `.mdc` files. The model rule is the exception. See Models. |
| `https://github.com/cursor/plugins/blob/main/pstack/<path>` | `<jstack>/<path>` when that file exists. Read the local copy and never fetch it. |
| Transcripts in `~/.cursor/projects/<slug>/agent-transcripts/` | `~/.pi/agent/sessions/<slug>/*.jsonl`. The slug is the workspace path with each `/` changed to `-`, wrapped in `--`, so `/home/you/proj` is `--home-you-proj--`. The newest `.jsonl` is the current session. Subagent runs are listed by `subagent({ action: "status" })`. Read only this workspace's folder. |

## Cursor-only features

pi has no Cursor Automations, Bugbot, Cursor cloud agents, or built-in PR tool. When a step needs one, put one line in your reply, `Skipped in pi: <step>. <reason>.`, then go on to the next step. Do not stop, ask, or retry. When a later step needs what the skipped step made, such as a URL or a key, leave a placeholder and name it in the line.

| Cursor | pi |
| --- | --- |
| Cursor Automations: routines, `update_state` routine calls, `api2.cursor.sh/automations` webhooks, routine wakes, and `SendToUser` secret requests | Skip with the line. |
| Bugbot | Bugbot comments on a GitHub PR are ordinary review threads, so triage them with the forge command that the step gives. Skip a step that starts, waits for, or configures Bugbot when the PR has no Bugbot check or comment. |
| Cursor cloud agents | `environment: "cloud"` maps to a worktree, as in Subagent fields. Skip a step that needs the cloud agent itself, such as its dashboard status or its own machine. |
| A built-in PR tool | Use the forge command that the step gives, such as `gh pr create`. That is not a skip, so write no line. |
