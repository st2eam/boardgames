<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Agent entry

Read **[`docs/architecture.md`](docs/architecture.md)** before changing structure. Then the matching skill:

| Task | Read |
|------|------|
| Add/edit a route | [`.agents/skills/page-development`](.agents/skills/page-development/SKILL.md) |
| UI / layout / tokens | [`.agents/skills/component-development`](.agents/skills/component-development/SKILL.md) |
| Unified rules + inline interactions | [`.agents/skills/hybrid-interactive-rules`](.agents/skills/hybrid-interactive-rules/SKILL.md) |
| New game content | [`.agents/skills/add-game`](.agents/skills/add-game/SKILL.md) |
| Score tracker | [`.agents/skills/add-score-tracker`](.agents/skills/add-score-tracker/SKILL.md) — default skip |
| Trainer | [`.agents/skills/add-trainer`](.agents/skills/add-trainer/SKILL.md) |
| BBGE play | [`.agents/skills/browser-board-game-engine`](.agents/skills/browser-board-game-engine/SKILL.md) |
| Verify | [`.agents/skills/testing`](.agents/skills/testing/SKILL.md) |

Stack is **Next.js static export + Tailwind**, not Ant Design / Zustand / axios. ADRs: [`docs/decisions/`](docs/decisions/). Daily commands: [`CLAUDE.md`](CLAUDE.md). After a passing build, follow `.cursor/rules/verify-then-push.mdc`.
