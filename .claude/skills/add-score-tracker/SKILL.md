---
name: add-score-tracker
description: Decide whether a board game needs a score tracker, and how to add a dedicated multi-round tracker. Use when adding score.json, a new *-multi tracker, or when a game has point scoring. Do not add end-game category calculators.
---

# ADD SCORE TRACKER

Read [`docs/score-system.md`](../../../docs/score-system.md) first. There is **no** generic calculator.

---

## Decision tree

Ask one question at a time until you know. **Default is skip.**

1. **Which game?** (slug in `content/games/`)
2. **Do players keep a running total across rounds**, racing to a target or elimination line?
3. **Is a single round’s math too fiddly for paper?** (only then, like Sea Salt Paper combos)
4. If 2 and 3 are both no → **do not create `score.json`**. Scoring stays in rules / flow.

**Create `score.json` only if** the table needs a shared running total:

- Multiple players score every round (or every few rounds)
- Totals accumulate until a target / elimination line
- **or** one round’s scoring is too fiddly for paper

**Skip `score.json` if:**

- End-game category totaling (Catan, 7 Wonders, Carcassonne, Citadels, SETI, Brass, Palm Island)
- Trivial per-round number (leftover cards, match counts — Odin, Petiquette)
- Win/lose only, first-to-finish, or co-op pass/fail
- The proposed UI is “enter N for each category, we add them up”

Reuse an existing `*-multi` type when the table job matches. New type = new dedicated component.

---

## Existing types (reuse these)

| Type | Component | When |
|------|-----------|------|
| `cabo-multi` | `CaboScoreTracker` | Per-round penalty totals to a target; low score wins |
| `sea-salt-multi` | `SeaSaltScoreTracker` | Fiddly per-round combos, then accumulate to a player-count target |
| `just-wild-multi` | `JustWildScoreTracker` | Running totals + leftover tokens as tiebreak |
| `nimmt-multi` | `NimmtScoreTracker` | Per-round bull heads to a target; low score wins |

---

## Path A: Wire an existing type to a game

Only after the gate passes **and** an existing type fits.

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

`engine` must equal `type`. Optional: `targetByPlayers` instead of `target`.

Put the file at `content/games/<slug>/score.json`. No component change.

---

## Path B: New dedicated tracker

Only after the gate passes **and** no existing type fits.

1. Add the kebab-case key to `ScoreConfigType` in `src/types/game.ts`
2. Create `src/features/score/<Name>ScoreTracker.tsx` with `"use client"`
3. Register a case in `src/features/score/registry.tsx`
4. Ship `score.json` with that `type` / `engine`
5. `npm run build`

Component norms (match Cabo / Nimmt / Just Wild / Sea Salt):

- Multi-player names, per-round or running inputs, confirm/add round, cumulative total, target line
- Persist with `localStorage`
- Bilingual via `locale === "zh"` (same pattern as existing trackers)
- Numeric fields go through `normalizeNumericInput` from `@/lib/score/numberInput`
- Do **not** revive `ScoreTracker`, engines, `categories`, `features`, or `cards`

---

## Checklist

- [ ] Gate passed (running total / fiddly round) — otherwise no `score.json`
- [ ] Did not add an end-game category form
- [ ] `type` is on `ScoreConfigType` and in `registry.tsx`
- [ ] `score.json` `engine` equals `type`
- [ ] Component is `"use client"` and bilingual
- [ ] `npm run build` emits `/[locale]/games/[slug]/score/`
- [ ] README game table marks 计分 / Score only for games that have `score.json`
