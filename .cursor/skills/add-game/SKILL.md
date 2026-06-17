---
name: add-game
description: Add new board games, DLCs, expansions, or variants to The Game Shelf project. Use when user asks to add a game, create game content, or set up a new game entry.
---

# Adding Games to The Game Shelf

Complete guide for adding game content: standalone games, DLCs/expansions, and standalone variants.

## Quick Reference

| Game Type | `family` | `familyOrder` | `variantType` | `requiresBase` |
|-----------|:--------:|:-------------:|:-------------:|:--------------:|
| Standalone (no series) | — | — | — | — |
| Base of a series | `"my-series"` | `0` | `"base"` | `false` |
| Expansion (needs base) | `"my-series"` | `1+` | `"expansion"` | `true` |
| Variant (standalone) | `"my-series"` | `1+` | `"variant"` | `false` |

---

## Step-by-Step Workflow

### Step 1: Research

**Search the web** for the game's official rules. Never fabricate content. Sources:
- Publisher's official website / rulebook PDF
- BoardGameGeek rule summaries
- Reputable board game blogs/Wikis

If rules can't be found, leave `rules.md` with only the heading — don't guess.

### Step 2: Create directory

```
content/games/{slug}/
├── meta.json
├── flow.json      # optional — single bilingual decision tree
├── score.json     # optional — score tracker config
├── en/
│   └── rules.md   # required
└── zh/
    └── rules.md   # required
```

**Slug rules:** lowercase, hyphens only, no special characters. Match existing conventions.

| Example | Slug |
|---------|------|
| Splendor: Pokémon | `splendor-pokemon` |
| UNO Show 'Em No Mercy | `uno-no-mercy` |
| Exploding Kittens: Black Box | `exploding-kittens-black` |

### Step 3: Write meta.json

**Standalone game (no series):**

```json
{
  "name": { "en": "Catan", "zh": "卡坦岛" },
  "players": "3-4",
  "duration": "60-120 min",
  "difficulty": "medium",
  "tags": ["strategy", "board", "family"],
  "category": "board"
}
```

**Base game of a new series:**

```json
{
  "name": { "en": "Splendor", "zh": "璀璨宝石" },
  "players": "2-4",
  "duration": "30 min",
  "difficulty": "medium",
  "tags": ["card", "strategy"],
  "category": "card",
  "family": "splendor",
  "familyOrder": 0,
  "variantType": "base"
}
```

**Expansion / DLC (requires base game to play):**

```json
{
  "name": { "en": "Pig Pageant", "zh": "小猪选美" },
  "players": "2-4",
  "duration": "10-15 min",
  "difficulty": "easy",
  "tags": ["card", "family"],
  "category": "card",
  "family": "dirty-pig",
  "familyOrder": 1,
  "variantType": "expansion",
  "requiresBase": true
}
```

**Standalone variant (no base game needed, e.g. themed edition):**

```json
{
  "name": { "en": "Splendor: Pokémon", "zh": "璀璨宝石：宝可梦版" },
  "players": "2-4",
  "duration": "30 min",
  "difficulty": "medium",
  "tags": ["card", "strategy"],
  "category": "card",
  "family": "splendor",
  "familyOrder": 1,
  "variantType": "variant",
  "requiresBase": false
}
```

### Field Reference

| Field | Type | Required | Description |
|-------|------|:--------:|-------------|
| `name` | `{en, zh}` | ✅ | Bilingual display name |
| `players` | `string` | ✅ | Range, e.g. `"2-4"`, `"3-6"` |
| `duration` | `string` | ✅ | e.g. `"30 min"`, `"60-120 min"` |
| `difficulty` | `string` | ✅ | `"easy"` / `"medium"` / `"hard"` |
| `tags` | `string[]` | ✅ | Filter/search tags. Keep lowercase. |
| `category` | `string` | ✅ | `"board"` / `"card"` / `"party"` / `"strategy"` |
| `family` | `string` |  | Series slug shared by all games in family |
| `familyOrder` | `number` |  | Sort order: `0` = base, `1+` = variants |
| `variantType` | `string` |  | `"base"` / `"expansion"` / `"variant"` |
| `requiresBase` | `boolean` |  | `true` if expansion, omit otherwise |

