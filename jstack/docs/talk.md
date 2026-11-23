# All Code Is Slop (Except Mine)

Notes on the talk poteto (Lauren Tan, Grok Bot team at SpaceXSI) gave at AI Engineer. pstack, the source of jstack, turns the methods in this talk into skills.

- Video: <https://www.youtube.com/watch?v=O_zcc6Xl12g>
- Transcript and slides: <https://ai.engineer/talks/O_zcc6Xl12g-all-code-is-slop-except-mine>

## In one line

To trust agents more, invest in the environment they work in, not in more human review. Once an agent can check and fix its own work, you can run more agents without losing quality.

## The poteto pyramid

An inverted pyramid. Invest from the wide top down. Cost rises toward the tip.

| Tier | What | Example from the talk | In jstack |
|---|---|---|---|
| 1. Codebase | Good API design, architecture, refactoring | `useEffect` banned in product code. Renderer and main code live in separately named folders, and imports between them are forbidden | `architect`, `principle-model-the-domain`, `principle-subtract-before-you-add` |
| 2. Static analysis | Lints, types, compilers, tests, CI | Every correction to an agent becomes a lint rule (7 rules grew to 167) | `correct`, `principle-encode-lessons-in-structure`, `tdd` |
| 3. Verification | Runtime and formal verification | A feature map plus a CLI drive the real app and save screenshots as proof. TLA+, Lean, Bombadil | `create-verification-skill`, `create-formal-verification-skill`, `statechart`, `principle-prove-it-works` |
| 4. Prose | Rules, skills, AGENTS.md | Only for decisions that still need judgment | The skills themselves |
| 5. Human review | The most expensive | | `interrogate`, `ketchup` |

## Lessons

1. **Code is memory.** Agents learn from the codebase. Leave one workaround and the next agent copies it as the established pattern. One `setTimeout(…, 0)` became 183 timers in six weeks, and the garbage collection they caused made the app lag.
2. **Read the code sometimes.** The code you keep becomes the example the next agent copies.
3. **Nuance leads to slop.** Instead of asking agents for judgment, change the API so the mistake cannot be expressed.
4. **Directory structure is context.** Names such as `electron-renderer/`, `electron-main/`, and `tick.hot.ts` tell the agent the rule. A lint still enforces it.
5. **Stop agents from writing unsolicited Markdown.** A small correction hardens into a permanent rule, or a workaround gets a written justification.
6. **Comments are liabilities.** They go stale and cannot enforce anything. The team cut 65,824 comments to 1,227 and moved guidance into lint messages. See `no-comments`.
7. **Whenever you correct your agent, lint against it or eliminate the problem.** See `correct`.
8. **Spend about 70% of tokens on verification** and 20–30% on writing the change.
9. **Automate in this order:** lint rule, then clean up old bad examples, then a way to verify, and only then many agents. Scaling a broken inner loop multiplies the cost of repairs.

## Results at the time of the talk

- poteto: 3,127 PRs shipped to production in one month, up from 68 in March.
- The team: 11,000 PRs in one month from about 227 contributors, with about 0.5% reverted.
- Users: faster startup, more responsive typing, and faster chat switching than at launch.
