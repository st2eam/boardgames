# ADR-003: Content repository, no axios / Zustand

- **Status:** Accepted
- **Date:** 2026-08-20

## Context

The same template wants `src/services/` + axios, and Zustand for global state. This app has **no REST BFF**. Content is files; chat is a browser LLM; score trackers persist in `localStorage`; chat history/keys in IndexedDB.

## Decision

- **Build/SSG data:** [`GameRepository`](../../src/lib/content/GameRepository.ts) / [`GameFactory`](../../src/lib/content/GameFactory.ts) reading `content/games/`.
- **Client runtime data:** `fetch("/boardgames/data/…")` for generated JSON (chat context, covers).
- **Feature state:** React state, Context (`ChatProvider`), or `localStorage` next to the UI.
- Do **not** add axios, ahooks, or Zustand.

## Why

- An axios instance with interceptors/token would wrap nothing.
- Putting every score/chat field in Zustand is global-state abuse.
- Chat is a streaming session tree; Context colocated with the feature is the right boundary.

## Consequences

- Pages must not invent a second content loader.
- Do not create empty `services/` / `store/` folders per feature.
- LLM vendor changes go through `src/lib/ai/DeepSeekAdapter.ts` (Adapter), not a new HTTP library.