**Series tags are auto-generated** from `family` — e.g. family `"uno"` produces tags "UNO series" / "UNO 系列". No need to add them manually.

### Step 4: Write rules.md

Write both `en/rules.md` and `zh/rules.md`. Use this structure:

```markdown
# Game Name Rules

## Overview
One-paragraph summary of the game.

## Components
Bullet list of all components.

## Setup
Numbered steps to set up the game.

## How to Play / 游戏流程
Turn structure, actions, special mechanics.

## Game End / Scoring / 获胜条件
How the game ends and who wins.

## Special Rules (if any)
Edge cases, variants, clarifications.
```

- Use **Markdown tables** for structured data (card types, scoring, comparisons)
- Use `**bold**` for key terms and card names
- Keep language natural — the rules are for human reading, not training data

### Step 5: Register the slug

Add to `content/games/index.json`:

```json
[
  "existing-game",
  "your-new-game"
]
```

The order in this file determines display order on the homepage (sorted alphabetically by English name at render time).

### Step 6: Add flow.json (optional)

Only if the game benefits from step-by-step interactive guidance. A flow is a **directed graph** — each node is a rule snippet with jump options.

Place `flow.json` in the game's root directory (not inside locale folders):

```
content/games/{slug}/
├── meta.json
├── flow.json       # optional — single bilingual file
├── en/rules.md
└── zh/rules.md
```

```json
{
  "startNode": "setup",
  "nodes": {
    "setup": {
      "title": { "en": "Game Setup", "zh": "游戏准备" },
      "content": {
        "en": "**Markdown** content in English...",
        "zh": "**Markdown** 中文内容..."
      },
      "options": [
        {
          "label": { "en": "Your Turn", "zh": "轮到你了" },
          "next": "turn"
        },
        {
          "label": { "en": "Scoring", "zh": "计分方式" },
          "next": "scoring"
        }
      ]
    },
    "turn": {
      "title": { "en": "On Your Turn", "zh": "你的回合" },
      "content": {
        "en": "Describe turn actions here...",
        "zh": "在此描述回合操作..."
      },
      "options": []
    }
  }
}
```

- Single `flow.json` per game at the root level (NOT per locale)
- `title`, `content`, and `label` are all bilingual objects `{ "en": "...", "zh": "..." }`
- Node keys are arbitrary strings (use descriptive names)
- Content values support full GFM markdown (tables, lists, bold, etc.)
- Keep each node focused on one topic — don't cram too much into one node

### Step 7: Update documentation

Update these files to reflect the new game:

1. **`README.md`** (Chinese) and **`README-en.md`** (English)
   - Add the game to the game list table
   - If standalone: add to "独立游戏 / Standalone" section
   - If series member: add to the appropriate series row in "游戏系列 / Series" section
   - Update the game count in the subtitle (e.g. "覆盖 23 款游戏" → "覆盖 24 款游戏")

2. **Update the global AI prompt** if the game count or series info changed noticeably. The prompt is auto-generated from `games-index.json`, so just running `npm run build` syncs it — no manual edit needed.

### Step 8: Build and verify

```bash
npm run build
```

The `prebuild` script (`scripts/generate-game-data.mjs`) auto-generates `public/data/games-index.json` from all `meta.json` files. Verify:

- [ ] Build succeeds with no errors
- [ ] New game appears on homepage
- [ ] Clicking the card opens the correct rule page
- [ ] Language switcher works on the rule page
- [ ] Decision tree works (if flow.json added)
- [ ] AI chat works with game-specific mode (tests rule context injection)

---

## Adding a Score Tracker (Auto-Calculator)

If the game involves scoring, create a `score.json` in the game's root directory. The score tracker auto-calculates points based on user selections.

### Engine selection

