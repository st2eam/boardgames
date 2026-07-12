# Trainer System Documentation

## Architecture Overview

```
content/games/<slug>/trainer.json   ← config (data)
src/lib/<game>/                      ← game logic (question generation, answer checking)
src/components/game/trainer/         ← UI components
src/app/[locale]/games/[slug]/trainer/page.tsx  ← page router
```

Each trainer is a self-contained system with:
1. **Config** (`trainer.json`) — declares the trainer type, difficulties, and game-specific settings
2. **Game library** (`src/lib/<game>/`) — generates scenarios/questions and computes correct answers
3. **UI component** (`src/components/game/trainer/`) — renders the interactive trainer
4. **Page route** — all trainers render through `src/app/[locale]/games/[slug]/trainer/page.tsx`

---

## Trainer Types

| Type key | Component | Library | Games using it |
|---|---|---|---|
| `tenpai` | `TenpaiTrainer` | `src/lib/mahjong/` | mahjong, riichi-mahjong |
| `blackjack-basic-strategy` | `BasicStrategyTrainer` | `src/lib/blackjack/` | blackjack |
| `texas-holdem-preflop` | `PreflopTrainer` | `src/lib/texas-holdem/` | texas-hold-em |
| `go-tsumego` | `GoTsumegoTrainer` | `src/lib/go/` | go |

---

## Trainer Config Format (`trainer.json`)

```json
{
  "type": "<trainer-type-key>",
  "tileSet": "<tile-set>",
  "difficulties": [
    {
      "id": "beginner",
      "name": { "en": "Beginner", "zh": "入门" },
      "handSize": 4
    }
  ]
}
```

- `type` — matches one of the keys in `TRAINER_TITLES` and `TRAINER_DESCRIPTIONS` in the page router, and the component switch in `page.tsx`
- `tileSet` — only used by `tenpai` type (`"standard"` or `"riichi"`)
- `difficulties[].handSize` — domain-specific; for tenpai it's tile count, for go-tsumego it's board size

---

## How the Page Router Works

`src/app/[locale]/games/[slug]/trainer/page.tsx`:

```
TRAINER_TITLES       — maps type → { en, zh } display name
TRAINER_DESCRIPTIONS — maps type → { en, zh } SEO description

generateStaticParams() → scans all games for trainer.json → pre-renders routes
TrainerPage()        → reads config.type → renders matching component
```

The component switch at line 109-112 dispatches based on `config.type`:
```tsx
{type === "tenpai" && <TenpaiTrainer config={config} locale={locale} />}
{type === "blackjack-basic-strategy" && <BasicStrategyTrainer locale={locale} />}
{type === "texas-holdem-preflop" && <PreflopTrainer locale={locale} />}
{type === "go-tsumego" && <GoTsumegoTrainer config={config as any} locale={locale} />}
```

---

## Trainer Anatomy (Common Patterns)

Every trainer component follows this state machine:

```
answering → user submits → result → user clicks next → answering (with new question)
```

### Shared state pattern

```typescript
const [phase, setPhase] = useState<"answering" | "result">("answering");
const [stats, setStats] = useState({ correct: 0, total: 0, streak: 0 });
const [selectedAction, setSelectedAction] = useState<X | null>(null);
const [scenario, setScenario] = useState<Scenario>(() => generateScenario());
```

### Shared UI components

- **`TrainerStats`** — displays correct, total, accuracy%, streak. Props: `{ correct, total, streak, locale }`
- **`PlayingCard`** (blackjack) — renders a card with rank + suit
- **`MahjongTile`** (mahjong) — renders a mahjong tile
- **`GoBoard`** (go) — SVG go board with stone rendering

---

## Existing Trainers in Detail

### 1. Tenpai Trainer (Mahjong)

**Library**: `src/lib/mahjong/`
- `generateTenpaiHand(handSize)` → `number[]` (34-element count array)
- `findWaits(hand)` → `number[]` (tile IDs that complete the hand)
- Hand is always in tenpai (waiting) state

**Component**: `TenpaiTrainer`
- Displays hand tiles, tile selector grid
- User selects tiles they think complete the hand
- Check: `selectedAnswers.length === correctWaits.length && all selected in correctWaits`

**Question generation logic** (`src/lib/mahjong/hand.ts`):
1. Build a complete winning hand (3n+2 tiles): random pair + random sets (sequences ~60%, triplets ~40%)
2. Remove one tile to create tenpai (3n+1 tiles)
3. Validate the result is actually tenpai
4. Fallback: guaranteed simple tenpai hand

### 2. Blackjack Basic Strategy Trainer

**Library**: `src/lib/blackjack/`
- `generateScenario()` → `Scenario` (2-card player hand + dealer upcard)
- `getCorrectAction(playerTotal, isSoft, isPair, pairValue, dealerUpcard)` → `Action` ("H"|"S"|"D"|"P")

**Strategy tables** (`strategy.ts`):
- `HARD_TABLE` — rows 5-20, cols 2-A (dealer upcard)
- `SOFT_TABLE` — rows 13-20, cols 2-A
- `PAIR_TABLE` — rows 2-11 (pair value), cols 2-A

**Lookup priority**: Pairs → Soft → Hard → Fallback

**Component**: `BasicStrategyTrainer`
- 4 action buttons: Hit, Stand, Double, Split
- Split disabled when hand is not a pair
- Also has a "Strategy Chart" tab (`StrategyChart` component) showing the full strategy tables

**Scenario generation**: Two independent random ranks. All 2-card combinations are equally likely (not realistic shoe-dealt probability, but good for practice coverage).

### 3. Texas Hold'em Preflop Trainer

