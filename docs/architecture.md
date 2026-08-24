# Architecture Blueprint

Cross-feature map of The Game Shelf. Day-to-day: [`CLAUDE.md`](../CLAUDE.md). How to change code: [`development-guide.md`](development-guide.md). Folders: [`project-structure.md`](project-structure.md). Patterns: [`design-patterns.md`](design-patterns.md).

## Overview

Static Next.js App Router site (`output: "export"`, `basePath: "/boardgames"`, `trailingSlash: true`). Content is file-based; there is no CMS, API routes, or runtime Node server. See [ADR-001](decisions/ADR-001-next-static-export.md).

```
content/games ──► GameRepository / GameFactory ──► app/[locale] pages ──► features
       │                                                              │
       └──► prebuild (generate-game-data) ──► public/data ──► client fetch (chat, covers)
```

**Dependency direction:** `content` → `lib/content` → `pages` → `features` → `lib/<domain>` / `bbge`. Do not reverse that arrow.

## Dual data plane

| Plane | When | Source | API |
|-------|------|--------|-----|
| **Build / SSG** | Server pages, `generateStaticParams`, metadata | `content/games/` via Node `fs` | `GameRepository` / `GameFactory` |
| **Client runtime** | Chat tool context, cover images | `public/data/` (generated) | `fetch("/boardgames/data/…")` |

Rules:

- Pages never invent a parallel content loader ([ADR-003](decisions/ADR-003-content-repository-no-axios.md)).
- Client fetches always use the `/boardgames/` prefix.
- Covers use `cover-manifest.json` only — no multi-extension `<img>` probing.
- `public/data/` is **generated**; edit `content/` (or cover files under `public/images/games/`), then rebuild.

## Build pipeline

| Hook | Script | Output |
|------|--------|--------|
| `prebuild` | `scripts/generate-game-data.mjs` | `games-meta.json`, `rules/<slug>.json`, `cover-manifest.json` |
| `build` | `next build` | static export under `out/` |
| `postbuild` | `generate-sw-precache.mjs`, `generate-seo.mjs` | SW precache list, sitemap/robots |

## Layers

| Path | Role |
|------|------|
| `content/games/` | Source of truth: `index.json`, per-game `meta.json`, `en\|zh/rules.md`, optional `flow.json` / `score.json` / `trainer.json` / `calculator.json` / `play.json` |
| `docs/games/<slug>.md` | Per-game **playable (BBGE)** design specs |
| `src/app/[locale]/` | **Server Components** — load data, SEO, hand props to feature UI |
| `src/features/` | Feature UI (`catalog`, `rules`, `flow`, `score`, `trainer`, `calculator`, `play`, `chat`, `costs`) |
| `src/shared/layout/` | Header, Footer, BackToTop |
| `src/lib/content/` | FS loaders (`GameRepository`, `GameFactory`, `markdown`) — only content warehouse |
| `src/lib/<domain>/` | Pure(ish) game logic: `mahjong`, `blackjack`, `texas-holdem`, `go`, `score`, `ai` |
| `src/lib/chat/` | Chat persistence helpers only — not React providers |
| `src/types/game.ts` | Shared content/feature types — do not add `src/lib/content/types.ts` |
| `bbge/` | Playable engine — do not fold into `features/` |
| `scripts/` | Lifecycle hooks only (prebuild / postbuild / icon regen) |

在线邀请链路的协议、恢复边界和测试要求见 [BBGE 邀请联机规范](bbge-networking.md)。
移动端桌面区域和滚动边界见 [BBGE 移动端界面规范](bbge-mobile-ui.md)。

Stack ADRs: [no Vite SPA](decisions/ADR-001-next-static-export.md), [no Ant Design/Less](decisions/ADR-002-keep-tailwind-not-antd.md), [no axios/Zustand](decisions/ADR-003-content-repository-no-axios.md).

## Feature extension points

