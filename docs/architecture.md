# Architecture Blueprint

Cross-feature map of The Game Shelf. For day-to-day commands and feature details, see [`CLAUDE.md`](../CLAUDE.md). For trainers specifically, see [`docs/trainer-system.md`](trainer-system.md).

## Overview

Static Next.js App Router site (`output: "export"`, `basePath: "/boardgames"`, `trailingSlash: true`). Content is file-based; there is no CMS, API routes, or runtime Node server.

```
content/games ──► GameRepository / GameFactory ──► app/[locale] pages ──► components
       │                                                              │
       └──► prebuild (generate-game-data) ──► public/data ──► client fetch (chat, covers)
```

**Dependency direction:** `content` → `lib/content` → `pages` → `components` → `lib/<domain>`. Do not reverse that arrow (e.g. domain libs must not import pages).

## Dual data plane

| Plane | When | Source | API |
|-------|------|--------|-----|
| **Build / SSG** | Server pages, `generateStaticParams`, metadata | `content/games/` via Node `fs` | `GameRepository` / `GameFactory` |
| **Client runtime** | Chat tool context, cover images | `public/data/` (generated) | `fetch("/boardgames/data/…")` |

Rules:

- Pages never invent a parallel content loader.
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
| `docs/games/<slug>.md` | Per-game **playable (BBGE)** design specs — one file per slug when Play is planned or shipped |
| `src/app/[locale]/` | **Server Components** — load data, SEO, hand props to client roots |
| `src/components/` | UI; `"use client"` on interactive pieces (including providers like `ChatProvider`) |
| `src/lib/content/` | FS loaders (`GameRepository`, `GameFactory`, `markdown`) |
| `src/lib/<domain>/` | Pure(ish) game logic: `mahjong`, `blackjack`, `texas-holdem`, `go`, `score/engines`, `ai` |
| `src/lib/chat/` | Chat persistence helpers only (`storage`, `types`, `errors`) — not React providers |
| `src/types/game.ts` | Shared content/feature types — do not add `src/lib/content/types.ts` |
| `scripts/` | Lifecycle hooks only (prebuild / postbuild / icon regen) |

## Feature extension points

| Feature | Content | Page | UI / dispatch | Domain |
|---------|---------|------|---------------|--------|
| Rules | `en\|zh/rules.md` | `games/[slug]/page.tsx` | `MarkdownRenderer`, … | — |
| Flow | root `flow.json` (`startNode`) | `…/flow/page.tsx` | `DecisionTree` | — |
| Score | `score.json` | `…/score/page.tsx` | [`score/registry.tsx`](../src/components/game/score/registry.tsx) → dedicated multi-round trackers | `src/lib/score/` (input helpers) |
| Trainer | `trainer.json` | `…/trainer/page.tsx` | [`trainer/registry.tsx`](../src/components/game/trainer/registry.tsx) | `src/lib/<game>/` |
| Calculator | `calculator.json` | `…/calculator/page.tsx` | `ScoreCalculator` | `src/lib/mahjong/` |
| Play (BBGE) | `play.json` (+ optional `editions`) | `…/play/page.tsx` | PlayShell → bbge runtime + plugin table UI (Love Letter: BGA DOM, full/premium); **开始游戏** first in `GameHeader` (edition menu when configured); homepage Play Now | `bbge/*` + `plugins/<pluginId>`; design in [`docs/games/<slug>.md`](games/) |
| Chat | runtime `public/data` | `ChatToggle` on home/game pages | `components/chat/*` + `ChatProvider` | `src/lib/ai/`, `src/lib/chat/` |

Pattern for gated features: config exists in content → `generateStaticParams` filters → page loads config → registry (or single component) renders client UI.

### Adding a BBGE playable game

Follow **[add-game Step 6d](../.cursor/skills/add-game/SKILL.md)** + **[BBGE skill](../.cursor/skills/browser-board-game-engine/SKILL.md)** (“Adding a new playable game”):

1. Design `docs/games/<slug>.md`
2. Plugin + `PluginPlayModule` under `bbge/plugins/<pluginId>/`
3. Table UI uses shared `BattleLogList` + `PlaySideSheet` for 战报
4. `registerPlayModule` in `src/lib/bbge/registerPlayPlugins.ts` (PlayShell stays generic)
5. Optional LLM factory in `src/lib/bbge/llmSeats.ts` (locale-aware `speak`; append `opts.battleLog`)
6. `content/games/<slug>/play.json` → `pluginId`
7. `npm run test:bbge` + `npm run build` → push `origin/main`

### Adding a trainer type

1. Domain logic under `src/lib/<game>/`
2. UI under `src/components/game/trainer/`
3. Register in `src/components/game/trainer/registry.tsx` (component + titles/descriptions)
4. Ship `trainer.json` on the game — see [trainer-system.md](trainer-system.md) and `.claude/skills/add-trainer`

### Adding a dedicated score tracker

1. Add type to `ScoreConfigType` in `src/types/game.ts`
2. Component under `src/components/game/score/`
3. Register in `src/components/game/score/registry.tsx`
4. Set the game's `score.json` `type`

## Server vs client

- Keep `src/app/[locale]/**/page.tsx` as Server Components.
- Put `"use client"` under `src/components/`, not on whole game pages just for hooks.
- React providers that hold UI state live next to their feature UI (e.g. `components/chat/ChatProvider.tsx`).

## Red lines

- Static export only: no API routes, middleware, or runtime Node features in the app.
- Preserve `basePath` / trailing slashes in links and SEO helpers (`src/lib/seo.ts`).
- Service worker: network-first for HTML/`/data/`; do not break navigation fallbacks; do not auto-reload on first `controllerchange`.
- Do not reintroduce monolithic `games-index.json`.

## Related docs & skills

| Doc / skill | Use when |
|-------------|----------|
| [`CLAUDE.md`](../CLAUDE.md) | Commands, i18n quirks, family system, cover/chat overview |
| [`.cursor/rules/code-modification.mdc`](../.cursor/rules/code-modification.mdc) | Layer / feature wiring norms while editing |
| [`docs/trainer-system.md`](trainer-system.md) | Trainer anatomy and how to add types |
| [`docs/games/`](games/) | Per-game BBGE play designs (`<slug>.md`) |
| [`.cursor/skills/browser-board-game-engine/`](../.cursor/skills/browser-board-game-engine/SKILL.md) | Playable engine platform |
| `.cursor/skills/add-game/SKILL.md` | End-to-end new game / expansion (rules content) |
| `.claude/skills/add-trainer` | New trainer type checklist |
