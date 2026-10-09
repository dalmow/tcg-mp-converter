# ADR 0001: Architecture overview

Status: accepted

## Context

Personal tool that converts a Pokémon TCG Decklist into the search format of single-card Marketplaces (Liga Pokemon, MYPCards). It also has a portal to build Decks (max 60 cards) and track owned cards (Adquirido). Domain vocabulary is in `CONTEXT.md`. Code is English; user-visible strings are Portuguese.

## Stack

- TypeScript 6, React 19, react-router 8, Vite 8, Tailwind 4.
- UI: `@base-ui/react` primitives (wrappers in `src/shared/ui/`), `cmdk` for the card combobox.
- Tests: Vitest. Lint: oxlint.
- Hosting: Vercel (`vercel.json`: `cleanUrls`, rewrites of `/decks/new`, `/decks/:id`, `/maintenance` to `/spa.html`).

## Decisions

1. **No backend; client-only persistence.** Decks and the owned map live in one `localStorage` key (`ptcg:v1`) behind a `DeckStorage` interface (`load`, `save`, `subscribe`). Cross-tab sync uses `subscribe`. The backup menu imports and exports the data (`src/features/backup/lib/backup.ts`).
2. **Prerender public pages, SPA for the rest.** `prerenderPlugin` in `vite.config.ts` renders each entry of `PUBLIC_PAGES` to static HTML after the client build, using `renderApp` from `src/entry-server.tsx`. The empty shell becomes `spa.html`, which `vercel.json` serves for routes with no prerendered file. Server and browser share `AppRoutes` and a data router, so markup and React ids match.
3. **Pure logic in each feature's `lib/`, UI in its `components/`.** Conversion (`convertDecklist`), card parsing (`cardParser`), deck rules (`deckRules`), store (`deckStore`) and maintenance (`maintenance`) have no React dependency and have unit tests next to them. Layout and import rules: [ADR 0002](0002-feature-based-layout.md).
4. **Draft model for the Deck editor.** Edits live in memory (`draft.ts`, `rowLogic.ts`). `saveDeck` writes everything at once, all or nothing. Invalid Decks can be saved; only data that cannot become data blocks the save.
5. **Card key scheme.** The key is unique in the global owned map: `SET-number`, normalized trainer name, or `energy:<type>` for basic energy.
6. **Collections as static data.** `src/shared/data/collections.json` maps each known Coleção sigla to its card total. Unknown ones become Cartas não resolvidas, not failures.
7. **Accessibility and SEO are tracked work.** See `docs/accessibility-audit.md` and `docs/seo-audit.md`. Shared helpers: `src/shared/lib/contrast.ts`, `src/shared/lib/seo.ts`, `usePageMeta`, `src/shared/lib/pageMeta.ts`.

## Structure

Source: codebase graph, 776 nodes, 2015 edges, 74 TypeScript files.

- `src/app/`: `AppRoutes` (route table), `Navbar` (app shell with the backup menu).
- `src/features/`: `decks` (deck list and editor screens, deck domain), `maintenance`, `backup`, `converter`, `landing`. Each has `components/`, `lib/`, `types/` and an `index.ts` public API.
- `src/shared/`: `ui/` (primitives, `Panel`, `Logomark`, `NavIcons`), `layout/` (`PageLayout`), `hooks/`, `lib/` (SEO, contrast, page meta, routes, utils), `types/domain.ts`, `data/collections.json`.

Dependency direction: `app` composes features through their `index.ts` and calls `shared`; features call `shared`; `shared` calls nothing in the app or in features.

## Hotspots

Highest fan-in: `deckStore.getDeckStore` (13), `cardParser.parseCard` (8), `shared/ui/Button` (8), `ToastProvider` (6), `cardParser.normalizeName` (5), `useToast` (5), `deckStore.commit` (5), `shared/ui/Input` (5), `seo.absoluteUrl` (4), `usePageMeta` (4).

Most deck features depend on `deckStore` and `cardParser`. Change them with care.

## Consequences

- No server means no multi-device sync. The backup file is the only transfer path.
- Stored data is versioned by key (`ptcg:v1`). A schema change needs a new key or a migration in `storage.ts`.
- A new public route must be added to `PUBLIC_PAGES`. A new client-only route must be added to `vercel.json` rewrites.
