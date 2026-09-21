# The Game Shelf — Board Game Rules Reference

> [中文版 / Chinese version](README.md)

A curated, bilingual reference website for modern board game rules — **74** games (including expansions/variants), Markdown-defined interactive rules, trainers, **BBGE online play**, LLM-powered Q&A, deployed as a pure static site to GitHub Pages.

## Features

- **74 game rules**: web-verified, complete bilingual rules (EN/ZH)
- **Interactive rules in one Markdown source**: tabs, ordered/topic sidebars, and explicit decision helpers with full-rule and print fallbacks
- **4 multi-player score trackers**: CABO, Sea Salt & Paper, 6 nimmt!, Just Wild — running totals, localStorage
- **5 trainers**: Mahjong/Riichi tenpai, Blackjack basic strategy, Texas Hold'em GTO preflop, Go tsumego
- **8 BBGE online playables**: Love Letter, Texas Hold'em, 6 nimmt!, Go, CABO, UNO, TRIO, Rummikub. Peer invitations use revisioned snapshots, action acknowledgements, and same-session refresh recovery — see [`docs/bbge-networking.md`](docs/bbge-networking.md).
- **Score calculator**: Riichi Mahjong han/fu/points — tile picker → winning tile → open melds → auto yaku/fu/points
- **Game family grouping**: UNO, Drecksau, LotTK, Exploding Kittens, Splendor, Sea Salt & Paper, Catan, Carcassonne, Wingspan, Mahjong, Love Letter, SETI
- **DLC / variant support**: stacked family cards for expansions and standalone variants
- **Export**: PDF (browser print) or Markdown download
- **LLM chat**: DeepSeek Anthropic Messages API (`deepseek-v4-pro`) with on-site rules tool + server-side web search; desktop fullscreen; streamed activity UI (thinking / search / rules)
- **Per-game SEO**: individual title / description / OG tags per game page
- **Self-hosted fonts**: next/font with Fredoka, Nunito, Noto Sans SC
- **Bilingual**: full i18n for UI text and game content
- **Player count filter**: filter games by number of players
- **PWA offline support**: rules/interactions/scores/trainers offline; AI chat degrades when offline

## Quick Start

```bash
# Install dependencies (Node.js >= 20)
npm install

# Start dev server
npm run dev

# Build static site (prebuild generates games-meta / rules / cover-manifest)
npm run build
```

> **Maintenance**: after adding games, refresh the feature counts and game tables below (currently `74` / `4` score / `5` trainer / `1` calculator / `8` BBGE play). Run `node scripts/print-project-stats.mjs` and `node scripts/validate-game-content.mjs` to verify. Sync game behavior in [`docs/games/<slug>.md`](docs/games/) and invitation behavior in [`docs/bbge-networking.md`](docs/bbge-networking.md).

---

## Tech Stack

| Choice | Decision | Reason |
|--------|----------|--------|
| Framework | Next.js 16.2 App Router | Static export + server components |
| Export | `output: 'export'` | Pure static hosting on GitHub Pages |
| Styling | Tailwind CSS v4 | Utility-first, responsive-friendly |
| i18n | next-intl (no middleware) | Incompatible with static export; `[locale]` routing |
| Content | Markdown (free-form) | Flexible authoring |
| Rendering | remark AST + react-markdown + remark-gfm | One Markdown source; scoped client interaction with full/print/no-JS fallbacks |
| Fonts | `next/font` (Fredoka / Nunito / Noto Sans SC) | Self-hosted, subset |
| LLM | DeepSeek Anthropic Messages API (browser `fetch`, lazy) | Server `web_search` + client tools; no backend |
| Chat storage | idb-keyval (IndexedDB) | API key + history stored locally |

---

## Game List

### Standalone

