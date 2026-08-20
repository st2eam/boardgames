# ADR-002: Tailwind tokens, not Ant Design / Less

- **Status:** Accepted
- **Date:** 2026-08-20

## Context

A generic frontend template pins Less + Ant Design + `@ant-design/icons`. This site already has a warm wood/amber tabletop look in [`src/app/globals.css`](../../src/app/globals.css) (`primary` / `accent` / `surface` / `border`, Fredoka + Nunito + Noto Sans SC).

## Decision

Keep **Tailwind CSS v4** + project tokens. Do **not** add Ant Design, Less, or Less Modules.

That template’s own UI rule still applies: if a UI skill defaults to shadcn/Ant Design/Tailwind-of-another-palette, **this design system wins**.

## Why not Ant Design

- Admin-console chrome fights the tabletop identity.
- Tokens, card rhythm (`rounded-2xl border-border bg-white shadow-card`), and rule SVGs already assume the current palette.
- Extra CSS runtime and icon pack with no product gain.

## Consequences

- New UI uses existing tokens only; no new palette unless the user asks.
- Visual skills (`design-taste-frontend`, etc.) are references, not a license to restyle the stack.
- Component skill: [`.cursor/skills/component-development`](../../.cursor/skills/component-development/SKILL.md).
