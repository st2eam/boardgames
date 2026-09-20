---
name: page-development
description: Add or change App Router pages in The Game Shelf. Use when creating routes under src/app/[locale], generateStaticParams, SEO metadata, or wiring a feature page. Static export only — no API routes or middleware.
---

# Page development

Read [`docs/architecture.md`](../../../docs/architecture.md) and [`docs/development-guide.md`](../../../docs/development-guide.md) first.

## Rules

1. Pages under `src/app/[locale]/**/page.tsx` stay **Server Components**.
2. Load games via `GameRepository` / `GameFactory`. Do not `fs` or `fetch` content from a second path.
3. Gated features: config file on the slug → include in `generateStaticParams` → render feature UI from `src/features/`.
4. Links: `` `/${locale}/…/` `` (trailing slash). `basePath` is `/boardgames`.
5. Metadata: `buildPageMetadata` from `@/lib/seo`.
6. `"use client"` belongs in `src/features/` or `src/shared/`, not on the whole page.

## Do not

- API routes, middleware, `cookies()`, runtime Node
- axios / Zustand
- Client `fetch` without `/boardgames/` prefix
- Put feature UI in `src/app/` beyond a thin page

## Checklist

- [ ] `generateStaticParams` covers both locales when the route is dynamic
- [ ] `notFound()` when config/meta is missing
- [ ] Trailing slashes on internal links
- [ ] `npm run build` after adding a route
