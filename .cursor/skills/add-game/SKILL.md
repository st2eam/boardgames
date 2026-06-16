---
name: add-game
description: Add new board games, DLCs, expansions, or variants to The Game Shelf project. Use when user asks to add a game, create game content, or set up a new game entry.
---

# Adding Games to The Game Shelf

Complete guide for adding game content: standalone games, DLCs/expansions, and standalone variants.

## Quick Reference

| Game Type | `family` | `familyOrder` | `variantType` | `requiresBase` |
|-----------|:--------:|:-------------:|:-------------:|:--------------:|
| Standalone (no series) | ❌ omit | ❌ omit | ❌ omit | ❌ omit |
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
├── en/
│   ├── rules.md       # required
│   └── flow.json      # optional — interactive decision tree
└── zh/
    ├── rules.md       # required
    └── flow.json      # optional
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
| `family` | `string` | ❌ | Series slug shared by all games in family |
| `familyOrder` | `number` | ❌ | Sort order: `0` = base, `1+` = variants |
| `variantType` | `string` | ❌ | `"base"` / `"expansion"` / `"variant"` |
| `requiresBase` | `boolean` | ❌ | `true` if expansion, omit otherwise |

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

```json
{
  "startNode": "setup",
  "nodes": {
    "setup": {
      "title": { "en": "Game Setup", "zh": "游戏准备" },
      "content": "**Markdown** content for this step...",
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
      "content": "Describe turn actions here...",
      "options": []
    }
  }
}
```

- Both `en/flow.json` and `zh/flow.json` must exist if adding a flow
- Node keys are arbitrary strings (use descriptive names)
- Content supports full GFM markdown (tables, lists, bold, etc.)
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

## Adding a Score Tracker

If the game involves scoring/point tracking, create a `score.json` in the game's root directory:

```json
{
  "type": "victory-points",
  "direction": "high-wins",
  "target": 10,
  "players": { "min": 3, "max": 4 },
  "categories": [
    { "id": "village", "name": { "en": "Village", "zh": "村庄" }, "value": 1, "max": 5 },
    { "id": "city", "name": { "en": "City", "zh": "城市" }, "value": 2, "max": 4 }
  ]
}
```

### Score types

| Type | When to use | Key fields |
|------|-------------|------------|
| `victory-points` | Players score by categories (Catan VP, Splendor prestige) | `categories`, `target` |
| `rounds` | Fixed number of rounds with per-round scoring (Modern Art, Tacta) | `rounds`, `startingScore` |
| `cumulative` | Open-ended rounds accumulating toward a target (UNO, Cabo) | `target` or `targetByPlayers` |

### Field reference

| Field | Required | Description |
|-------|:--------:|-------------|
| `type` | ✅ | `"victory-points"` / `"rounds"` / `"cumulative"` |
| `direction` | ✅ | `"high-wins"` or `"low-wins"` |
| `target` | ❌ | Fixed target score |
| `targetByPlayers` | ❌ | Target varies by player count: `{"2": 40, "3": 35}` |
| `players` | ✅ | `{ "min": N, "max": N }` |
| `categories` | ❌ | VP scoring categories with `id`, `name`, `value`, optional `max` |
| `rounds` | ❌ | Total rounds for round-based scoring |
| `startingScore` | ❌ | Starting score per player (rounds type) |
| `unit` | ❌ | Display unit: `{ "en": "pts", "zh": "分" }` |

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
- [ ] `en/flow.json` and `zh/flow.json` added (optional)
- [ ] `score.json` added for games with scoring (optional)
- [ ] Slug registered in `content/games/index.json`
- [ ] `README.md` and `README-en.md` updated
- [ ] `npm run build` succeeds
- [ ] Visual check: card renders, links work, AI chat works
