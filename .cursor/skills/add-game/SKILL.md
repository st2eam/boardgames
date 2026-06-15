---
name: add-game
description: Add new board games, DLCs, expansions, or variants to the project. Use when the user asks to add a game, create game content, or set up a new game entry.
---

# Adding Games to The Game Shelf

## Workflow

### Step 1: Research

Before writing any content, **search the web** for the game's official rules. Never fabricate rules. If rules can't be found, leave `rules.md` with a placeholder header only.

### Step 2: Create the game directory

```
content/games/{slug}/
├── meta.json
├── en/
│   ├── rules.md
│   └── flow.json    # optional
└── zh/
    ├── rules.md
    └── flow.json    # optional
```

Slug format: lowercase, hyphens, e.g. `splendor-pokemon`.

### Step 3: Write meta.json

**Standalone game:**

```json
{
  "name": { "en": "Splendor", "zh": "璀璨宝石" },
  "players": "2-4",
  "duration": "30 min",
  "difficulty": "medium",
  "tags": ["card", "strategy"],
  "category": "card"
}
```

**Game that belongs to a series (base game):**

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

**DLC / Expansion (requires base game):**

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

**Variant (standalone, no base needed):**

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

### Field reference

| Field | Type | Required | Values |
|-------|------|:--------:|--------|
| `name` | `{en, zh}` | ✅ | Bilingual display name |
| `players` | `string` | ✅ | e.g. `"2-4"`, `"3-6"` |
| `duration` | `string` | ✅ | e.g. `"30 min"`, `"60-120 min"` |
| `difficulty` | `string` | ✅ | `"easy"` / `"medium"` / `"hard"` |
| `tags` | `string[]` | ✅ | Descriptive tags for filtering |
| `category` | `string` | ✅ | `"board"` / `"card"` / `"party"` / `"dice"` |
| `family` | `string` | ❌ | Series ID, shared across related games |
| `familyOrder` | `number` | ❌ | Sort within family. `0` = base game |
| `variantType` | `string` | ❌ | `"base"` / `"expansion"` / `"variant"` |
| `requiresBase` | `boolean` | ❌ | `true` if can't be played standalone |

### Step 4: Write rules.md (both en/ and zh/)

- Start with `# Game Name Rules` heading
- Include: Overview, Components, Setup, Turn Actions, Game End, and any special rules
- Use Markdown tables for structured comparisons
- Keep language natural and clear

### Step 5: Register the slug

Add the slug to `content/games/index.json`:

```json
[
  "existing-game",
  "your-new-game"
]
```

### Step 6: (Optional) Add flow.json for interactive decision tree

Only add if the game benefits from step-by-step guidance. Structure:

```json
{
  "startNode": "setup",
  "nodes": {
    "setup": {
      "title": { "en": "Game Setup", "zh": "游戏准备" },
      "content": "Markdown content here...",
      "options": [
        { "label": { "en": "Next", "zh": "下一步" }, "next": "node-id" }
      ]
    }
  }
}
```

### Step 7: Build and verify

```bash
npm run build
```

The prebuild script auto-generates `public/data/games-index.json`. Check the build succeeds with no errors.

## Adding a DLC/expansion to an existing standalone game

If the existing base game doesn't have `family` fields yet:

1. Add `family`, `familyOrder: 0`, `variantType: "base"` to the base game's `meta.json`
2. Then create the DLC/expansion with matching `family` and `familyOrder: 1+`

## Checklist

- [ ] Web search done for accurate rules
- [ ] `meta.json` created with correct fields
- [ ] `en/rules.md` written
- [ ] `zh/rules.md` written
- [ ] Slug added to `content/games/index.json`
- [ ] If series: `family` fields set on both base and new game
- [ ] `npm run build` succeeds