| Game | Rules | Interactive rules | Score / Trainer / Play |
|------|:-----:|:-------------:|:---------------------:|
| Texas Hold'em | ✅ | ✅ | 🎯 GTO Preflop · 🎮 Cash table |
| The Gang | ✅ | ✅ | — |
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
| Odin | ✅ | ✅ | — |
| Halli Galli | ✅ | ✅ | — |
| Petiquette | ✅ | ✅ | — |
| Manila | ✅ | ✅ | — |
| Las Vegas Royale | ✅ | ✅ | — |
| Citadels | ✅ | ✅ | — |
| Decrypto | ✅ | ✅ | — |
| SCOUT | ✅ | ✅ | — |
| Startups | ✅ | ✅ | — |
| Durian | ✅ | ✅ | — |
| 7 Wonders | ✅ | ✅ | — |
| 6 nimmt! 30 Years Anniversary Edition | ✅ | ✅ | ✅ Score · 🎮 Multi-mode play |
| Palm Island | ✅ | ✅ | — |
| Brass: Birmingham | ✅ | ✅ | — |
| Go | ✅ | ✅ | 🎯 Tsumego · 🎮 9/13/19 play |

### Series

| Series | Game | Type | Rules | Interactive rules | Score / Trainer |
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
| | Cities of Splendor | DLC (req. base) | ✅ | ✅ | — |
| | Splendor: Pokémon | Variant (standalone) | ✅ | ✅ | — |
| Sea Salt & Paper | Sea Salt & Paper | Base | ✅ | ✅ | ✅ Score |
| | Extra Salt | DLC (req. base) | ✅ | — | — |
| Catan | Catan | Base | ✅ | ✅ | — |
| | China Map | Variant (standalone) | ✅ | — | — |
| Carcassonne | Carcassonne | Base | ✅ | ✅ | — |
| | The River | DLC (req. base) | ✅ | — | — |
| Mahjong | Mahjong | Base | ✅ | ✅ | 🎯 Tenpai Trainer |
| | Riichi Mahjong | Variant (standalone) | ✅ | ✅ | 🎯 Trainer + 🧮 Calculator |
| Wingspan | Wingspan | Base | ✅ | ✅ | — |
| | Asia | DLC (req. base) | ✅ | ✅ | — |
| | Europe | DLC (req. base) | ✅ | ✅ | — |
| | Oceania | DLC (req. base) | ✅ | ✅ | — |
| Love Letter | Love Letter | Base | ✅ | ✅ | 🎮 Online play (classic/full/expansion) |
| | Premium Edition | Variant (standalone) | ✅ | ✅ | 🎮 Defaults to expansion play |
| SETI | SETI | Base | ✅ | ✅ | — |
| | Space Agencies | DLC (req. base) | ✅ | ✅ | — |
| The Lord of the Rings: Duel for Middle-earth | Duel for Middle-earth | Base | ✅ | ✅ | — |
| | Allies | DLC (req. base) | ✅ | ✅ | — |

---

## Project Structure

