# Score Tracker System

Score pages exist to keep a **shared running total** at the table. They are not end-game formula forms.

```
content/games/<slug>/score.json          ← config (type + target + player range)
src/components/game/score/<Name>.tsx     ← dedicated tracker (UI + localStorage)
src/components/game/score/registry.tsx   ← type → component
src/app/[locale]/games/[slug]/score/     ← page (only if score.json exists)
src/lib/score/numberInput.ts             ← shared numeric input helper
```

There is **no** generic calculator and **no** scoring engine registry. Each tracker is a self-contained client component.

---

## Gate: when to add `score.json`

**Add** only if the table needs a shared running total:

- Multiple players score every round (or every few rounds)
- Totals accumulate until a **target** or **elimination line**
- **or** a single round’s scoring is too fiddly for paper (Sea Salt Paper combos)

**Do not add** (write the scoring in `rules.md` / `flow.json` instead):

- End-game category totaling (Catan, 7 Wonders, Carcassonne, Citadels, SETI, Brass, Palm Island)
- A trivial per-round number (leftover cards, match counts — Odin, Petiquette)
- Win/lose only, first-to-finish, or co-op pass/fail

If you would ship a form of “enter villages / science / stars, we add them up,” skip it.

---

## Current trackers

| `type` | Component | Game | Job at the table |
|--------|-----------|------|------------------|
| `cabo-multi` | `CaboScoreTracker` | CABO | Per-round penalty → 100; low wins; −50 reset |
| `sea-salt-multi` | `SeaSaltScoreTracker` | Sea Salt Paper | Per-round combo + color, then accumulate to a player-count target |
| `just-wild-multi` | `JustWildScoreTracker` | Just Wild | Running totals + leftover tokens as tiebreak |
| `nimmt-multi` | `NimmtScoreTracker` | 6 nimmt! | Per-round bull heads → 66; low wins |

`ScoreConfigType` in `src/types/game.ts` lists **only** these four keys.

---

## `score.json` shape

```json
{
  "type": "cabo-multi",
  "engine": "cabo-multi",
  "direction": "low-wins",
  "target": 100,
  "multiRound": true,
  "players": { "min": 2, "max": 4 }
}
```

| Field | Required | Notes |
|-------|:--------:|-------|
| `type` | ✅ | Must match a `ScoreByType` case and `ScoreConfigType` |
| `engine` | ✅ | Same string as `type` (JSON shape only; unused at runtime) |
| `direction` | ✅ | `"high-wins"` or `"low-wins"` |
| `players` | ✅ | `{ "min", "max" }` |
| `multiRound` |  | Running totals across rounds |
| `target` |  | Fixed race / elimination line |
| `targetByPlayers` |  | e.g. `{ "2": 40, "3": 35, "4": 30 }` |

Do not add `categories` / `features` / `cards` — those belonged to the removed generic calculator.

The dedicated component may ignore most JSON fields and hardcode targets (Sea Salt does). `score.json` still **must exist** so `generateStaticParams` emits `/score/`.

---

## Adding a new dedicated tracker

1. Confirm the **gate** above — if it fails, stop. No `score.json`.
2. Add the type to `ScoreConfigType` in `src/types/game.ts`
3. Create `src/components/game/score/<Name>ScoreTracker.tsx` (`"use client"`)
4. Register it in `src/components/game/score/registry.tsx`
5. Ship `content/games/<slug>/score.json` with that `type`
6. `npm run build` — `/[locale]/games/[slug]/score/` is generated only when the file exists

Checklist and decision questions: [`.claude/skills/add-score-tracker`](../.claude/skills/add-score-tracker/SKILL.md).
