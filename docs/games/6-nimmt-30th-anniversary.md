# 6 nimmt! — BBGE Play Design

Per-game design for the Browser Board Game Engine playable slice.  
Platform: [`.cursor/skills/browser-board-game-engine/`](../../.cursor/skills/browser-board-game-engine/).  
Shelf: [`docs/architecture.md`](../architecture.md).

| | |
|---|---|
| **Status** | Shipped on `main` — playable Host / hotseat / AI |
| **Slug** | `6-nimmt-30th-anniversary` |
| **Plugin** | `six-nimmt` |
| **Match** | Multi-round to **66** bullheads; lowest score wins; host **再来一局** resets |
| **Players** | **2–10** |
| **Play UI** | BGA-style DOM table + Motion (reveal / place / take row) |
| **Card art** | CSS number cards 1–104 with bullhead badges |

---

## 1. Goal

Rules page → **开始游戏** → lobby → Host room → hotseat / AI / share-link →
play tricks until someone reaches **≥ 66** → lowest total wins → host rematch.

---

## 2. Decisions

| Topic | Choice |
|-------|--------|
| Approach | A — PlayShell + `bbge/plugins/six-nimmt` + PeerJS |
| Ruleset | **Classic base only** (no fan specials, no Beat the Buffalo, no draft variant) |
| AI | Host DeepSeek `deepseek-v4-flash` + mock; illegal → feedback retry once |
| Simultaneous | `playCard` from any unset seat during `selecting`; resolve when all locked |
| Out | Anniversary fan cards, buffalo coop, timers, Pixi |

---

## 3. Rules (v1)

- Deck 1–104; deal 10 each; 4 row starters
- Trick: all play one card face-down → reveal → place ascending
- Place: ascending + min difference; 6th card takes the 5; too low → `chooseRow`
- Bullheads: 1 / 2 (×5) / 3 (×10) / 5 (twins) / 7 (55)
- After 10 cards: add taken bullheads to score; reshuffle & redeal unless someone ≥ 66
- Winners: lowest score (ties shared)

---

## 4. Actions

| Action | Payload | When |
|--------|---------|------|
| `playCard` | `{ cardId }` | `selecting`, one card per seat per trick |
| `chooseRow` | `{ rowIndex: 0..3 }` | `chooseRow` pending for that seat |

---

## 5. Architecture

```
GameHeader → /games/6-nimmt-30th-anniversary/play/
  HostSession createGame({ playerIds, seed })
  six-nimmt plugin
  SixNimmtTable
```

| Boundary | Rule |
|----------|------|
| Shelf | `play.json` → `pluginId: six-nimmt` |
| Plugin | Pure rules + `projectView` + `formatEvents` |
| Privacy | Hands only for viewer; selections hidden until reveal |

---

## 6. Testing

```bash
npm run test:bbge
```

Bullheads table, row placement, take-6, chooseRow, score-to-66.

---

## 7. Deferred

Fan specials, Beat the Buffalo, advanced draft, separate classic slug / editions.
