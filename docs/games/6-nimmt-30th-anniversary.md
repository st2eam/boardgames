# 6 nimmt! — BBGE Play Design

Per-game design for the Browser Board Game Engine playable slice.  
Platform: [`.cursor/skills/browser-board-game-engine/`](../../.cursor/skills/browser-board-game-engine/).  
Shelf: [`docs/architecture.md`](../architecture.md).

| | |
|---|---|
| **Status** | Shipped on `main` — playable Host / hotseat / AI |
| **Slug** | `6-nimmt-30th-anniversary` |
| **Plugin** | `six-nimmt` |
| **Modes** | Classic · Pro draft · 4 fan variants · Beat the Buffalo |
| **Match** | Classic/fan/pro → **66** bullheads (lowest wins); Buffalo → one round team vs buffalo |
| **Players** | Classic/fan **2–10**; Pro/Buffalo **2–6** (Buffalo also **1**) |
| **Play UI** | BGA-style DOM table + Motion; lobby mode picker |
| **Card art** | CSS number cards 1–104 with bullhead badges |

---

## 1. Goal

Rules page → **开始游戏** → lobby **选模式** → Host room → hotseat / AI / share-link →
play until end condition → host rematch (same mode).

---

## 2. Decisions

| Topic | Choice |
|-------|--------|
| Approach | A — PlayShell + `bbge/plugins/six-nimmt` + PeerJS |
| Modes | Lobby `edition` / `mode` string (same channel as Love Letter editions) |
| Simultaneous | Selecting: AI think in parallel; reveal when all locked |
| Buffalo specials | Face-up market + `beginPlace`; Take7/Stop/Replace/First/Last wired; Insert/Push/Sort payload-ready, UI minimal |
| Out | Pixi, timers, combining fan variants |

---

## 3. Modes

| Mode id | Rules |
|---------|--------|
| `classic` | Base 2–10, score to 66 |
| `pro` | Draft `n×10+4` face-up, then classic play (2–6) |
| `fan-even-odd` | Parity marker on lowest-end row |
| `fan-mountain` | One descending row; marker walks after takes |
| `fan-jumping-cow` | Cow occupies a slot and jumps |
| `fan-flippin` | Once-per-player digit flip for placement order |
| `buffalo` | Coop 1–6; shared team pile; buffalo auto too-low; specials phase |

---

## 4. Actions

| Action | When |
|--------|------|
| `playCard` `{ cardId, flip? }` | `selecting` |
| `chooseRow` `{ rowIndex }` | `chooseRow` |
| `draftPick` `{ cardId }` | `drafting` (pro) |
| `useSpecial` / `beginPlace` / `removeStop` | `specials` (buffalo) |

---

## 5. Testing

```bash
npm run test:bbge -- --run bbge/plugins/six-nimmt
```

---

## 6. Deferred polish

Richer UI for Insert / Push / Sort specials; fan+buffalo combo (officially not combined).
