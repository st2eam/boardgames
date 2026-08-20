# Project structure

One-page map. Details: [`architecture.md`](architecture.md).

```
content/games/          Source of truth (meta, rules.md, optional flow/score/trainer/calculator/play)
docs/                   Architecture, ADRs, BBGE game specs, score/trainer systems
src/app/[locale]/       Routes only (RSC pages + layouts). No heavy UI here.
src/features/           Feature UI (catalog, rules, flow, score, trainer, calculator, play, chat, costs)
src/shared/layout/      Header, Footer, BackToTop
src/lib/content/        GameRepository + GameFactory (only content warehouse)
src/lib/<domain>/       Pure logic: mahjong, blackjack, texas-holdem, go, score, ai, chat helpers, bbge seats
src/types/game.ts       Shared content types
bbge/                   Playable engine (do not fold into features)
public/data/            Generated at prebuild — not hand-edited
scripts/                prebuild / postbuild / icon regen only
```

## Dependency direction

`content` → `lib/content` → `app` pages → `features` → `lib/<domain>` / `bbge`

Do not reverse: domain libs must not import `app/` or `features/`.

## Feature folders

| Folder | Owns |
|--------|------|
| `features/catalog/` | Homepage grid, cards, sidebar, covers |
| `features/rules/` | Game header, markdown, TOC, export, related, play start |
| `features/flow/` | Decision tree + Sea Salt card reference |
| `features/score/` | Dedicated multi-round trackers |
| `features/trainer/` | Trainer UI + registry |
| `features/calculator/` | Riichi han/fu calculator UI |
| `features/play/` | Play page client shell (BBGE stays in `bbge/`) |
| `features/chat/` | FAB, dialog, provider |
| `features/costs/` | Cost dashboard |
| `shared/layout/` | Chrome around every locale page |

Do **not** add empty `services/` / `store/` / `repositories/` inside a feature.
