# The Game Shelf — Board Game Rules Reference

> [中文版 / Chinese version](README.md)

A curated, bilingual reference website for modern board game rules — 45 games (including expansions/variants), interactive decision trees, trainers, LLM-powered Q&A, deployed as a pure static site to GitHub Pages.

## Features

- **45 game rules**: web-verified, complete bilingual rules (EN/ZH)
- **39 interactive decision trees**: step-by-step flow with sidebar outline navigation
- **7 automatic score trackers**: 5 types (`cabo-multi` / `sea-salt-multi` / `just-wild-multi` / `category` / `feature-calc`), localStorage persistence
- **Trainers**: Mahjong/Riichi tenpai trainer (4 difficulty levels), Blackjack basic strategy trainer, Texas Hold'em GTO preflop trainer
- **Score Calculator**: Riichi Mahjong han/fu/points auto calculator — visual tile picker (14 tiles) → mark winning tile → mark open melds → auto hand decomposition, yaku detection, fu & points calculation
- **Game family grouping**: UNO, Drecksau, Legends of the Three Kingdoms, Exploding Kittens, Splendor, Sea Salt & Paper, Catan, Carcassonne, Wingspan, Mahjong, Love Letter series
- **DLC / variant support**: expansions and standalone variants with stacked card UI (UNO DOS, Carcassonne: The River, Love Letter Premium, etc.)
- **Export**: PDF (browser print) or Markdown download
- **LLM chat**: DeepSeek-powered Q&A assistant (global + per-game scope), lazy-loaded on click
- **Per-game SEO**: individual title / description / OG tags per game page
- **Self-hosted fonts**: next/font with Fredoka, Nunito, Noto Sans SC (no render blocking)
- **Bilingual**: full i18n for UI text and game content
- **Player count filter**: filter games by number of players
- **PWA offline support**: add to home screen for full offline access (rules, decision trees, score trackers, trainers); AI chat gracefully degrades offline

## Quick Start

```bash
# Install dependencies (Node.js >= 20.9.0)
npm install

# Start dev server
npm run dev

# Build static site
npm run build
```

---

## Tech Stack

| Choice | Decision | Reason |
|--------|----------|--------|
| Framework | Next.js App Router | Static export + server components + rich ecosystem |
| Export | `output: 'export'` | Pure static hosting on GitHub Pages |
| Styling | Tailwind CSS v4 | Utility-first, responsive-friendly |
| i18n | next-intl (no middleware) | Middleware incompatible with static export; `[locale]` directory routing |
| Content | Markdown (free-form) | Flexible authoring, no schema constraints |
| Rendering | react-markdown + remark-gfm (Server Component) | GFM tables, task lists; zero client JS |
| Fonts | `next/font` (Google) | Self-hosted, subset, no render blocking |
| LLM SDK | OpenAI SDK → DeepSeek (lazy-loaded) | Loaded on click, saves ~100KB initial JS |
| Chat storage | idb-keyval (IndexedDB) | Persistent chat history, simple API |

---

## Game List

### Standalone

| Game | Rules | Decision Tree | Score |
|------|:-----:|:-------------:|:-----:|
| Texas Hold'em | ✅ | ✅ | 🎯 GTO Preflop |
| Harmonies | ✅ | ✅ | — |
| Modern Art | ✅ | ✅ | — |
| GoTown | ✅ | ✅ | — |
| Just Wild | ✅ | ✅ | ✅ |
| The Message: Attack by Stratagem | ✅ | ✅ | — |
| Cabo | ✅ | ✅ | ✅ (Multi-player) |
| The 21st Constellation | ✅ | ✅ | — |
| Arena Magnate: Haw! | ✅ | ✅ | — |
| Rummikub | ✅ | ✅ | — |
| Blackjack | ✅ | ✅ | 🎯 Strategy Trainer |
| TRIO | ✅ | ✅ | — |
| Bomb Busters | ✅ | ✅ | — |
| Spots | ✅ | ✅ | — |
| Tic Tac Trek | ✅ | ✅ | — |
| Art Robbery | ✅ | ✅ | — |
| Odin | ✅ | ✅ | ✅ |
| Halli Galli | ✅ | ✅ | — |

### Series

| Series | Game | Type | Rules | Decision Tree | Score |
|--------|------|------|:-----:|:-------------:|:-----:|
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
| Sea Salt & Paper | Sea Salt & Paper | Base | ✅ | ✅ | ✅ |
| | Extra Salt | DLC (req. base) | ✅ | — | ✅ |
| Catan | Catan | Base | ✅ | ✅ | ✅ |
| | China Map | Variant (standalone) | ✅ | — | ✅ |
| Carcassonne | Carcassonne | Base | ✅ | ✅ | ✅ |
| | The River | DLC (req. base) | ✅ | — | — |
| Mahjong | Mahjong | Base | ✅ | ✅ | 🎯 Trainer |
| | Riichi Mahjong | Variant (standalone) | ✅ | ✅ | 🎯 Trainer |
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

