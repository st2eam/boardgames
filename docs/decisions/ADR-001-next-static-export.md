# ADR-001: Next.js App Router + static export

- **Status:** Accepted
- **Date:** 2026-08-20

## Context

The Game Shelf is a bilingual rules site (≈59 games), deployed to GitHub Pages under `basePath: /boardgames`. Pages need SEO, per-game metadata, and a large SSG surface (rules, flow, score, trainer, calculator, play).

An AI-native frontend template suggested choosing Vite + React SPA **or** Next.js App Router. SPA would require a separate prerender/SEO/i18n story.

## Decision

Keep **Next.js App Router** with `output: "export"` and `trailingSlash: true`. No runtime Node server, no API routes, no middleware.

## Why not Vite SPA

- `generateStaticParams` already emits locale × slug routes.
- RSC keeps `react-markdown` off the client bundle for rule pages.
- GitHub Pages + `basePath` is already wired (SEO, SW, covers).
- Recreating that as a Vite SPA is negative ROI.

## Consequences

- Client data must use the `/boardgames/` prefix.
- Chat talks to DeepSeek from the browser (CORS + user API key).
- Do not add SSR-only Next features.
