# Per-game play designs (BBGE)

One design doc per playable slug (or shared family when one plugin serves editions):

```
docs/games/<slug>.md
```

| File | Game | Status |
|------|------|--------|
| [love-letter.md](love-letter.md) | Love Letter — classic / full / expansion | Shipped on `main` (lobby edition picker; expansion art from card pack) |
| [texas-hold-em.md](texas-hold-em.md) | Texas Hold'em — NLHE one-hand cash (2–9) | Shipped on `main` (custom blinds, Motion + bubbles) |
| [6-nimmt-30th-anniversary.md](6-nimmt-30th-anniversary.md) | 6 nimmt! — classic / pro / fan / buffalo | Shipped on `main` (lobby mode picker, sync play) |
| [go.md](go.md) | Go — 9×9 / 13×13 teaching | Shipped MVP on `main` (AI + Go Teacher chat) |

Platform skill: [`.cursor/skills/browser-board-game-engine/`](../../.cursor/skills/browser-board-game-engine/SKILL.md).  
Shelf feature map: [`docs/architecture.md`](../architecture.md).

Keep these docs aligned with the running Play UI and plugin Actions when behavior changes.
