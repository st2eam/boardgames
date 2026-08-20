# Development guide

Read [`architecture.md`](architecture.md) and the matching skill before coding. Commands: [`CLAUDE.md`](../CLAUDE.md).

## Add a game (content)

Use [`.cursor/skills/add-game/SKILL.md`](../.cursor/skills/add-game/SKILL.md). Source of truth is `content/games/<slug>/`, not `public/data/`.

## Add a page (route)

Use [`.cursor/skills/page-development/SKILL.md`](../.cursor/skills/page-development/SKILL.md).

- Keep `src/app/[locale]/**/page.tsx` as a Server Component.
- Load via `GameRepository` / `GameFactory`.
- Gated features: config file exists → `generateStaticParams` filters → page renders feature UI.
- Links: `` `/${locale}/…/` `` with trailing slash.

## Add UI

Use [`.cursor/skills/component-development/SKILL.md`](../.cursor/skills/component-development/SKILL.md). Tokens from `src/app/globals.css`. `"use client"` on interactive pieces under `src/features/` or `src/shared/`, not on whole game pages.

## Score / trainer / play

- Score: [`.claude/skills/add-score-tracker`](../.claude/skills/add-score-tracker/SKILL.md) — **default skip**.
- Trainer: [`.claude/skills/add-trainer`](../.claude/skills/add-trainer/SKILL.md) + [`trainer-system.md`](trainer-system.md).
- Play: [`.cursor/skills/browser-board-game-engine`](../.cursor/skills/browser-board-game-engine/SKILL.md). Leave `bbge/` as its own tree.

## Forbidden

- API routes, middleware, runtime Node in the Next app
- axios / Zustand / Ant Design / Less (see [ADR-002](decisions/ADR-002-keep-tailwind-not-antd.md), [ADR-003](decisions/ADR-003-content-repository-no-axios.md))
- Page-level `fetch` of `content/games` or a parallel loader
- Client `fetch` without `/boardgames/` prefix
- New palette, dark mode, or a second design system
- Empty feature `services/` / `store/` folders
- Editing `public/data/` by hand

## Verify

[`.cursor/skills/testing/SKILL.md`](../.cursor/skills/testing/SKILL.md): `npm run lint`, `npm run build`; `npm run test:bbge` if play/engine changed. Then commit + push per `.cursor/rules/verify-then-push.mdc`.
