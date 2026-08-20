---
name: component-development
description: Build UI for The Game Shelf using existing Tailwind tokens. Use when adding or restyling components under src/features or src/shared. Do not introduce Ant Design, Less, shadcn, or a new palette.
---

# Component development

Read [`docs/decisions/ADR-002-keep-tailwind-not-antd.md`](../../../docs/decisions/ADR-002-keep-tailwind-not-antd.md). Tokens live in `src/app/globals.css`.

Visual skills (`design-taste-frontend`, etc.) are **references**. Conflict → this design system wins.

## Tokens

- Colors: `primary`, `primary-dark`, `accent`, `surface`, `border`
- Type: `font-heading`, `font-body`
- Chrome: `rounded-2xl border-border bg-white shadow-card`
- Layout: `mx-auto max-w-* px-4`

## Rules

1. Prefer existing components in `src/features/` and `src/shared/layout/`.
2. Interactive pieces: `"use client"` on the component, not the page.
3. Handle loading / empty / error where the UI can fail (chat, covers, score input).
4. Category is `board` | `card` only.
5. No dark mode, no new palette unless the user asks.

## Do not

- Ant Design, Less, shadcn/ui, ahooks
- Duplicate a card/button that already exists
- Import `app/` from features

## Checklist

- [ ] Reused an existing component when possible
- [ ] Tokens only (no one-off hex except in `globals.css`)
- [ ] Bilingual via `locale` / `useTranslations` as neighboring files do