| Feature | Content | Page | UI / dispatch | Domain |
|---------|---------|------|---------------|--------|
| Rules | `en\|zh/rules.md` | `games/[slug]/page.tsx` | `features/rules` | — |
| Flow | root `flow.json` (`startNode`) | `…/flow/page.tsx` | [`DecisionTree`](../src/features/flow/DecisionTree.tsx) | — |
| Score | `score.json` | `…/score/page.tsx` | [`score/registry.tsx`](../src/features/score/registry.tsx) ([gate](score-system.md)) | `src/lib/score/` |
| Trainer | `trainer.json` | `…/trainer/page.tsx` | [`trainer/registry.tsx`](../src/features/trainer/registry.tsx) | `src/lib/<game>/` |
| Calculator | `calculator.json` | `…/calculator/page.tsx` | `features/calculator` | `src/lib/mahjong/` |
| Play (BBGE) | `play.json` | `…/play/page.tsx` | `features/play` → bbge runtime | `bbge/*` + [`docs/games/`](games/) |
| Chat | runtime `public/data` | `ChatToggle` | `features/chat` | `src/lib/ai/`, `src/lib/chat/` |
| Catalog | summaries | `[locale]/page.tsx` | `features/catalog` | — |
| Costs | `meta.price` | `…/costs/page.tsx` | `features/costs` | — |

Pattern for gated features: config exists in content → `generateStaticParams` filters → page loads config → registry (or single component) renders client UI.

### Adding a BBGE playable game

Follow **[add-game Step 6d](../.cursor/skills/add-game/SKILL.md)** + **[BBGE skill](../.cursor/skills/browser-board-game-engine/SKILL.md)**:

1. Design `docs/games/<slug>.md`
2. Plugin + `PluginPlayModule` under `bbge/plugins/<pluginId>/`
3. Table UI uses shared `BattleLogList` + `PlaySideSheet` for 战报
4. `registerPlayModule` in `src/lib/bbge/registerPlayPlugins.ts`
5. Optional LLM factory in `src/lib/bbge/llmSeats.ts`
6. `content/games/<slug>/play.json` → `pluginId`
7. `npm run test:bbge` + `npm run build` → push `origin/main`

### Adding a trainer type

1. Domain logic under `src/lib/<game>/`
2. UI under `src/features/trainer/`
3. Register in `src/features/trainer/registry.tsx`
4. Ship `trainer.json` — see [trainer-system.md](trainer-system.md) and `.claude/skills/add-trainer`

### Adding a dedicated score tracker

Follow **[add-score-tracker](../.claude/skills/add-score-tracker/SKILL.md)** + **[score-system.md](score-system.md)**. **Default is skip.**

If the gate passes:

1. Add type to `ScoreConfigType` in `src/types/game.ts`
2. Component under `src/features/score/`
3. Register in `src/features/score/registry.tsx`
4. Set the game's `score.json` `type`

## Server vs client

- Keep `src/app/[locale]/**/page.tsx` as Server Components.
- Put `"use client"` under `src/features/` or `src/shared/`, not on whole game pages just for hooks.
- React providers that hold UI state live next to their feature UI (`features/chat/ChatProvider.tsx`).

## Red lines

- Static export only: no API routes, middleware, or runtime Node features in the app.
- Preserve `basePath` / trailing slashes in links and SEO helpers (`src/lib/seo.ts`).
- Service worker: network-first for HTML/`/data/`; do not break navigation fallbacks; do not auto-reload on first `controllerchange`.
- Do not reintroduce monolithic `games-index.json`.
- Do not add Ant Design, Less, axios, Zustand, or empty per-feature `services/` folders.

## Related docs & skills

| Doc / skill | Use when |
|-------------|----------|
| [`CLAUDE.md`](../CLAUDE.md) | Commands, i18n quirks, family system, cover/chat overview |
| [`development-guide.md`](development-guide.md) | How to change the repo |
| [`project-structure.md`](project-structure.md) | Directory roles |
| [`design-patterns.md`](design-patterns.md) | Patterns in use |
| [`docs/decisions/`](decisions/) | ADRs |
| [`.cursor/rules/code-modification.mdc`](../.cursor/rules/code-modification.mdc) | Layer / feature wiring while editing |
| [`docs/score-system.md`](score-system.md) | Score tracker gate |
| [`docs/trainer-system.md`](trainer-system.md) | Trainer anatomy |
| [`docs/games/`](games/) | BBGE play designs |
| [`.cursor/skills/page-development`](../.cursor/skills/page-development/SKILL.md) | New App Router page |
| [`.cursor/skills/component-development`](../.cursor/skills/component-development/SKILL.md) | UI + tokens |
| [`.cursor/skills/testing`](../.cursor/skills/testing/SKILL.md) | lint / build / bbge tests |
| `.cursor/skills/add-game/SKILL.md` | New game / expansion |
| `.claude/skills/add-score-tracker` | Score tracker skip vs add |
| `.claude/skills/add-trainer` | New trainer type |
| `.cursor/skills/browser-board-game-engine` | Playable engine |
