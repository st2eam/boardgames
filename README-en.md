# The Game Shelf — Board Game Rules Reference

> [中文版 / Chinese version](README.md)

A curated, bilingual reference website for modern board game rules — 46 games (including expansions/variants), interactive decision trees, trainers, LLM-powered Q&A, deployed as a pure static site to GitHub Pages.

## Features

- **46 game rules**: web-verified, complete bilingual rules (EN/ZH)
- **40 interactive decision trees**: step-by-step flow with sidebar outline navigation
- **7 automatic score trackers**: `cabo-multi` / `sea-salt-multi` / `just-wild-multi` / `category` / `feature-calc`, localStorage persistence
- **5 trainers**: Mahjong/Riichi tenpai, Blackjack basic strategy, Texas Hold'em GTO preflop, Go tsumego
- **Score calculator**: Riichi Mahjong han/fu/points — tile picker → winning tile → open melds → auto yaku/fu/points
- **Game family grouping**: UNO, Drecksau, LotTK, Exploding Kittens, Splendor, Sea Salt & Paper, Catan, Carcassonne, Wingspan, Mahjong, Love Letter
- **DLC / variant support**: stacked family cards for expansions and standalone variants
- **Export**: PDF (browser print) or Markdown download
- **LLM chat**: DeepSeek Anthropic Messages API (`deepseek-v4-pro`) with on-site rules tool + server-side web search; desktop fullscreen; streamed activity UI (thinking / search / rules)
- **Per-game SEO**: individual title / description / OG tags per game page
- **Self-hosted fonts**: next/font with Fredoka, Nunito, Noto Sans SC
- **Bilingual**: full i18n for UI text and game content
- **Player count filter**: filter games by number of players
- **PWA offline support**: rules/trees/scores/trainers offline; AI chat degrades when offline

## Quick Start

```bash
# Install dependencies (Node.js >= 20)
npm install

# Start dev server
npm run dev

# Build static site (prebuild generates games-meta / rules / cover-manifest)
npm run build
```

> **Maintenance**: after adding games, refresh the feature counts and game tables below (currently `46` / `40` flow / `7` score / `5` trainer / `1` calculator). Run `node scripts/print-project-stats.mjs` to verify.

---

## Tech Stack

| Choice | Decision | Reason |
|--------|----------|--------|
| Framework | Next.js 16.2 App Router | Static export + server components |
| Export | `output: 'export'` | Pure static hosting on GitHub Pages |
| Styling | Tailwind CSS v4 | Utility-first, responsive-friendly |
| i18n | next-intl (no middleware) | Incompatible with static export; `[locale]` routing |
| Content | Markdown (free-form) | Flexible authoring |
| Rendering | react-markdown + remark-gfm (RSC) | GFM tables; zero client JS for rules |
| Fonts | `next/font` (Fredoka / Nunito / Noto Sans SC) | Self-hosted, subset |
| LLM | DeepSeek Anthropic Messages API (browser `fetch`, lazy) | Server `web_search` + client tools; no backend |
| Chat storage | idb-keyval (IndexedDB) | API key + history stored locally |

---

## Game List

### Standalone

| Game | Rules | Decision Tree | Score / Trainer |
|------|:-----:|:-------------:|:---------------:|
| Texas Hold'em | ✅ | ✅ | 🎯 GTO Preflop |
| Harmonies | ✅ | ✅ | — |
| Modern Art | ✅ | ✅ | — |
| GoTown | ✅ | ✅ | — |
| Just Wild | ✅ | ✅ | ✅ Score |
| The Message: Attack by Stratagem | ✅ | ✅ | — |
| Cabo | ✅ | ✅ | ✅ Score (multi) |
| The 21st Constellation | ✅ | ✅ | — |
| Arena Magnate: Haw! | ✅ | ✅ | — |
| Blackjack | ✅ | ✅ | 🎯 Strategy Trainer |
| TRIO | ✅ | ✅ | — |
| Bomb Busters | ✅ | ✅ | — |
| Spots | ✅ | ✅ | — |
| Tic Tac Trek | ✅ | ✅ | — |
| Art Robbery | ✅ | ✅ | — |
| Odin | ✅ | ✅ | ✅ Score |
| Halli Galli | ✅ | ✅ | — |
| Manila | ✅ | ✅ | — |
| Go | ✅ | ✅ | 🎯 Tsumego Trainer |

### Series

