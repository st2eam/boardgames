<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Agent entry

Read **[`docs/architecture.md`](docs/architecture.md)** before changing structure. Then the matching skill:

| Task | Read |
|------|------|
| Add/edit a route | [`.cursor/skills/page-development`](.cursor/skills/page-development/SKILL.md) |
| UI / layout / tokens | [`.cursor/skills/component-development`](.cursor/skills/component-development/SKILL.md) |
| New game content | [`.cursor/skills/add-game`](.cursor/skills/add-game/SKILL.md) |
| Score tracker | [`.claude/skills/add-score-tracker`](.claude/skills/add-score-tracker/SKILL.md) — default skip |
| Trainer | [`.claude/skills/add-trainer`](.claude/skills/add-trainer/SKILL.md) |
| BBGE play | [`.cursor/skills/browser-board-game-engine`](.cursor/skills/browser-board-game-engine/SKILL.md) |
| Verify | [`.cursor/skills/testing`](.cursor/skills/testing/SKILL.md) |

Stack is **Next.js static export + Tailwind**, not Ant Design / Zustand / axios. ADRs: [`docs/decisions/`](docs/decisions/). Daily commands: [`CLAUDE.md`](CLAUDE.md). After a passing build, follow `.cursor/rules/verify-then-push.mdc`.
