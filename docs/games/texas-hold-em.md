# Texas Hold'em — BBGE Play Design

Per-game design for the Browser Board Game Engine playable slice.  
Platform: [`.cursor/skills/browser-board-game-engine/`](../../.cursor/skills/browser-board-game-engine/).  
Shelf: [`docs/architecture.md`](../architecture.md).  
UI skill: `.claude/skills/ui-ux-pro-max` (felt table, clear bet affordances, motion feedback).

| | |
|---|---|
| **Status** | Shipped on `main` — playable Host / hotseat / AI |
| **Slug** | `texas-hold-em` |
| **Plugin** | `texas-holdem` |
| **Match** | **One cash hand** NLHE → settle stacks → rematch |
| **Players** | **2–9** |
| **Play UI** | BGA-style DOM oval table + Motion (deal / flip / fold / bet) |
| **Card art** | `public/images/bbge/texas-holdem/*` from `texas-hold-em-cards.zip` |

---

## 1. Goal

Rules page → **开始游戏** → lobby (custom SB/BB/stack) → Host room →
hotseat / AI / share-link → **one hand** ends → showdown / fold-win → rematch.

---

## 2. Decisions

| Topic | Choice |
|-------|--------|
| Approach | A — PlayShell + `bbge/plugins/texas-holdem` + PeerJS |
| Stakes | Lobby **custom**: `smallBlind`, `bigBlind`, `startingStack` (defaults 1/2/200) |
| AI | Host DeepSeek `deepseek-v4-flash` + mock; illegal → feedback retry once |
| Bubbles | Every bet action shows seat bubble (`Call`, `Raise to X`, `I fold`, …) |
| Motion | Deal-in, board flip, fold slide, chip/bet pulse (Motion) |
| Out | Multi-hand session, tournament, straddle, ante, timers, Pixi |

---

## 3. Lobby config

| Field | Default | Validation |
|-------|---------|------------|
| `smallBlind` | 1 | ≥ 1 integer |
| `bigBlind` | 2 | ≥ 2× SB |
| `startingStack` | 200 | ≥ 20× BB; ≤ 100_000 |

Synced via `HostSession.setGameConfig` + lobby broadcast (like Love Letter edition).

---

## 4. Rules (v1)

- 52-card deck; BTN / SB / BB (HU: BTN posts SB)
- Streets: `preflop` → `flop` → `turn` → `river` → `showdown` | fold-win
- Actions: `fold` \| `check` \| `call` \| `raise` (`payload.toAmount` = total chips committed this street after raise)
- All-in + **side pots**; showdown best 5 of 7
- Privacy: hole cards only in viewer projection; showdown reveals contested hands
- Finished: pot awards applied to stacks; `winners[]` + pot breakdown in view

---

## 5. Architecture

```
GameHeader [开始游戏] → /games/texas-hold-em/play/
  LobbyView [SB/BB/Stack] → setGameConfig
  HostSession createGame({ …stakes, playerIds, seed })
  texas-holdem plugin
  TexasHoldemTable (bubbles + Motion)
```

| Boundary | Rule |
|----------|------|
| Shelf | `play.json` → `pluginId: texas-holdem` |
| Runtime | gameConfig stakes; no poker rules in HostSession |
| Plugin | Pure rules + `projectView` + `formatEvents` (bubble text) |
| AiSeat | Host only; legal Actions + optional `speak` |

---

## 6. Actions & bubbles

| Action | Bubble (en) | Bubble (zh) |
|--------|-------------|-------------|
| fold | I fold | 弃牌 |
| check | Check | 过牌 |
| call | Call | 跟注 |
| call (all-in) | All-in | 全下 |
| raise | Raise to {n} | 加注至 {n} |
| blinds | posts SB/BB | 下盲注 |

`formatEvents` sets `speakerId` + `bubble` (same pattern as Love Letter).

---

## 7. UI / motion (ui-ux-pro-max)

- Felt green oval, warm Shelf chrome (`primary` / `accent` / `surface`) — not purple AI-slop
- Seats around table; active seat ring; stack + street bet chips
- **Deal**: hole cards fly to seats; **flop/turn/river**: flip with rotateY / scale
- **Fold**: cards dim + slide; **bet/raise**: chip stack pulse toward pot
- Action bar: Fold / Check·Call / Raise (slider or ±BB presets)
- Viewport-locked play page (reuse PlayShell)

---

## 8. Testing

```bash
npm run test:bbge
```

Determinism, HU blinds, multiway side pot, hand rank, 9-max smoke.

---

## 9. Deferred

- Multi-hand cash session, Sit&Go, rake, time banks, GTO AI
