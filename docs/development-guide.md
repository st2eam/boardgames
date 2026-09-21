# Development guide

Read [`architecture.md`](architecture.md) and the matching skill before coding. Commands: [`CLAUDE.md`](../CLAUDE.md).

## Add a game (content)

Use [`.agents/skills/add-game/SKILL.md`](../.agents/skills/add-game/SKILL.md). Source of truth is `content/games/<slug>/`, not `public/data/`.

Each game uses one `en/rules.md` and one `zh/rules.md`; keep prose and
interactive structure in those files. Add explicit `rule-section`, `rule-ui`,
`rule-item`, `rule-choices`, and `rule-details` comments only when the intended
UI is clear. The build parses both locale files into `RuleDocument`; do not add
`flow.json`, `guide.json`, or a second rule source. See
[`rules-guide-system.md`](rules-guide-system.md) and
[`.agents/skills/hybrid-interactive-rules`](../.agents/skills/hybrid-interactive-rules/SKILL.md)
for the protocol and interaction decision guide.

For an existing rule document, audit the visible summary before adding a
disclosure: a player must be able to complete the current action without
opening hidden detail. Use ordered sidebars for real sequences, unordered
sidebars for lookup categories, tabs for parallel topics, and decisions only
for state-based branches.

## Add a page (route)

Use [`.agents/skills/page-development/SKILL.md`](../.agents/skills/page-development/SKILL.md).

- Keep `src/app/[locale]/**/page.tsx` as a Server Component.
- Load via `GameRepository` / `GameFactory`.
- Gated features: config file exists → `generateStaticParams` filters → page renders feature UI.
- Links: `` `/${locale}/…/` `` with trailing slash.

### Rule-page content changes

1. Edit both `content/games/<slug>/en/rules.md` and `zh/rules.md`.
2. Keep the `rule-section` ID sequence, heading levels, directives, defaults,
   decision graph, numeric facts, and image order equivalent.
3. Check the canonical page in guide and full modes, then test a representative
   `#rule-<id>` deep link, keyboard navigation, mobile overflow, print, and the
   no-JavaScript fallback.
4. Run `node scripts/validate-game-content.mjs`, then `npm run lint` and
   `npm run build`.

## Add UI

Use [`.agents/skills/component-development/SKILL.md`](../.agents/skills/component-development/SKILL.md). Tokens from `src/app/globals.css`. `"use client"` on interactive pieces under `src/features/` or `src/shared/`, not on whole game pages.

## Score / trainer / play

- Score: [`.agents/skills/add-score-tracker`](../.agents/skills/add-score-tracker/SKILL.md) — **default skip**.
- Trainer: [`.agents/skills/add-trainer`](../.agents/skills/add-trainer/SKILL.md) + [`trainer-system.md`](trainer-system.md).
- Play: [`.agents/skills/browser-board-game-engine`](../.agents/skills/browser-board-game-engine/SKILL.md). Leave `bbge/` as its own tree.

## Forbidden

- API routes, middleware, runtime Node in the Next app
- axios / Zustand / Ant Design / Less (see [ADR-002](decisions/ADR-002-keep-tailwind-not-antd.md), [ADR-003](decisions/ADR-003-content-repository-no-axios.md))
- Page-level `fetch` of `content/games` or a parallel loader
- Client `fetch` without `/boardgames/` prefix
- New palette, dark mode, or a second design system
- Empty feature `services/` / `store/` folders
- Editing `public/data/` by hand

## Verify

[`.agents/skills/testing/SKILL.md`](../.agents/skills/testing/SKILL.md): `npm run lint`, `npm run build`; `npm run test:bbge` if play/engine changed. Then commit + push per `.cursor/rules/verify-then-push.mdc`.