| Series | Game | Type | Rules | Decision Tree | Score / Trainer |
|--------|------|------|:-----:|:-------------:|:---------------:|
| UNO | UNO | Base | ✅ | ✅ | — |
| | UNO Flip | Variant | ✅ | ✅ | — |
| | UNO Show 'Em No Mercy | Variant | ✅ | ✅ | — |
| | UNO DOS | Variant | ✅ | — | — |
| Drecksau | Drecksau | Base | ✅ | ✅ | — |
| | Drecksau: Sauschön | DLC (req. base) | ✅ | — | — |
| Legends of the Three Kingdoms | LotTK | Base | ✅ | ✅ | — |
| | Disloyal Minister | DLC (req. base) | ✅ | ✅ | — |
| | Wind & Cloud Gathering | DLC (req. base) | ✅ | ✅ | — |
| Exploding Kittens | Exploding Kittens | Base | ✅ | ✅ | — |
| | NSFW Edition | Variant (standalone) | ✅ | — | — |
| Splendor | Splendor | Base | ✅ | ✅ | — |
| | Splendor: Pokémon | Variant (standalone) | ✅ | ✅ | — |
| Sea Salt & Paper | Sea Salt & Paper | Base | ✅ | ✅ | ✅ Score |
| | Extra Salt | DLC (req. base) | ✅ | — | — |
| Catan | Catan | Base | ✅ | ✅ | ✅ Score |
| | China Map | Variant (standalone) | ✅ | — | ✅ Score |
| Carcassonne | Carcassonne | Base | ✅ | ✅ | ✅ Score |
| | The River | DLC (req. base) | ✅ | — | — |
| Mahjong | Mahjong | Base | ✅ | ✅ | 🎯 Tenpai Trainer |
| | Riichi Mahjong | Variant (standalone) | ✅ | ✅ | 🎯 Trainer + 🧮 Calculator |
| Wingspan | Wingspan | Base | ✅ | ✅ | — |
| | Asia | DLC (req. base) | ✅ | ✅ | — |
| | Europe | DLC (req. base) | ✅ | ✅ | — |
| | Oceania | DLC (req. base) | ✅ | ✅ | — |
| Love Letter | Love Letter | Base | ✅ | ✅ | — |
| | Premium Edition | Variant (standalone) | ✅ | ✅ | — |

---

## Project Structure

```
content/games/
├── index.json                    # Game registry (slug array)
├── catan/
│   ├── meta.json                 # Game metadata
│   ├── flow.json                 # Optional: bilingual decision tree
│   ├── score.json                # Optional: score tracker config
│   ├── zh/rules.md               # Chinese rules
│   └── en/rules.md               # English rules
└── ... (45 games total)

public/data/                       # Generated by prebuild — not the source of truth
├── games-meta.json               # Lightweight index (chat system prompt)
├── cover-manifest.json           # Cover image format map
└── rules/{slug}.json             # Per-game rules (on-demand)

src/
├── app/[locale]/                 # Routes (costs + games/*/flow|score|trainer|calculator)
├── components/
│   ├── home/                     # Cards, family cards, cover, sidebar
│   ├── game/                     # Header, markdown, decision tree, export, related
│   ├── game/score/               # Generic + Cabo / SeaSalt / JustWild trackers
│   ├── game/trainer/             # Tenpai / Preflop / Blackjack / Go trainers
│   ├── game/calculator/          # Riichi han/fu calculator
│   ├── chat/                     # ChatToggle, ChatIsland (lazy), Dialog, Messages
│   └── layout/                   # Header, Footer, BackToTop
├── lib/content/                  # Repository + Factory
├── lib/mahjong/                  # Tenpai / scoring / yaku
├── lib/score/                    # Score hooks + engines
├── lib/texas-holdem/             # GTO preflop
├── lib/ai/                       # DeepSeekAdapter (Anthropic SSE), strategies, tools
├── lib/chat/                     # ChatProvider, error mapping, IndexedDB
└── types/                        # Shared TypeScript types
```

---

## Content Data Model

### meta.json

```json
{
  "name": { "en": "Catan", "zh": "卡坦岛" },
  "players": "3-4",
  "duration": "60-120 min",
  "difficulty": "medium",
  "tags": ["trading", "engine-building"],
  "category": "board",
  "family": "catan",
  "familyOrder": 0,
  "variantType": "base",
  "requiresBase": false
}
```

| Field | Type | Required | Description |
|-------|------|:--------:|-------------|
| `name` | `{en, zh}` | ✅ | Game name |
| `players` | `string` | ✅ | Player count range |
| `duration` | `string` | ✅ | Play duration |
| `difficulty` | `"easy" \| "medium" \| "hard"` | ✅ | Difficulty level |
| `tags` | `string[]` | ✅ | Tags |
| `category` | `"board" \| "card"` | ✅ | Category (homepage layout) |
| `family` | `string` |  | Series identifier |
| `familyOrder` | `number` |  | Sort order within series (0 = base) |
| `variantType` | `"base" \| "expansion" \| "variant"` |  | Base / expansion / variant |
| `requiresBase` | `boolean` |  | Whether base game is required |
| `price` | `number` |  | Price (CNY), 0 = free/already owned |

### flow.json (Decision Tree)

Single bilingual file at the game root. `title`, `content`, and `label` are all `{ "en": "...", "zh": "..." }` objects:

```json
{
  "startNode": "setup",
  "nodes": {
    "setup": {
      "title": { "en": "Game Setup", "zh": "游戏准备" },
      "content": {
        "en": "Place the board in the center... (Markdown)",
        "zh": "将棋盘放在桌子中央...（Markdown）"
      },
      "options": [
        { "label": { "en": "Your Turn", "zh": "轮到你了" }, "next": "turn" },
        { "label": { "en": "Scoring", "zh": "计分方式" }, "next": "scoring" }
      ]
    }
  }
}
```

