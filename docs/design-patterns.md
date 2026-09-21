# Design patterns in use

Do not add a pattern unless it isolates a real variation point. Template: problem → variation → boundary → pattern → extend → test.

## Repository + Factory

- **Problem:** Pages need game meta/rules/feature flags from disk at build time.
- **Variation:** New slugs, localized Markdown, optional score/trainer/play configs.
- **Boundary:** [`src/lib/content/GameRepository.ts`](../src/lib/content/GameRepository.ts) (IO) + [`GameFactory.ts`](../src/lib/content/GameFactory.ts) (assemble `Game` / `GameSummary`).
- **Extend:** New optional file → repository `hasX` / `getX`, factory field, page `generateStaticParams`.
- **Test:** Build emits the new route; do not mock a second filesystem API.

## Markdown AST + progressive enhancement

- **Problem:** A rules page must support continuous reading and fast table-side
  lookup without keeping duplicate prose in JSON or React.
- **Variation:** Ordered setup, parallel tabs, topic categories, optional
  details, and state-based decisions.
- **Boundary:** `parseRuleDocument()` produces `RuleDocument`;
  `RuleDocumentExperience` renders the reusable interaction primitives.
- **Extend:** Add a stable Markdown directive and shared parser/type/rendering
  support only when the rule shape repeats across games. Keep `rules.md` as the
  only source; never restore `flow.json`, `guide.json`, or a flow route.
- **Test:** `node scripts/validate-game-content.mjs`, both locales, guide/full
  modes, deep links, keyboard/mobile behavior, print, and no-JavaScript output.

## Strategy (dispatch by type)

- **Problem:** Chat scope, score UI, and trainer UI each have a few mutually exclusive behaviors.
- **Variation:** New chat scope, new `score.json` `type`, new trainer `type`.
- **Boundary:** `GlobalChatStrategy` / `GameChatStrategy`; `features/score/registry.tsx`; `features/trainer/registry.tsx`.
- **Extend:** Add a case + component; do not grow a generic calculator (score gate).
- **Test:** Registry switch + one happy-path UI; BBGE/LLM strategies have their own tests where they exist.

## Adapter

- **Problem:** Chat must talk to an LLM without baking vendor HTTP into UI.
- **Variation:** Provider URL, SSE shape, tools.
- **Boundary:** [`src/lib/ai/DeepSeekAdapter.ts`](../src/lib/ai/DeepSeekAdapter.ts).
- **Extend:** New adapter implementing the same chat port; swap at the provider.
- **Test:** Adapter unit tests or a recorded SSE fixture — not page tests.

## Plugin (BBGE)

- **Problem:** Online tables share host/runtime but games do not share rules.
- **Variation:** New playable slug.
- **Boundary:** `bbge/plugins/<id>/` + `registerPlayModule` + `play.json`.
- **Extend:** Follow the BBGE skill; do not import plugins from `app/`.
- **Test:** `npm run test:bbge`.

## Context (not Zustand)

- **Problem:** Chat needs a streaming session, API key modal, and scoped history.
- **Variation:** Global vs game vs go-tutor.
- **Boundary:** [`src/features/chat/ChatProvider.tsx`](../src/features/chat/ChatProvider.tsx). Persistence helpers stay in `src/lib/chat/`.
- **Extend:** New scope on the existing provider; do not add a global store.
- **Test:** Manual stream + IndexedDB round-trip; no Zustand.

## Cross-feature UI (allowed, keep acyclic)

| From | To | Why |
|------|----|-----|
| `rules` | `rules` (`RuleDocumentExperience`) | Markdown AST sections render interactive rule containers |
| `rules` | `trainer` (`InlineTile`) | Mahjong tiles in rules markdown |
| `calculator` | `trainer` (`MahjongTile`) | Same tile chrome |
| `trainer` / pages | `chat` (`ChatToggle`) | FAB on those screens |

Do not import `app/` from features. Do not import features from `lib/<domain>`.
