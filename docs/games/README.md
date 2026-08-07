# Per-game play designs (BBGE)

One design doc per playable slug (or shared family when one plugin serves editions):

```
docs/games/<slug>.md
```

| File | Game | Status |
|------|------|--------|
| [love-letter.md](love-letter.md) | Love Letter — classic / full / expansion | Shipped — multi-round ♥ match + AI + battleLog |
| [texas-hold-em.md](texas-hold-em.md) | Texas Hold'em — NLHE cash session (2–9) | Shipped — aggressive pot-odds AI, bubbles, shared log UI |
| [6-nimmt-30th-anniversary.md](6-nimmt-30th-anniversary.md) | 6 nimmt! — classic / pro / fan / buffalo | Shipped — trap-aware mock + LLM + shared log scroll |
| [go.md](go.md) | Go — 9×9 / 13×13 / 19×19 | Shipped — capture-first mock + Go Teacher + battleLog |
| [cabo.md](cabo.md) | CABO — 2–4 memory card game | Shipped — multi-round cumulative + AI + battleLog |
| [uno.md](uno.md) | UNO — classic / Flip / No Mercy | Shipped — shared plugin + editions + AI + battleLog |

Platform skill: [`.cursor/skills/browser-board-game-engine/`](../../.cursor/skills/browser-board-game-engine/SKILL.md).  
Shelf feature map: [`docs/architecture.md`](../architecture.md).  
Add-game skill (content + play checklist): [`.cursor/skills/add-game/SKILL.md`](../../.cursor/skills/add-game/SKILL.md).

Keep these docs aligned with the running Play UI and plugin Actions when behavior changes.

---

## AI seats (normative, 2026-08-07)

All playables use Host-only `AiSeat`: DeepSeek `deepseek-v4-flash` when a key is present, else the plugin/mock heuristic. Illegal LLM actions get one feedback retry, then mock fallback.

**Every LLM `think` receives `opts.battleLog`** — chronological `formatEvents` lines for all seats (recent ~100; UI “thinking…” noise stripped). New DeepSeek seats **must** append `battleLogPromptBlock` (`src/lib/bbge/aiBattleLog.ts`). `speak` defaults to 简体中文 when `locale !== "en"` (Action JSON types stay English).

| Plugin | Mock / heuristic | LLM persona |
|--------|------------------|-------------|
| `love-letter` | Keep power cards; Guard/Bishop use `seen` + discards; Handmaid protects highs; never volunteer Princess | Clever human — deduction + timing + battle log |
| `texas-holdem` | Aggressive pot-odds: smash strong hands; with air/draws call or raise when the price is right (not tight-TAG) | Same — value hard, enter on pot odds |
| `six-nimmt` | Avoid 5th-card traps; smallest-gap fits; choose lowest-bullhead rows when forced | Careful human — minimize heads, use log to anticipate rows |
| `go` | Liberty/atari/area policy (+ resign when lost) | Hybrid: policy moves + LLM speak (+ Go Teacher) |
| `cabo` | Swap away highs; peek/spy abilities; call when estimate low | Memory human — track discards, cautious CABO + battle log |
| `uno` | Prefer action cards; call UNO; stack in No Mercy | Table talk human — pressure next seat + battle log |

**UI:** battle logs use shared `@bbge/ui` `BattleLogList` + mobile `PlaySideSheet` (`70dvh`).

Mocks must stay **deterministic** (no `Math.random()`); use hash mixes over seat/cards/street when mixing frequencies.
