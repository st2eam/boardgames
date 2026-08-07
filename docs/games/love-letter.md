# Love Letter — BBGE Play Design (v1)

Per-game design for the Browser Board Game Engine playable slice.
Platform contracts: [`.cursor/skills/browser-board-game-engine/`](../../.cursor/skills/browser-board-game-engine/).
Shelf architecture: [`docs/architecture.md`](../architecture.md).

**Status:** Playable on `main` — PixiJS table + GSAP card motion + Motion HUD  
**Convention:** Playable game designs live at `docs/games/<slug>.md`.

> Rules engine matches site **Full Game** (Princess = 9, 21 cards incl. Chancellor/Spy), not classic 8-rank only.  
> Play surface: `LoveLetterPixiArena` (WebGL) — not DOM card buttons.  
> Card art: `public/images/bbge/love-letter/*` sourced from `public/downloads/love-letter-cards.zip`.

---

## 1. Goal

From The Game Shelf Love Letter rules page → **开始游戏** (first action in
`GameHeader`) → Host creates a room → friends join via shareable link →
optional AI seats (DeepSeek on Host) → finish **one round** and declare a winner.

---

## 2. Decisions

| Topic | Choice |
|-------|--------|
| Approach | **A** — Shelf shell + `bbge/*` + light signaling (PeerJS or equivalent) + WebRTC data channel |
| First plugin | `love-letter` |
| Match length | **One round ends the match** (no favor-token multi-round for v1) |
| Multiplayer | Host + share-link join from day one |
| AI | Reusable Host **`AiSeat`**: think → Action, speak → table chat; same IndexedDB DeepSeek key as site chat |
| Replay tools | **Out of scope** (no replay viewer / timeline SDK) |
| UI entry | `content/games/love-letter/play.json` → `hasPlay` → `/[locale]/games/love-letter/play/` |

---

## 3. Scope

### 3.1 In

- `play.json` + Play button **first** in `GameHeader`
- `bbge`: core, runtime (Create→Lobby→Initialize→Playing→Finished), sync, network adapter, minimal UI
- Engine domains: `cards` + `turns` only as needed
- Plugin: deal, play, target/guess flows, eliminate, single-round victory
- Lobby: seats, join, add/remove AI, ready, start, copy link
- `projectView` hidden hands; illegal Action reject UX
- Determinism tests (seed + action list); mock AiSeat tests
- AI thinking presence + table speech broadcast to all peers

### 3.2 Out

- Replay viewer / replay tooling UI
- Favor tokens / multi-round match
- Spectators, matchmaking, ranked, cloud save
- Host migration; rich disconnect recovery (v1: best-effort same-room rejoin)
- Second game plugin, marketplace, hot-load arbitrary plugins
- Full board/hex/dice kits beyond Love Letter needs
- Guest-side LLM; rule-AI fallback without API key (Host must have key to run AI seats)

---

## 4. Architecture

```
Game Shelf                              bbge/
├─ GameHeader [开始游戏] …              ├─ core / runtime / sync
├─ /games/love-letter/play/  ─────────►├─ network (WebRTC + signaling)
│    PlayShell                          ├─ ui (Card/Hand/Seat/AI activity)
│                                       ├─ ai/AiSeat → DeepSeekAdapter (Host)
└─ content/.../play.json                └─ plugins/love-letter (rules only)
     { "pluginId": "love-letter", … }
```

| Boundary | Rule |
|----------|------|
| Shelf `play/page` | Mount shell only; resolve `pluginId` from `play.json` |
| Runtime | Lifecycle, Host pipeline, seat/AI scheduling |
| Plugin | Pure rules; no network / DeepSeek / DOM |
| AiSeat | Host only; emits Actions + `aiPresence` (thinking/chat) |
| Network | Transports Action / Event / view / lobby / aiPresence / snapshot |

See also: skill [architecture.md §9](../../.cursor/skills/browser-board-game-engine/architecture.md) (UI entry), [§11](../../.cursor/skills/browser-board-game-engine/architecture.md) (v1 slice), [plugin-api.md §16](../../.cursor/skills/browser-board-game-engine/plugin-api.md) (AiSeat).