A **directed graph**: each node is a rule snippet + jump options. `flow.json` is optional — if absent, no interactive entry appears on the page.

---

## Routes

| URL | Description |
|-----|-------------|
| `/` | → Redirects to `/en` |
| `/en` `/zh` | Homepage: game card grid + global AI chat |
| `/en/costs` | Cost tracker |
| `/en/games/catan` | Rule page: header + rules + export + related games + chat |
| `/en/games/catan/flow` | Interactive decision tree (only if `flow.json` exists) |
| `/en/games/catan/score` | Score tracker (only if `score.json` exists) |
| `/en/games/mahjong/trainer` | Trainer (only if `trainer.json` exists) |
| `/en/games/riichi-mahjong/calculator` | Calculator (only if `calculator.json` exists) |

---

## Page Features

### Homepage

- Hero banner with site title, subtitle, and game count badge
- Card grid with category, tag, and **player count** filtering
- Desktop: left Sidebar + right grid; Mobile: horizontal scroll strips
- Cards adapt layout by category (board → wide, card → tall)
- Family-grouped games rendered as stacked cards with `+N` badge, click to expand

### Game Rule Page

- GameHeader: title, players, duration, difficulty, tags
- Action buttons: flow / score / trainer / calculator (when configured) + export (PDF / Markdown)
- MarkdownRenderer: renders rule content
- RelatedGames: same-series navigation (if family grouping exists)
- ChatToggle: LLM chat (game/global switch; desktop fullscreen)

### Decision Tree

- Two-column layout: sidebar outline + content area
- Breadcrumb navigation, step indicator, back/start-over buttons
- Visited nodes and options visually marked
- Mobile: sidebar auto-collapses

### Export

| Format | Implementation |
|--------|---------------|
| PDF | New window with print-optimized HTML, triggers `window.print()` |
| Markdown | Client-side Blob download of raw `.md` file |

---

## LLM Chat

| Aspect | Detail |
|--------|--------|
| API | DeepSeek **Anthropic Messages** API (browser direct; no backend) |
| Base URL | `https://api.deepseek.com/anthropic` |
| Model | `deepseek-v4-pro` (thinking enabled by default) |
| API Key | User-provided, stored in IndexedDB (`idb-keyval`) |
| Homepage chat | **Global**: `get_game_rules` + server-side `web_search` |
| Game page chat | **Scoped**: rules in system prompt + optional web search |
| Stream UI | Per content-block activities: thinking / web search / rules / text |
| History | IndexedDB per scope; thinking must be replayed after tool turns |
| Note | Web search runs on DeepSeek; `unavailable` is a server-side limit |

---

## Design Patterns

| Pattern | Used In | Purpose |
|---------|---------|---------|
| **Repository** | `GameRepository.ts` | Encapsulate filesystem content access |
| **Factory** | `GameFactory.ts` | Assemble Game domain objects |
| **Strategy** | `GlobalChatStrategy` / `GameChatStrategy` | Different prompts & tools per chat scope |
| **Adapter** | `DeepSeekAdapter.ts` | Isolate LLM provider, easy to swap |
| **Context+Provider** | `ChatProvider.tsx` | Messages, stream activities, API key, error mapping |

---

## Localization

- Current: Chinese + English
- UI text: `messages/{locale}.json`
- Game content: `content/games/{slug}/{locale}/`
- To add a language: create the corresponding locale directories

---

## Deployment

- Platform: GitHub Pages
- CI: GitHub Actions (`actions/deploy-pages`)
- Config: `trailingSlash: true`

---

## Key Decisions

1. **Build-time file reads** — `fs.readFileSync` during `next build`; `public/data/*` is generated
2. **Lazy chat stack** — Anthropic SSE adapter + UI loaded only when the FAB is opened
3. **Browser → DeepSeek** — no API routes; user key + CORS; thinking must be echoed after tool calls
4. **Rules as RSC markdown** — `react-markdown` stays off the client bundle for rule pages
5. **Split data** — `games-meta.json` + per-slug `rules/*.json`
6. **No middleware** — incompatible with `output: 'export'`; use `[locale]` routes
7. **`trailingSlash: true`** — GitHub Pages subdirectory routing
8. **Family grouping** — `family` / `familyOrder` / `variantType`
9. **Zero cover 404s** — `cover-manifest.json`; missing covers skip `<img>`

---

## Adding a New Game

See [`.cursor/skills/add-game/SKILL.md`](.cursor/skills/add-game/SKILL.md) for the complete guide covering standalone games, DLCs, expansions, and variants.

Quick steps:

1. Create directory under `content/games/` with `meta.json`, `en/rules.md`, `zh/rules.md`
2. Optionally add `flow.json` at the game root (bilingual title/content/label)
3. Optionally add `score.json` for score tracking
4. Register the slug in `content/games/index.json`
5. If part of a series, add `family`, `familyOrder`, `variantType` to `meta.json`
6. Run `npm run build` to verify
