# Love Letter — BBGE Play Design

Per-game design for the Browser Board Game Engine playable slice.  
Platform contracts: [`.cursor/skills/browser-board-game-engine/`](../../.cursor/skills/browser-board-game-engine/).  
Shelf architecture: [`docs/architecture.md`](../architecture.md).

| | |
|---|---|
| **Status** | Shipped on `main` — playable Host / hotseat / AI |
| **Convention** | Playable designs live at `docs/games/<slug>.md` |
| **Editions** | **`classic`** · **`full`** · **`expansion`** |
| **Play UI** | BGA-style DOM table (`LoveLetterTable` + `ui/bga/*`), not Pixi |
| **Card art** | `public/images/bbge/love-letter/*` from `love-letter-cards` pack (by **role**) |

---

## 1. Goal

Rules page → **开始游戏** → play lobby → **选择版本** → Host room →
hotseat / AI / share-link → **one round** ends the match (♥ mid-round can finish early in expansion).

---

## 2. Editions

| `edition` | Label | Deck | Players | Notes |
|-----------|-------|------|---------|--------|
| `classic` | 经典版 | **16** — Guard…Princess=8 | 2–4 | No Spy/Chancellor; hand-tie → discard-sum |
| `full` | 完整版 | **21** — Spy…Princess=9 | 2–6 | Chancellor pending; spy favor; hand-tie → all win |
| `expansion` | 拓展版 | **37** = full 21 + **16** expansion roles | 2–8 | **Keeps Spy + Chancellor**; shared ranks; ♥ tokens |

**Legacy:** `premium` URL/config → treated as `classic`.

### Expansion +16 (on top of full)

| Rank | Role | Qty |
|-----:|------|----:|
| 9 | Bishop | 1 |
| 7 | Dowager Queen | 1 |
| 6 | Constable | 1 |
| 5 | Count | 2 |
| 4 | Sycophant | 2 |
| 3 | Baroness | 2 |
| 2 | Cardinal | 2 |
| 1 | Guard | +3 (full already has 6 → 9 total) |
| 0 | Jester | 1 |
| 0 | Assassin | 1 |

Effects use stable **`role`**. Guess-by-number hits any card of that rank.

### Expansion effect summary

- **Assassin** — vs Guard guess: Guard player out; Assassin discarded + redraw
- **Bishop** — guess number → +1 ♥; target may discard+redraw; at reveal Princess beats Bishop
- **Dowager Queen** — compare; **higher** out (tie → none)
- **Constable** — when knocked out with Constable in discard → +1 ♥
- **Count** — at reveal, +1 hand value per Count in discard
- **Sycophant** — next chooser must include nominated player
- **Baroness** — peek 1 or 2 hands (ack modal)
- **Cardinal** — swap exactly 2 hands; peek one
- **Jester** — if pick wins the round → you +1 ♥
- **♥ targets** (instant match win if reached): 2→7, 3→5, 4→4, 5–8→4

---

## 3. Architecture

```
GameHeader [开始游戏] → /play/?edition=<default>
  LobbyView [经典|完整|拓展] → setGameConfig({ edition })
  HostSession createGame(…gameConfig)
  love-letter plugin (role-based effects)
```

| Boundary | Rule |
|----------|------|
| Shelf | `play.json.editions`; lobby owns picker |
| Runtime | `HostSession.setGameConfig`; lobby.edition synced to guests |
| Plugin | Pure rules; `state.edition`; art by role filename |
| AiSeat | Host only; prompt reads `view.edition`; strategic mock + LLM |

---

## 4. AI

| Layer | Behavior |
|-------|----------|
| Mock (`createMockLoveLetterSeat`) | Keep Princess/King/Countess; spend Guard/Priest for info; Handmaid protects highs; Guard/Bishop guess from `seen` + discards; Chancellor keeps highest |
| LLM | Clever human — deduction, timing, never volunteer Princess; Chinese `speak`; `opts.battleLog` of every seat |
| Hard rule | Never play Princess unless it is the only card |
| Log UI | Shared `BattleLogList` + `PlaySideSheet` |

---

## 5. Content bind

`love-letter` default `full`; `love-letter-premium` default `expansion`.

---

## 6. Actions

| Action | When |
|--------|------|
| `playCard` | `cardId`, optional `targetId` / `targetIds` / `guessRank` / `peekTargetId` |
| `resolveChancellor` | Full + expansion |
| `acknowledgePriest` | Priest / Baroness peek |

---

## 7. Testing

```bash
npm run test:bbge
```

---

## 8. Deferred

- Multi-round favor races beyond one-round + mid-round ♥ finish
- Replay / spectators / host migration
