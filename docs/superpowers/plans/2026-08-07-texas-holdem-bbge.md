# Texas Hold'em BBGE Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship playable NLHE cash **one-hand** on The Game Shelf via BBGE (2–9, custom blinds, Host/hotseat/AI, Motion + action bubbles).

**Architecture:** Reuse PlayShell / HostSession / PeerJS / AiSeat. New plugin `bbge/plugins/texas-holdem` owns rules + `TexasHoldemTable`. Lobby extends stakes via `gameConfig`. Shelf binds `content/games/texas-hold-em/play.json`.

**Tech Stack:** TypeScript, Immer, Vitest, React, Motion, DeepSeek flash, existing Shelf tokens + ui-ux-pro-max (felt skeuomorphic table, reduced-motion aware).

## Global Constraints

- No poker rules in runtime/network; no DeepSeek inside plugin
- Seeded RNG only; Actions → immutable apply → Events
- Privacy: hole cards only for viewer; Host local seats only
- One hand ends match; rematch new seed same seats/stakes
- Bubbles from `formatEvents` (`speakerId` + `bubble`)
- Motion: deal / board flip / fold / bet (respect `prefers-reduced-motion`)
- Author: local `st2eam` / `379403404@qq.com`; verify then push

---

## File map

| Path | Responsibility |
|------|----------------|
| `bbge/plugins/texas-holdem/src/cards.ts` | Deck, ranks, suits |
| `…/handEval.ts` | Best 5-of-7 ranking |
| `…/pots.ts` | Main + side pot build / award |
| `…/state.ts` | State / Action / Config types |
| `…/rules.ts` | create / validate / apply / victory |
| `…/projectView.ts` | Private views |
| `…/plugin.ts` + `playModule.ts` + `index.ts` | Plugin export |
| `…/ui/TexasHoldemTable.tsx` | Table + actions + Motion + bubbles |
| `…/ui/formatEvents.ts` | Log + bubble copy |
| `…/ui/cardArt.ts` | Face URLs |
| `bbge/ai/src/mock-holdem-seat.ts` | Heuristic AI |
| `src/lib/bbge/DeepSeekTexasHoldemSeat.ts` | LLM seat |
| `bbge/ui` Lobby/PlayShell | Stakes controls when plugin is holdem |
| `content/games/texas-hold-em/play.json` | Bind |
| `docs/games/texas-hold-em.md` | Design SoT |

---

### Task 1: Cards + hand evaluator + tests

- [ ] `handEval` ranks categories high→low; ties by kickers
- [ ] `npm run test:bbge` green for eval cases

### Task 2: Betting engine + pots + createGame

- [ ] Deal, blinds (HU special), streets, fold/check/call/raise, all-in side pots
- [ ] Tests: HU hand, 3-way side pot, determinism

### Task 3: projectView + plugin + playModule + mock AI

- [ ] Register package path in tsconfig / vitest like love-letter
- [ ] Mock seat legal actions

### Task 4: Card art extract + Table UI (Motion + bubbles)

- [ ] Unzip faces to `public/images/bbge/texas-holdem/`
- [ ] Oval felt table; action bar; seat bubbles; deal/flip/fold/bet motion
- [ ] ui-ux-pro-max: Shelf palette, no purple neon; reduced-motion

### Task 5: Lobby stakes + Shelf wire + LLM seat

- [ ] Lobby SB/BB/stack; PlayShell `gameConfig`
- [ ] `play.json`, registerPlayPlugins, llmSeats
- [ ] `npm run test:bbge && npm run build` → commit push