---

## 5. Room & data flow

### 5.1 Lobby

1. Host opens `/play/` → `Create` → signaling allocates `roomId` → share URL `...?room=`
2. Guest opens link → WebRTC data channel to Host → claim seat + display name
3. Host may add/remove AI seats; all ready → Host Start → `createGame` + seed → Playing

### 5.2 Playing

```
Guest UI → Action → WebRTC → Host
  → validate → apply → Events + per-peer GameView → broadcast

AI turn (Host only):
  ai/thinking on → DeepSeek think → Action (same pipeline)
  → optional speak → ai/chat → thinking off
```

### 5.3 Wire messages (conceptual)

`action` · `actionReject` · `events` · `view` (filtered) · `lobby` · `aiPresence` · `snapshot` (rejoin)

### 5.4 Failure modes

| Case | Behavior |
|------|----------|
| Illegal Action | Reject + toast; state unchanged |
| AI / API failure | Host error; no illegal auto-move; retry |
| Missing API key + AI seat | Block Start or disable AI until key configured |
| Sync gap | Request snapshot; else prompt rejoin |
| Host closes tab | Room ends (no migration in v1) |
| Signaling down | No new joins; existing P2P may continue |

**Trust (v1):** Host trusted; guests render Host views only; private cards never in others’ views.

---

## 6. Plugin & UI

### 6.1 Plugin

- `createGame`: build deck for player count, remove burn cards, deal (via `ctx.rng` only)
- Actions (illustrative): `playCard`, `guessPlayer`, target/card choice payloads (one or two-step Actions)
- `projectView`: own hand private; public discard / eliminated visible
- `checkVictory`: winner of **this single round** → Finished

### 6.2 UI

- Lobby: React seat cards, AI controls, ready, copy link (non-Pixi)
- **Table (Playing):** BGA-inspired DOM table — status bar, green felt center, large clickable hand, right-side player panels + log + chat
  - Code: `bbge/plugins/love-letter/src/ui/LoveLetterTable.tsx` + `ui/bga/*`
  - Card art: `public/images/bbge/love-letter/`
- Interaction: click hand → click target panel (if needed) → Play; Guard guess chips; Chancellor keep confirm
- Priest: peek opens a confirm modal (turn does not advance until “我看完了”); cards support Zoom / 大图 lightbox
- AI pacing: ~1.4–3s think + gap between AI seats; table talk after each AI act
- After each play, next seat draws immediately so the hand stays full
- Play CTA: strongest accent button, **first** in header row

### 6.3 Content bind

```json
{
  "pluginId": "love-letter",
  "pluginVersion": "0.1.0"
}
```

Path: `content/games/love-letter/play.json`.

---

## 7. AiSeat

- Game-agnostic Host runner; plugins never call DeepSeek
- Reuse `DeepSeekAdapter` + chat thinking/activity UX patterns
- `Think(view) → Action` then Host `validateAction` (discard invalid model output / retry)
- `Speak(context) →` short flavor line (does not mutate `GameState` / RNG)
- Guests need no API key

---

## 8. Testing

1. Determinism: fixed seed + action script → state hash
2. Illegal moves rejected
3. `projectView` does not leak other hands
4. Serialize round-trip
5. AiSeat with mock adapter returns legal Actions

No player-facing replay tool.

---

## 9. Success criteria

Two browsers finish a Love Letter **single round** with ≥1 human and ≥1 AI seat;
AI thinking visible before act; AI can post a short table message.

---

## 10. Deferred (post-v1)

- Replay tools, spectators, host migration, robust reconnect
- Favor-token multi-round matches
- Public TURN / self-hosted signaling
- Second plugin; AI difficulty tiers; rule-AI when no key
- Matchmaking / workshop

---

## 11. Implementation

- Plan: [`docs/superpowers/plans/2026-08-07-bbge-love-letter-v1.md`](../superpowers/plans/2026-08-07-bbge-love-letter-v1.md)
- Skill checklist: [BBGE SKILL.md](../../.cursor/skills/browser-board-game-engine/SKILL.md) (V1 slice)