```
content/games/
├── index.json                    # Game registry (slug array)
├── catan/
│   ├── meta.json                 # Game metadata
│   ├── score.json                # Optional: score tracker config
│   ├── zh/rules.md               # Chinese rules
│   └── en/rules.md               # English rules
└── ... (64 games total)

public/data/                       # Generated by prebuild — not the source of truth
├── games-meta.json               # Lightweight index (chat system prompt)
├── cover-manifest.json           # Cover image format map
└── rules/{slug}.json             # Per-game rules (on-demand)

src/
├── app/[locale]/                 # Routes (costs + games/*/score|trainer|calculator)
├── features/                     # Feature UI (catalog / rules / score / trainer / calculator / play / chat / costs)
├── shared/layout/                # Header, Footer, BackToTop
├── lib/content/                  # Repository + Factory
├── lib/mahjong/                  # Tenpai / scoring / yaku
├── lib/score/                    # Numeric input helpers
├── lib/texas-holdem/             # GTO preflop
├── lib/ai/                       # DeepSeekAdapter (Anthropic SSE), strategies, tools
├── lib/chat/                     # IndexedDB + error mapping (not React)
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

### rules.md (Complete rules + interaction protocol)

Each locale has one Markdown file. Use explicit `rule-section` markers on H2–H4
headings, then `rule-ui: tabs`, `rule-ui: sidebar`, or `rule-ui: decision` for
the intended interaction. Sidebar items use `rule-item`; decision links use
`rule-choices`. The same IDs, levels, order, and interaction type must appear
in both locales. See [`docs/rules-guide-system.md`](docs/rules-guide-system.md).

---

## Routes

| URL | Description |
|-----|-------------|
| `/` | → Redirects to `/en` |
| `/en` `/zh` | Homepage: game card grid + global AI chat |
| `/en/costs` | Cost tracker |
| `/en/games/catan` | Rule page: header + rules + export + related games + chat |
| `/en/games/catan` | Interactive guide by default; complete rules, print, and no-JS fallbacks are included |
| `/en/games/cabo/score` | Score tracker (only if `score.json` exists) |
| `/en/games/mahjong/trainer` | Trainer (only if `trainer.json` exists) |
| `/en/games/riichi-mahjong/calculator` | Calculator (only if `calculator.json` exists) |
| `/en/games/texas-hold-em/play/` | BBGE online play (only if `play.json` exists; Host / AI / share link) |

### BBGE online play (summary)

| Game | Spec | Highlights |
|------|------|------------|
| Love Letter | [`docs/games/love-letter.md`](docs/games/love-letter.md) | Classic / full / expansion; multi-round ♥ |
| Texas Hold'em | [`docs/games/texas-hold-em.md`](docs/games/texas-hold-em.md) | Cash multi-hand; showdown reveal |
| 6 nimmt! | [`docs/games/6-nimmt-30th-anniversary.md`](docs/games/6-nimmt-30th-anniversary.md) | Multi-mode; trap-aware heuristics |
| Go | [`docs/games/go.md`](docs/games/go.md) | 9/13/19; liberty/atari policy + LLM speak |
| CABO | [`docs/games/cabo.md`](docs/games/cabo.md) | 2–4; memory swaps; race to 100; card art pack |
| UNO | [`docs/games/uno.md`](docs/games/uno.md) | Classic, Flip, and No Mercy editions; responsive card table |
| TRIO | [`docs/games/trio.md`](docs/games/trio.md) | Memory and deduction card sets |
| Rummikub | [`docs/games/rummikub.md`](docs/games/rummikub.md) | Tile runs/groups, 30-point opening meld, mock/LLM AI |

Platform: Host authority, deterministic Actions, plugins never talk to the network. Peer room protocol and recovery rules: [`docs/bbge-networking.md`](docs/bbge-networking.md).

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
- Action buttons: score / trainer / calculator (when configured) + export (PDF / Markdown)
- RuleDocumentExperience: tabs, sidebars, decisions, complete-rule mode, and deep links
- RelatedGames: same-series navigation (if family grouping exists)
- ChatToggle: LLM chat (game/global switch; desktop fullscreen)

### Score Tracker

Page `/[locale]/games/[slug]/score/` is generated only when `score.json` exists. **Default is skip.** Only multi-player running totals (or fiddly per-round combos). No end-game category forms. Gate: [`docs/score-system.md`](docs/score-system.md) and [`.agents/skills/add-score-tracker`](.agents/skills/add-score-tracker/SKILL.md).

| Type | Component | Game |
|------|-----------|------|
| `just-wild-multi` | JustWildScoreTracker | Just Wild |
| `cabo-multi` | CaboScoreTracker | CABO |
| `sea-salt-multi` | SeaSaltScoreTracker | Sea Salt & Paper |
| `nimmt-multi` | NimmtScoreTracker | 6 nimmt! |

### Interactive rules

- Ordered lists show a two-column step sidebar with previous/next controls.
- Unordered lists show freely selectable topic categories.
- Tabs use a horizontal scroll strip on mobile.
- Decisions provide choice buttons, back, restart, and session-only history.
- `#rule-<id>` deep links work in guide and full modes; legacy guide hashes are
  resolved by their final stable ID.

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

See [`.agents/skills/add-game/SKILL.md`](.agents/skills/add-game/SKILL.md) for the complete guide covering standalone games, DLCs, expansions, and variants.

Quick steps:

1. Create directory under `content/games/` with `meta.json`, `en/rules.md`, `zh/rules.md`
2. Put the complete rules and any explicit interaction directives in those two Markdown files
3. Optionally add `score.json` for a multi-player running-total tracker (not end-game category math)
4. Register the slug in `content/games/index.json`
5. If part of a series, add `family`, `familyOrder`, `variantType` to `meta.json`
6. Run `node scripts/validate-game-content.mjs` and `npm run build` to verify
