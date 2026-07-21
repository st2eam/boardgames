# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

```bash
npm run dev          # Start dev server (Turbopack, Node >= 22)
npm run build        # Prebuild game data + static export
npm run lint         # ESLint
```

## Architecture

**Next.js 16.2.4** (Turbopack) with **`output: "export"`** and **`trailingSlash: true`**. Static HTML only — no SSR, no API routes.

### Bilingual Routing (next-intl)

- Locales: `en`, `zh` (defined in `src/i18n/routing.ts`)
- `[locale]` directory routing: every page lives under `src/app/[locale]/`
- Messages: direct JSON imports (`messages/en.json`, `messages/zh.json`)
- `@/i18n/request.ts` exists only to satisfy next-intl's config requirement; actual locale passed via `NextIntlClientProvider` in `[locale]/layout.tsx`
- No middleware — static export can't use it

### Content System (File-Based, No CMS)

All game data lives in `content/games/<slug>/`:

```
content/games/
  index.json              # Array of all game slugs
  <slug>/
    meta.json             # GameMeta (name, players, duration, difficulty, tags, category, family info)
    en/rules.md           # English rules (markdown)
    zh/rules.md           # Chinese rules (markdown)
    flow.json             # Optional interactive decision tree (bilingual FlowData at game root)
    score.json / trainer.json / calculator.json  # Optional feature configs
```

- `scripts/generate-game-data.mjs` runs at build time (`prebuild`) to write `public/data/games-meta.json`, per-game `rules/*.json`, and `cover-manifest.json`
- `GameRepository` reads from `content/games/` at build time via `fs` (Node filesystem)
- `GameFactory.createGame(slug, locale)` assembles the full `Game` object
- `GameFactory.createGameSummary(slug)` creates lightweight summary (no rules content, just meta + hasFlow + family info)

### Design System

- **Tailwind CSS v4** via `@tailwindcss/postcss`
- Custom theme tokens in `src/app/globals.css` (`@theme` block): warm wood/amber palette
  - Primary: `#5D4037`, Accent: `#C4952A`, Surface: `#FAFAF5`
- Fonts: Fredoka (headings), Nunito (body), Noto Sans SC (Chinese) — loaded via Google Fonts `<link>` in root layout
- No dark mode

### Family / Series System

Games can belong to a family (e.g., UNO, Exploding Kittens, Sanguosha, Dirty Pig). Meta fields:

| Field | Type | Description |
|-------|------|-------------|
| `family` | `string` | Identifier shared by all games in the family |
| `familyOrder` | `number` | Sort order (0 = base, 1+ = variants/expansions) |
| `variantType` | `"base" \| "expansion" \| "variant"` | Type label shown on card |
| `requiresBase` | `boolean` | Whether expansion/variant requires the base game |

**Series tags** are auto-derived from the `family` field at render time — no manual tag entry needed. The base game's name + " series" / "系列" suffix becomes a sidebar/mobile tag with purple accent styling.

**Homepage behavior:**
- No filter active → family games render as a single `GameFamilyCard` (stacked look with +N badge). Single-game families render as regular `GameCard`.
- Series tag selected → families flatten: each game renders individually, family members side-by-side

### Decision Tree (Interactive Flow)

29 games have `flow.json` decision trees. Each flow defines:
- `startNode` — entry point key
- `nodes` — record of `{ title: {en, zh}, content: markdown, options: [{label: {en, zh}, next: nodeId}] }`

`DecisionTree` component:
- Left sidebar outline showing all nodes with current-node highlight (mobile: slide-out)
- Breadcrumb trail using chevron separators
- Markdown content area with related-topic option buttons at bottom
- Back / Start Over navigation buttons

### Export Feature

`ExportButton` component on game pages:
- Dropdown with "Export as PDF" and "Download Markdown"
- PDF: opens a new window, renders markdown to styled HTML via custom inline parser, triggers `window.print()`
- Markdown: downloads raw `.md` file via Blob URL

### Key Dependencies