public/data/
├── games-meta.json               # Lightweight index (metadata only, for chat / system prompt)
├── cover-manifest.json           # Cover image format map (scanned at build time)
└── rules/{slug}.json             # Per-game rules (on-demand loading)

src/
├── app/[locale]/                 # Page routes
├── components/
│   ├── home/                     # GameCard, GameFamilyCard, GameCardGrid, GameCover, Sidebar
│   ├── game/                     # GameHeader, MarkdownRenderer, DecisionTree, ExportButton, RelatedGames
│   ├── game/score/               # ScoreTracker, CaboScoreTracker, SeaSaltScoreTracker, JustWildScoreTracker, CardSelector, FeatureInput, ScoreDisplay
│   ├── game/trainer/             # TenpaiTrainer, PreflopTrainer, PreflopChart, MahjongTile, TileSelector, TrainerStats, InlineTile
│   ├── game/calculator/          # ScoreCalculator, HandPicker, AgariSelector, MeldMarker, ScoreResult
│   ├── chat/                     # ChatToggle, ChatIsland (lazy-loaded), ChatDialog, ChatMessages
│   └── layout/                   # Header, Footer, BackToTop
├── lib/constants.ts              # Shared constants (categoryGradients, difficultyColors, variantBadge)
├── lib/content/                  # Content layer (Repository + Factory pattern, with memory cache)
├── lib/mahjong/                  # Mahjong core library (tiles, winCheck, tenpai, hand generation, shortcode, scoring, handAnalyzer)
├── lib/remark-mahjong-tiles.ts   # Remark plugin: parses [3m] shortcodes into inline tile components
├── lib/score/                    # Score tracker (useScoreState hook + localStorage storage)
├── lib/score/engines/            # Generic scoring engine factory (sea-salt / card-select / card-type / category / feature-calc)
├── lib/texas-holdem/             # Texas Hold'em core library (GTO preflop strategy tables, scenario generation)
├── lib/ai/                       # DeepSeekAdapter, ChatStrategies, tool-handlers
└── types/                        # TypeScript type definitions
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
| `category` | `string` | ✅ | Category (board / card / party etc.) |
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
| `/en/games/catan` | Rule page: header + rules + export + related games + chat |
| `/en/games/catan/flow` | Interactive decision tree (only if `flow.json` exists) |
| `/en/games/catan/score` | Score tracker (only if `score.json` exists) |

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
- Action buttons: decision tree (if available) + export (PDF / Markdown)
- MarkdownRenderer: renders rule content
- RelatedGames: same-series navigation (if family grouping exists)
- ChatToggle: LLM chat in bottom-right corner

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
| API | DeepSeek API (OpenAI-compatible) |
| Base URL | `https://api.deepseek.com` |
| Model | `deepseek-v4-pro` |
| API Key | User-provided, stored in `localStorage` |
| Homepage chat | **Global**: LLM fetches any game's rules via tool calls |
| Game page chat | **Scoped**: system prompt preloaded with full rules |
| History | IndexedDB, separate history per scope |

---

## Design Patterns

| Pattern | Used In | Purpose |
|---------|---------|---------|
| **Repository** | `GameRepository.ts` | Encapsulate filesystem content access |
| **Factory** | `GameFactory.ts` | Assemble Game domain objects |
| **Strategy** | `GlobalChatStrategy` / `GameChatStrategy` | Different prompts & tools per chat scope |
| **Adapter** | `DeepSeekAdapter.ts` | Isolate LLM provider, easy to swap |
| **Context+Provider** | `ChatProvider.tsx` | Manage messages, streaming state, API key |

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

1. **Build-time file reads** — `fs.readFileSync` runs only during `next build`; 45 games is trivially fast
2. **`dangerouslyAllowBrowser: true`** — API key is user-provided, no server; explicitly enable browser-side calls
3. **Tool call limit** — Max 5 iterations to prevent infinite loops
4. **No middleware** — next-intl middleware incompatible with `output: 'export'`
5. **`trailingSlash: true`** — Required for GitHub Pages subdirectory routing
6. **Family grouping** — `family` field for logical association, `familyOrder` for sorting, `variantType` for display
7. **Export** — PDF via browser print, Markdown via Blob download, zero external dependencies

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
