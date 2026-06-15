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
- Messages are direct JSON imports (`messages/en.json`, `messages/zh.json`)
- `@/i18n/request.ts` exists only to satisfy next-intl's config requirement; actual locale is passed via `NextIntlClientProvider` in `[locale]/layout.tsx`
- No middleware — static export can't use it

### Content System (File-Based, No CMS)

All game data lives in `content/games/<slug>/`:

```
content/games/
  index.json              # Array of all game slugs
  <slug>/
    meta.json             # GameMeta (name, players, duration, difficulty, tags, category)
    en/rules.md           # English rules (markdown)
    zh/rules.md           # Chinese rules (markdown)
    en/flow.json          # Optional decision tree (FlowData)
    zh/flow.json
```

- `scripts/generate-game-data.mjs` runs at build time (`prebuild`) to bundle all game data into `public/data/games-index.json`
- `GameRepository` reads from `content/games/` at build time via `fs` (Node filesystem)
- `GameFactory.createGame(slug, locale)` assembles the full `Game` object
- `GameFactory.createGameSummary(slug)` creates lightweight summary (no rules content, just meta + hasFlow flag)

### Design System

- **Tailwind CSS v4** via `@tailwindcss/postcss`
- Custom theme tokens in `src/app/globals.css` (`@theme` block): warm wood/amber palette
- Fonts: Fredoka (headings), Nunito (body), Noto Sans SC (Chinese) — loaded via Google Fonts `<link>` in root layout
- No dark mode

### Key Dependencies

- **next-intl** `^4.8.3` — i18n with direct JSON import (static-friendly)
- **react-markdown** + **remark-gfm** — rules rendering
- **idb-keyval** — IndexedDB key-value storage (API key persistence)
- **openai** `^6.42.0` — DeepSeek chat (uses OpenAI-compatible endpoint)

### Chat System

- Chat context managed by `ChatProvider` (`src/lib/chat/ChatProvider.tsx`)
- API key stored client-side in IndexedDB via `idb-keyval`
- Chat is scoped: `global` (on homepage) or `game` (on game pages with rule context)
- Floating FAB button → dialog with messages + input + API key modal

### Homepage Bentō Grid

- `GameCardGrid` renders a bentō grid with `grid-flow-dense`: card games span 1×2 (tall), board games span 2×1 (wide), others 1×1
- Tags split into two categories: functional (always visible, accent-styled) and descriptive (truncatable, overflow-hidden)
- Filtering: sidebar (desktop) / horizontal scroll strips (mobile)

### Types

Core types in `src/types/game.ts`:
- `GameMeta` — slug, name (bilingual), players, duration, difficulty, tags, category
- `Game` — meta + rules (markdown string) + flow (FlowData | null)
- `GameSummary` — lightweight: meta + hasFlow (no rules content)
- `FlowData` — startNode + nodes record (decision tree)