- **next-intl** `^4.8.3` — i18n with direct JSON import (static-friendly)
- **react-markdown** + **remark-gfm** — rules rendering
- **idb-keyval** — IndexedDB key-value storage (API key persistence)
- DeepSeek chat via Anthropic-compatible Messages API (`api.deepseek.com/anthropic`) with client tools + server-side `web_search`

### Chat System

- `ChatProvider` (`src/lib/chat/ChatProvider.tsx`) manages global chat state
- API key stored client-side in IndexedDB via `idb-keyval`
- Two scopes: `global` (homepage — "Ask about any game") and `game` (game pages with rule context)
- Floating FAB button + dialog with messages, input, and API key modal
- `ChatToggle` component placed on game pages; `FloatingChatButton` on homepage

### Homepage Layout

- `HeroBanner`: site title + subtitle + game count badge with decorative elements
- `GameCardGrid`: bentō grid with `grid-flow-dense`
  - card games: 1×2 (tall), board games: 2×1 (wide), others: 1×1
  - Tags: all rendered, overflow clipped; "Decision Tree" tag styled with accent colors
- `Sidebar`: desktop sticky panel with category buttons, tag chips (series tags highlighted in purple), game count
- Mobile: horizontal scroll strip for categories + tag chip strip below
- `BackToTop`: fixed button at `bottom-20 right-4` (above chat FAB at `bottom-4 right-4`), appears after scrolling >400px
- Header: site title (`home.title` from i18n) + language switcher only (no nav links)
- Footer: site title + GitHub link

### Cover Image System

Cover images live in `public/images/games/<slug>.<ext>` (webp, png, jpg, jpeg).

**Build-time manifest generation** (`scripts/generate-game-data.mjs`):
- Scans `public/images/games/` at prebuild time
- Generates `public/data/cover-manifest.json` — `{ "<slug>": "<ext>" }` mapping
- Reports missing covers in build output (e.g., `Missing: carcassonne-the-river`)

**Runtime** (`GameCover` component in `src/components/home/GameCover.tsx`):
- Fetches `cover-manifest.json` on first load (cached in memory)
- Loads the correct format directly — no `<img>` tag at all for games without covers
- Missing covers render with gradient placeholder, **zero 404s**

**Adding a cover:** drop the image file into `public/images/games/<slug>.<ext>` — prebuild picks it up automatically. No code changes needed.

### Score Calculator System

Score calculators are powered by `content/games/<slug>/score.json`. The `type` field determines which component renders:

| Type | Component | Games |
|------|-----------|-------|
| `cabo-multi` | `CaboScoreTracker` | CABO |
| `sea-salt-multi` | `SeaSaltScoreTracker` | Sea Salt Paper |
| `just-wild-multi` | `JustWildScoreTracker` | Just Wild (荒野之王) |
| `category` / others | `ScoreTracker` (generic engine-based) | Catan, Carcassonne, etc. |

Custom tracker components are self-contained with their own UI, localStorage persistence, and multi-player support. The generic `ScoreTracker` uses pluggable engines defined in `src/lib/score/engines/`.

**ScoreConfigType** (in `src/types/game.ts`) lists all valid types. To add a new dedicated tracker:
1. Add the type string to `ScoreConfigType`
2. Create the component in `src/components/game/score/`
3. Route it in `score/page.tsx` `ScoreContent`
4. Set the game's `score.json` to the new type

### Types

Core types in `src/types/game.ts`:
- `GameMeta` — slug, name (bilingual), players, duration, difficulty, tags, category, family*, variantType*, requiresBase*, price
- `Game` — meta + rules (markdown string) + flow (FlowData | null)
- `GameSummary` — lightweight: meta + hasFlow + hasScore + hasTrainer + family* (no rules content)
- `FlowData` — startNode + nodes record
- `FlowNode` — title (bilingual), content (bilingual markdown), options array
- `FlowOption` — label (bilingual), next (node key)
- `ScoreConfig` — type, engine, direction, players, multiRound, target/targetByPlayers, categories/cards/features