| Engine | When to use | Key fields |
|--------|-------------|------------|
| `sea-salt` | Complex formula-based scoring (Sea Salt & Paper) | `cards` with groups (duo/collector/multiplier/mermaid) |
| `card-type` | Score by card type × count (UNO, Splendor) | `cardTypes` with value per type |
| `category` | Score by category × count (Catan, King of Wilderness) | `categories` with value per item |
| `feature-calc` | Input quantities, apply formula (Carcassonne) | `features` with formula strings |
| `card-sum` | Select cards from a list, sum their points | `cards` or `cardGroups` with `points` |

### Example: Card Type engine (UNO)

```json
{
  "type": "card-type",
  "engine": "card-type",
  "direction": "high-wins",
  "target": 500,
  "multiRound": true,
  "players": { "min": 2, "max": 10 },
  "cardTypes": [
    { "id": "num5", "name": { "en": "Number 5", "zh": "数字 5" }, "value": 5, "group": "number" },
    { "id": "skip", "name": { "en": "Skip", "zh": "禁止" }, "value": 20, "group": "action" }
  ],
  "filters": [
    { "id": "group", "name": { "en": "Type", "zh": "类型" }, "field": "group",
      "values": [
        { "id": "all", "name": { "en": "All", "zh": "全部" } },
        { "id": "number", "name": { "en": "Numbers", "zh": "数字牌" } },
        { "id": "action", "name": { "en": "Action", "zh": "功能牌" } }
      ]
    }
  ]
}
```

### Example: Feature Calc engine (Carcassonne)

```json
{
  "type": "feature-calc",
  "engine": "feature-calc",
  "direction": "high-wins",
  "players": { "min": 2, "max": 5 },
  "features": [
    { "id": "road", "name": { "en": "Road (tiles)", "zh": "道路（块数）" }, "inputType": "number", "formula": "n", "description": { "en": "1 pt/tile", "zh": "每块1分" } },
    { "id": "city", "name": { "en": "City (tiles)", "zh": "城市（块数）" }, "inputType": "number", "formula": "n*2", "description": { "en": "2 pts/tile", "zh": "每块2分" } }
  ]
}
```

### Field reference

| Field | Required | Description |
|-------|:--------:|-------------|
| `type` | ✅ | UI layout type |
| `engine` | ✅ | Calculation engine name |
| `direction` | ✅ | `"high-wins"` or `"low-wins"` |
| `multiRound` |  | Enable multi-round with confirm button |
| `target` |  | Fixed target score |
| `targetByPlayers` |  | Target varies by player count: `{"2": 40, "3": 35}` |
| `players` | ✅ | `{ "min": N, "max": N }` |
| `cards` |  | Card list with `id`, `name`, `color`, `count`, `group`, `points` |
| `cardTypes` |  | Card type list with `id`, `name`, `value`, `group` |
| `categories` |  | Category list with `id`, `name`, `value`, optional `max` |
| `features` |  | Feature inputs with `id`, `name`, `inputType`, `formula`, `description` |
| `filters` |  | Filter definitions for the card selector UI |

The score tracker page is auto-generated at `/[locale]/games/[slug]/score/` when `score.json` exists.

---

## Adding to an Existing Series

If the base game already has `family` fields (e.g., UNO, Splendor, Dirty Pig):

1. Create the new game directory as usual
2. Set `family` to match the base game's family slug
3. Set `familyOrder` to the next available number (check existing entries)
4. Set `variantType` and `requiresBase` appropriately

### Promoting a standalone game to a series base

If you're adding a DLC to a game that was previously standalone (no `family` field):

1. Edit the **base game's** `meta.json` — add:
   ```json
   "family": "new-series-slug",
   "familyOrder": 0,
   "variantType": "base"
   ```
2. Create the DLC with matching `family` and `familyOrder: 1`

---

## Checklist

- [ ] Rules researched from official/web sources
- [ ] `meta.json` created with all required fields
- [ ] Series fields set correctly (if applicable)
- [ ] `en/rules.md` written with standard structure
- [ ] `zh/rules.md` written (matching English content)
- [ ] `flow.json` added at game root with bilingual title/content/label (optional)
- [ ] `score.json` added for games with scoring (optional)
- [ ] Slug registered in `content/games/index.json`
- [ ] `README.md` and `README-en.md` updated
- [ ] `npm run build` succeeds
- [ ] Visual check: card renders, links work, AI chat works