**Library**: `src/lib/texas-holdem/`
- `generatePreflopScenario()` → `PreflopScenario` (position + 2 cards + correct action)
- `getCorrectAction(position, card1Label, card2Label, isSuited)` → `PreflopAction` ("R"|"F"|"M")

**Strategy tables** (`strategy.ts`): 13×13 matrices (A through 2)
- Above diagonal = suited
- Diagonal = pocket pairs
- Below diagonal = offsuit
- One table per position (UTG, HJ, CO, BTN, SB)
- "M" = Mixed (both raise and fold accepted)

**Component**: `PreflopTrainer`
- 2 action buttons: Raise, Fold
- Position badge + hand display
- Also has a "Preflop Chart" tab (`PreflopChart` component)
- "M" answers accept both R and F

### 4. Go Tsumego Trainer

**Library**: `src/lib/go/`
- `GoProblem` interface: board size, setup stones, turn, goal (bilingual), solution coords
- `problems.ts` — static array of all problems
- `getProblemsByDifficulty(difficulty)` — filter by difficulty

**Component**: `GoTsumegoTrainer`
- SVG go board with click-to-place stones
- Undo button (removes last placed stone)
- Check: verifies all solution positions are filled and no extra stones
- On incorrect, highlights solution with green dashed circles

**Adding new problems**: Edit `src/lib/go/problems.ts` and add entries to the `problems` array.

---

## Adding a New Trainer (Step-by-Step)

### Step 1: Create `trainer.json`

```json
// content/games/<slug>/trainer.json
{
  "type": "your-type-key",
  "tileSet": "optional-tile-set",
  "difficulties": [
    { "id": "easy", "name": { "en": "Easy", "zh": "简单" }, "handSize": 4 }
  ]
}
```

### Step 2: Register the type in the page router

In `src/app/[locale]/games/[slug]/trainer/page.tsx`:

1. Add entries to `TRAINER_TITLES` and `TRAINER_DESCRIPTIONS`:
```typescript
const TRAINER_TITLES: Record<string, { en: string; zh: string }> = {
  // ... existing ...
  "your-type-key": { en: "Your Trainer Name", zh: "你的训练名称" },
};
```

2. Add the component switch case:
```tsx
{type === "your-type-key" && <YourTrainer locale={locale} />}
```

3. Import your component at the top.

### Step 3: Create the game library

```
src/lib/<your-game>/
  index.ts     — public exports
  types.ts     — type definitions (if needed)
  scenarios.ts — question generation
  strategy.ts  — answer computation (if rule-based)
```

### Step 4: Create the UI component

```
src/components/game/trainer/<your-game>/
  YourTrainer.tsx  — main component
  ... sub-components
```

### Step 5: Follow the component pattern

```typescript
"use client";
import { useState, useCallback } from "react";
import { TrainerStats } from "../TrainerStats";

type Phase = "answering" | "result";

export function YourTrainer({ locale }: { locale: string }) {
  const [scenario, setScenario] = useState(() => generateScenario());
  const [phase, setPhase] = useState<Phase>("answering");
  const [stats, setStats] = useState({ correct: 0, total: 0, streak: 0 });

  const handleSubmit = useCallback((answer) => {
    if (phase !== "answering") return;
    const isCorrect = checkAnswer(answer, scenario);
    setStats(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
      streak: isCorrect ? prev.streak + 1 : 0,
    }));
    setPhase("result");
  }, [phase, scenario]);

  const handleNext = useCallback(() => {
    setScenario(generateScenario());
    setPhase("answering");
  }, []);

  return (
    <div className="space-y-6">
      <TrainerStats {...stats} locale={locale} />
      {/* scenario display */}
      {/* answer UI */}
      {/* result feedback (only when phase === "result") */}
      {/* next button (only when phase === "result") */}
    </div>
  );
}
```

---

## Adding Questions to Existing Trainers

### Blackjack / Texas Hold'em (rule-based)
No manual question entry needed — scenarios are generated programmatically. To adjust:
- **Blackjack**: Edit strategy tables in `src/lib/blackjack/strategy.ts`
- **Texas Hold'em**: Edit position tables in `src/lib/texas-holdem/strategy.ts`
- Adjust scenario distribution in `scenarios.ts`

### Mahjong Tenpai (procedural generation)
No manual entry — hands are generated by `generateTenpaiHand()` in `src/lib/mahjong/hand.ts`. To adjust difficulty:
- Edit `handSize` values in `trainer.json` (must be 3n+1: 4, 7, 10, 13)

### Go Tsumego (static problems)
Edit `src/lib/go/problems.ts` — each problem is a `GoProblem` object:

```typescript
{
  id: "unique-id",
  size: 9,              // board size: 9, 13, or 19
  setup: {              // initial stone positions: "row,col" → "black" | "white"
    "3,4": "black",
    "4,4": "white",
  },
  turn: "black",        // whose turn to play
  goal: {               // bilingual problem description
    en: "Black to play — capture the white stone",
    zh: "黑先 — 提掉白子",
  },
  solution: [           // correct move(s)
    { row: 4, col: 5 },
  ],
  difficulty: "beginner", // must match a difficulty id in trainer.json
},
```

---

## Design Conventions

1. **Bilingual**: All user-facing text must support `en` and `zh`
2. **State machine**: Always use `"answering"` | `"result"` phase pattern
3. **Stats persistence**: Stats reset on page reload (no localStorage — intentional for training focus)
4. **No external deps**: All logic is client-side, no API calls
5. **Tailwind only**: All styling via Tailwind classes, no CSS modules
6. **Shared UI**: Use `TrainerStats` for stats bar; reuse existing tile/card/board components where possible
