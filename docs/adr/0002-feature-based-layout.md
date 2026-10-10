# ADR 0002: Feature-based layout

Status: accepted

## Context

The code was organized by technical type: `src/components/` (with `deck-editor/`, `maintenance/`, `ui/`), `src/lib/` (with `deck/`), `src/pages/`, and hooks were split between `components/` and `lib/`. Finding everything one feature needs meant jumping across three trees. `.claude/rules/typescript-react-vite.md` asks for `features/<name>/` with shared modules in `shared/`. The other issues in the "Redesign: Convenções" milestone and every issue in "Redesign: Ajustes" depend on this layout.

## Decision

### Layers and dependency direction

```
src/
  main.tsx, entry-server.tsx, index.css   entry points, fixed by index.html, vite.config.ts and the CSS import
  app/        composition: AppRoutes, Navbar (app shell), navLinkClass, vercelConfig.test
  features/   one folder per feature; may import shared/ and other features' index.ts
  shared/     cross-feature UI, hooks, pure helpers, domain types, static data; imports nothing from app/ or features/
```

- `app/` may import any feature through its `index.ts` and any `shared/` module. Route screens are the exception: `app/lazyPages.ts` imports them by path, so each screen is its own chunk (DAL-59).
- A feature may import `shared/`. It imports another feature only through that feature's `index.ts`.
- `shared/` never imports `features/` or `app/`. `features/` never imports `app/`.
- The graph has no cycles: `app → features/* → shared`, and `maintenance` and `backup` depend on `decks`.

### Feature map

| Feature       | Owns                                                                                                                                                                                | Public API (`index.ts`)                                                                  |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `decks`       | deck list and editor screens, deck editor components, deck domain (`types/deck.ts`, `lib/deckStore`, `lib/storage`, `lib/deckRules`, `lib/cardParser`, `lib/draft`, `lib/rowLogic`) | Deck store and storage, deck types and rules used by other features (screens: see above) |
| `maintenance` | Manutenção screen, `MaintenanceRow`, `lib/maintenance`                                                                                                                              | `MaintenancePage`                                                                        |
| `backup`      | `BackupMenu`, `BackupList`, `BackupImportDialog`, `useBackup`, `lib/backup`                                                                                                         | `BackupMenu`, `BackupList`, `BackupImportDialog`, `useBackup`, `buildBackup`             |
| `converter`   | Conversor screen, `lib/convertDecklist`                                                                                                                                             | `ConverterPage`                                                                          |
| `landing`     | landing page at `/`                                                                                                                                                                 | `LandingPage`                                                                            |

`shared/` holds what more than one feature or the app shell uses:

- `shared/ui/`: UI primitives (`Button`, `ButtonGroup`, `Card`, `Input`, `Label`, `Switch`, `Textarea`, `Badge`, `AlertDialog`, `DropdownMenu`, `Command`, `Toast`, `ProgressBar`, `RowState`), plus `Panel`, `Logomark` and `NavIcons`. `buttonVariants` (the `Button` variant table) sits in `buttonVariants.ts`, so component files export components only.
- `shared/layout/`: `PageLayout` and `mainContent` (the skip-link target id).
- `shared/hooks/`: `usePageMeta`, `useHydrated`, `useToast` (with the `ToastContext` it reads).
- `shared/lib/`: `utils`, `contrast`, `seo`, `site`, `pageMeta`, `routes`, `cardNumber`.
- `shared/types/domain.ts`: `Condition`, `Language`, `CollectionConfig`, `UnresolvedCard`, `ConvertDecklistResult`.
- `shared/data/collections.json`: the Coleção → card total table, used by the converter and the deck screens.

`Navbar` lives in `app/`, not `shared/`: it renders the backup menu, and `shared/` must not depend on a feature.

### Feature folders

```
features/<name>/
  components/   React components, including the route component (<Name>Page.tsx)
  hooks/        custom hooks, only when a feature has one
  lib/          pure logic without React, tests next to it
  types/        domain types
  index.ts      public API
```

- There is no `pages/` folder. A route component is the feature's page. `app/AppRoutes.tsx` composes the routes. Route components keep their default export, which `app/lazyPages.ts` lazy-imports by path (DAL-59). A feature index does not re-export a screen that another feature imports statically, because the screen would then load with the entry chunk. `decks` is that case: the backup feature imports its index.
- There is no `api/` folder. The app has no backend, so persistence lives in `decks/lib/storage.ts`. When a backend exists, add `api/` to that feature.
- This differs from the folder list in `.claude/rules/typescript-react-vite.md` (`components,hooks,api,types`): `lib/` is added and `api/` is omitted. That file is not changed in this decision; update it to match.

### Naming

- Folders: lowercase, one word (`decks`, `backup`).
- `.tsx` files: PascalCase, named after the main component (`DeckEditor.tsx`, `ButtonGroup.tsx`). The shadcn-style kebab-case names in `ui/` are renamed.
- Hooks: `useX`, in `hooks/` (`useBackup.tsx`, `usePageMeta.ts`, `useToast.ts`). A context hook sits in `hooks/` next to its context, not in the provider's component file (`useToast.ts` holds `ToastContext`).
- `.ts` modules: camelCase (`deckStore.ts`, `rowLogic.ts`).
- Tests: next to the module, `<module>.test.ts(x)`.
- Constants: UPPER_SNAKE_CASE (`ROUTES`, `DECK_SIZE`, `MAIN_CONTENT_ID`).

### Import rules

- Use the `@/` alias for every import that leaves the folder. No `../` in module imports under `src/`. A test that reads a file by path (`readFileSync(new URL('../../index.css', import.meta.url))`) keeps that path relative to the test file. It is a file read, not a module import.
- `./name` is allowed only for a file in the same folder. Use `@/` for a sibling subfolder (`@/features/decks/lib/deckStore`).
- Import another feature through `@/features/<name>` only.
- Module imports of files outside `src/` keep relative paths, because the alias maps `src/` only. Current cases: `vite.config.ts`, and `vercel.json` imported by `src/app/vercelConfig.test.ts`.

## Consequences

- Move only, with `git mv` and no behavior change. The existing tests moved with their modules and had only their import paths and read paths changed. One exception: the `unselected badges do not rely on opacity` check read a converter source file from the shared contrast test, so it moved to `ConverterPage.test.tsx`, where it reads the file with a `?raw` import.
- When another feature needs a helper that is private today, widen that feature's `index.ts`. Do not import its `lib/` or `components/` directly.
- Code moves to `shared/` on its third repetition (rule of three, `AGENTS.md`). Two uses keep it in place. Pure rules are an exception when a React-free consumer needs them: see [ADR 0004](0004-pure-rules-in-shared.md).
- The Vitest scope issue is separate. `npm test` also runs the copies in `.claude/worktrees/`, which pre-date this layout (DAL-52).
