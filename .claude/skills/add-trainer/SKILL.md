---
name: add-trainer
description: Guide for adding new trainers or practice problems to the boardgames trainer system. Covers all four trainer types (tenpai, blackjack, texas-holdem, go-tsumego) and the step-by-step process for creating new trainer types.
---

# ADD TRAINER / PROBLEM SKILL

You are helping the user extend the trainer system in the boardgames project. Read `docs/trainer-system.md` first for the full architecture reference before making any changes.

---

## Decision tree

Ask the user one clarifying question at a time until you know:

1. **Which game?** (slug in `content/games/`)
2. **New trainer type or add problems to existing?**
3. **If new trainer type** — what does the user practice? (What question does the trainer ask? What is the correct answer?)
4. **Difficulty levels?** (at least 2-3 tiers)

---

## Path A: Adding problems to an existing trainer

### A1. Go Tsumego (static problems)

Edit `src/lib/go/problems.ts`. Each problem:

```ts
{
  id: "difficulty-N",           // kebab-case, unique
  size: 9,                      // 9 | 13 | 19
  setup: { "row,col": "black" | "white", ... },
  turn: "black" | "white",
  goal: { en: "...", zh: "..." },
  solution: [{ row: N, col: N }],
  difficulty: "beginner" | "easy" | "normal",
}
```

**Rules for GoProblem.setup**:
- The `setup` positions must form a legal board state (no stones already captured)
- Solution positions must be empty (no stone already there in setup)
- The turn player is the one who plays the solution move

### A2. Mahjong Tenpai (procedural — adjust difficulty)

Edit `content/games/<slug>/trainer.json`:
- Add/remove `difficulties` entries
- `handSize` must be 3n+1: 4, 7, 10, or 13

### A3. Blackjack / Texas Hold'em (rule-based — adjust strategy)

- **Blackjack**: Edit tables in `src/lib/blackjack/strategy.ts`
- **Texas Hold'em**: Edit position tables in `src/lib/texas-holdem/strategy.ts`

---

## Path B: Creating a new trainer type

### B1. Create `trainer.json`

```jsonc
// content/games/<slug>/trainer.json
{
  "type": "kebab-case-type-key",
  // "tileSet": "..." — only if relevant
  "difficulties": [
    { "id": "easy", "name": { "en": "Easy", "zh": "简单" }, "handSize": N }
  ]
}
```

The `type` field is the contract between config, page router, and component. Pick a descriptive kebab-case key.

### B2. Register in page router

Edit `src/app/[locale]/games/[slug]/trainer/page.tsx`:

1. **Add display names** to `TRAINER_TITLES`:
   ```ts
   "your-type": { en: "Your Trainer Name", zh: "你的训练" },
   ```

2. **Add SEO descriptions** to `TRAINER_DESCRIPTIONS`:
   ```ts
   "your-type": { en: "practice X decisions", zh: "练习X决策" },
   ```

3. **Add component switch** in the JSX (after existing cases):
   ```tsx
   {type === "your-type" && <YourTrainer locale={locale} />}
   ```

4. **Add import** at the top:
   ```tsx
   import { YourTrainer } from "@/components/game/trainer/your-game/YourTrainer";
   ```

### B3. Create game library

```
src/lib/<your-game>/
  index.ts      — barrel exports
  types.ts      — type definitions
  scenarios.ts  — question generation function
  strategy.ts   — answer checking logic
```

**index.ts** pattern:
```ts
export { type YourType, ... } from "./types";
export { generateScenario } from "./scenarios";
export { checkAnswer, getCorrectAnswer } from "./strategy";
```

### B4. Create UI component

```
src/components/game/trainer/<your-game>/
  YourTrainer.tsx  — main component
```

**Required imports**:
```tsx
"use client";
import { useState, useCallback } from "react";
import { TrainerStats } from "../TrainerStats";
```

**Required state machine**:
```tsx
type Phase = "answering" | "result";

export function YourTrainer({ locale }: { locale: string }) {
  const [scenario, setScenario] = useState(() => generateScenario());
  const [phase, setPhase] = useState<Phase>("answering");
  const [stats, setStats] = useState({ correct: 0, total: 0, streak: 0 });
  const [userAnswer, setUserAnswer] = useState<AnswerType | null>(null);

  // Check answer on submit
  const handleSubmit = useCallback((answer) => {
    if (phase !== "answering") return;
    setUserAnswer(answer);
    const isCorrect = checkAnswer(answer, scenario);
    setStats(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
      streak: isCorrect ? prev.streak + 1 : 0,
    }));
    setPhase("result");
  }, [phase, scenario]);

  // Generate new question
  const handleNext = useCallback(() => {
    setScenario(generateScenario());
    setUserAnswer(null);
    setPhase("answering");
  }, []);

  return (
    <div className="space-y-6">
      <TrainerStats {...stats} locale={locale} />
      {/* 1. Scenario display */}
      {/* 2. Answer UI (clickable when answering, disabled when result) */}
      {/* 3. Result feedback (visible only when phase === "result") */}
      {/*    - Correct vs incorrect message */}
      {/*    - Show correct answer */}
      {/*    - "Next" button */}
    </div>
  );
}
```

### B5. Confirm the type exports

Make sure `src/types/game.ts` `TrainerConfig` can hold your config. Usually no changes needed — the `type` field is `string` and `difficulties` is the standard array.

---

## Button styling pattern for "answering" vs "result"

The critical pattern we use across all trainers:

```tsx
// Inside the .map() over action buttons:
const isSelected = userAnswer === action;
const isCorrectAnswer = phase === "result" && action === correctAction;

let className = "base classes ";
if (disabled) {
  className += "opacity-30 cursor-not-allowed ...";
} else if (phase === "result") {
  // Apply ring FIRST (so it layers under active style)
  if (isCorrectAnswer) {
    className += "ring-2 ring-offset-1 ring-green-500 ";
  }
  // Then active/selected style
  if (isSelected) {
    className += ACTION_ACTIVE[action];
  } else {
    className += ACTION_COLORS[action];
  }
} else if (phase === "answering") {
  className += ACTION_COLORS[action] + " cursor-pointer";
}
```

**Key rule**: In the `phase === "result"` branch, check correctness and selection independently — do NOT use `if/else if` between them. Both must be able to apply simultaneously so the user sees both the green ring AND the active state when they answer correctly.

---

## Bilingual pattern

Every user-facing string:

```tsx
{locale === "zh" ? "中文文本" : "English text"}
```

Or from a lookup table:
```tsx
const LABELS: Record<string, { en: string; zh: string }> = {
  foo: { en: "Foo", zh: "福" },
};
// usage:
{LABELS.foo[locale as "en" | "zh"]}
```

---

## Validation checklist

Before declaring the task complete:

- [ ] `trainer.json` exists with valid `type`, `difficulties`
- [ ] Type key is registered in all three places in `page.tsx` (titles, descriptions, component switch)
- [ ] Component imports are correct
- [ ] Component uses `"use client"` directive
- [ ] Component follows the `answering` → `result` phase machine
- [ ] Uses `TrainerStats` for the stats bar
- [ ] All user-facing text is bilingual (en + zh)
- [ ] Button styling allows ring + active state to coexist
- [ ] `npm run build` succeeds (runs prebuild + typecheck)
- [ ] New game library only uses client-safe APIs (no `fs`, no `process.env` on client)
