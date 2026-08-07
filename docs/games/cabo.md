# CABO — BBGE Play Design

Per-game design for the Browser Board Game Engine playable slice.  
Platform: [`.cursor/skills/browser-board-game-engine/`](../../.cursor/skills/browser-board-game-engine/).  
Shelf: [`docs/architecture.md`](../architecture.md).

| | |
|---|---|
| **Status** | Shipped — playable Host / hotseat / AI |
| **Slug** | `cabo` |
| **Plugin** | `cabo` |
| **Match** | Cumulative to **100** (lowest wins); exactly **100 → 50** once per player |
| **Players** | **2–4** |
| **Play UI** | BGA-style DOM table (`CaboTable`) |
| **Card art** | `public/images/bbge/cabo/cabo_00.webp` … `cabo_13.webp`, `cabo_back.webp` |

---

## 1. Goal

Rules page → **开始游戏** → play lobby → Host room → hotseat / AI / share-link →
multi-round match: sum card values each round; lowest cumulative wins at 100+.

---

## 2. Rules implemented

| Topic | Behavior |
|-------|----------|
| Deck | 52 cards: 0×2, 1–12×4, 13×2 |
| Setup | Deal 4 face-down; flip discard; each player peeks **2** own cards |
| Turn | Draw deck (look → discard or swap) · draw discard (must swap) · call **CABO** |
| Abilities | On **deck** discard only: 7–8 peek own, 9–10 spy other, 11–12 blind swap |
| Multi-swap | 2+ slots must match; fail → face-up + drawn added; 3+ fail → extra face-down draw |
| Round end | CABO + others’ final turn, or empty draw pile |
| Scoring | Sum values; caller 0 if lowest/tied else sum+10; **Kamikaze** 2×13+2×12 → 0 / others 50 |
| Match | Cumulative; **100** ends match unless reset to **50** (once per player) |

---

## 3. Actions

| Action | When |
|--------|------|
| `setupPeek` `{ slotIndices }` | Setup — pick 2 slots |
| `drawDeck` / `drawDiscard` | Main turn start |
| `discardDrawn` `{ useAbility? }` | After draw |
| `swapWithDrawn` `{ slotIndices }` | After draw |
| `resolveAbilityPeek/Spy/Swap` | After discard+ability |
| `skipAbility` | Decline ability |
| `callCabo` | Instead of draw |
| `acknowledgeModal` | After peek/spy modal |

Host **下一轮** / **再来一局** via `continueMatch` (keeps cumulative scores between rounds).

---

## 4. AI

| Layer | Behavior |
|-------|----------|
| Mock (`createMockCaboSeat`) | Setup corner peek; swap away highs; take low discards; abilities on useful ranks; call CABO when estimate ≤ 8 |
| LLM (`createDeepSeekCaboSeat`) | Memory + timing; Chinese `speak`; `opts.battleLog` via `battleLogPromptBlock` |
| Log UI | Shared `BattleLogList` + `PlaySideSheet` |

---

## 5. Testing

```bash
npm run test:bbge -- --run bbge/plugins/cabo
```

---

## 6. Content bind

`content/games/cabo/play.json` → `pluginId: "cabo"`. Score tracker page uses separate `cabo-multi` component; play uses BBGE plugin.
