# Per-game play designs (BBGE)

One design doc per playable slug (or shared family when one plugin serves editions):

```
docs/games/<slug>.md
```

| File | Game | Status |
|------|------|--------|
| [love-letter.md](love-letter.md) | Love Letter — classic / full / expansion | Shipped — strategic mock + LLM seat |
| [texas-hold-em.md](texas-hold-em.md) | Texas Hold'em — NLHE cash session (2–9) | Shipped — showdown reveal, TAG/GTO AI, mobile polish |
| [6-nimmt-30th-anniversary.md](6-nimmt-30th-anniversary.md) | 6 nimmt! — classic / pro / fan / buffalo | Shipped — trap-aware mock + LLM seat |
| [go.md](go.md) | Go — 9×9 / 13×13 / 19×19 | Shipped — capture-first mock + Go Teacher |

Platform skill: [`.cursor/skills/browser-board-game-engine/`](../../.cursor/skills/browser-board-game-engine/SKILL.md).  
Shelf feature map: [`docs/architecture.md`](../architecture.md).

Keep these docs aligned with the running Play UI and plugin Actions when behavior changes.

---

## AI seats (normative, 2026-08-07)

All playables use Host-only `AiSeat`: DeepSeek `deepseek-v4-flash` when a key is present, else the plugin/mock heuristic. Illegal LLM actions get one feedback retry, then mock fallback.

| Plugin | Mock / heuristic | LLM persona |
|--------|------------------|-------------|
| `love-letter` | Keep power cards; Guard/Bishop use `seen` + discards; Handmaid protects highs; never volunteer Princess | Clever human table player — deduction + timing |
| `texas-holdem` | TAG / GTO-flavoured: value-bet made hands, fold junk to heat, semi-bluff draws, selective river blocker bluffs (deterministic mix) | Mature TAG — balanced value + bluffs, not LAG splash |
| `six-nimmt` | Avoid 5th-card traps; smallest-gap fits; choose lowest-bullhead rows when forced | Careful human — minimize heads, think ahead |
| `go` | Prefer captures / local answers; opening corners·sides; pass when quiet | Club-strength purposeful opponent (+ in-table Go Teacher) |

Mocks must stay **deterministic** (no `Math.random()`); use hash mixes over seat/cards/street when mixing frequencies.
