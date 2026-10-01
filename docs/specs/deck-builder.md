# Deck builder, Maintenance and Data backup

Spec agreed after a design-tree interview. The portal becomes a Pokémon TCG (PTCG) toolbox. This feature adds a deck builder, a card-acquisition tracker ("Maintenance") and local backup. The existing converter stays unchanged apart from its route.

Code is in English. User-visible strings are Portuguese (listed below in quotes). Glossary terms in `CONTEXT.md` map to English identifiers (Deck, Collection, ...). New terms to add to `CONTEXT.md`: Deck, Deck card, Owned quantity (Adquirido), Maintenance (Manutenção).

## Tracker and delivery

- Issues live in Linear: workspace `dalmow`, team `DAL`, project `PTCG Tool`.
- Code and PRs stay on GitHub. Branch name starts with the Linear identifier (for example `dal-12-navigation`). Never commit to `main`.
- Conventional commits.

## Navigation

- `HashRouter` (`react-router`), works on any static host.
- Routes: `/` (deck list, label "Decks"), `/decks/new`, `/decks/:id`, `/converter`, `/maintenance`.
- Top navbar: "Decks", "Conversor", "Manutenção", and a "Dados" dropdown (no route) with "Exportar backup" and "Importar backup".

## Domain

### Card categories and keys

Every card belongs to one category: `pokemon`, `trainer`, `energy`. The category comes from the panel the row sits in.

Row text is a single input, parsed per category. Collection acronyms are validated against `src/data/collections.json` (case-tolerant). A Pokémon number must not exceed the collection total.

| Category | Input format | Card key |
| --- | --- | --- |
| Pokémon | `<name> <COLLECTION> <number>`, e.g. `Abra MEG 54`. Collection and number required. | `COLLECTION-number` |
| Trainer | name only, e.g. `Ordem da chefia`. Row is invalid if a collection or number is present. | normalized name (trim, lowercase, no accents) |
| Basic energy | name without collection or number, e.g. `Energia Fogo`. Recognized by a fixed PT list: Grama, Fogo, Água, Elétrica, Psíquica, Lutadora, Escuridão, Metal (with or without the "Energia" prefix). | canonical type |
| Special energy | name plus collection and number, e.g. `Energia de Prisma BLK 86`. Same logic as Pokémon. | `COLLECTION-number` |

An energy row with no collection/number and a name outside the basic list is invalid ("Energia especial exige coleção e número"). Only Portuguese names are recognized.

### Deck

- `Deck { id, name, cards[] }`. `cards[]` holds `{ category, key, displayName, quantity }`.
- Deck names are not unique (ids differ).
- One row per card key per deck. A duplicate is rejected: "Carta já está no deck, edite a linha existente".
- Quantity is an integer from 1 to the space left up to 60. The sum of quantities is capped at 60 (hard limit on the input).

### Validity (blue check vs red exclamation)

A deck is valid only when all hold:

1. Quantities sum to exactly 60.
2. Every row is valid (parse ok, collection exists, number within total).
3. No card name has more than 4 copies in total. The sum is by normalized name across different printings. Basic energy is exempt. Special energy follows the 4-copy rule.
4. Every row has `owned >= quantity`.

Two states only: valid (blue check) and invalid (red exclamation). When only rule 4 fails, the deck block also shows "faltam N cartas".

### Owned quantity

- One global map: `owned: Record<cardKey, { displayName, category, quantity }>`. Shared by decks and Maintenance.
- A card without an entry starts at 0. Empty counts as 0.
- Owned quantity is persisted only when the row is saved (in a deck or in Maintenance). Unsaved edits stay local to the row.
- When a row's text resolves to a known key, its owned input is pre-filled from the map.

## Deck list (`/`)

- Deck blocks side by side, wrapping. The last block is a same-size "+" button, content centered, linking to `/decks/new`.
- Each block: validity icon, deck name top-left in uppercase, card count `XX/60`. Clicking opens `/decks/:id`.

## Deck editor (`/decks/new`, `/decks/:id`)

Create and edit are the same panel and rules.

- Top: deck name input (placeholder "Nome do deck") and a delete-deck button with confirmation (AlertDialog).
- Three category panels side by side: Pokémon, Treinadores, Energias. Stacked on small screens (`grid-cols-1 lg:grid-cols-3`). Each panel grows as rows are added.
- A row = quantity input, card text input, owned input, save button (blue), delete button (red). No labels, placeholders only.
- Card text input is a combobox. Suggestions come from cards already known (in decks or in the `owned` map), filtered by category. Picking one fills the full text and the owned value. Free typing stays valid. No network, no external catalog.
- In a deck, a saved row stays fully editable (text and quantity) and deletable. Editing the text changes the card key. The old key stays in Maintenance with 0 decks and its owned quantity. The new key takes its owned quantity from the map, or 0.
- Row feedback: inputs turn green when the row is valid and `owned >= quantity`. Otherwise red.
- Persistence: the deck is created in storage when the first row is saved, and it needs a deck name ("Informe o nome do deck" otherwise). After that every confirmed change (row save, row delete, rename) persists immediately. Rows not saved are discarded on leaving. No leave warning.
- A deck can be saved while invalid (a work-in-progress draft). Only the deck name is required.

## Maintenance (`/maintenance`)

- Lists every card that appears or has appeared in a deck, in the same three category panels.
- A "Só faltantes" toggle, on by default, hides cards where `owned >= needed`. This includes cards used by 0 decks.
- Row: card name, deck badges ("Decks: Alakazam, Mega Absol ex"), needed quantity, owned input, save button. Saving persists the owned quantity.
- Needed quantity = max of the card's quantity across decks (a physical card is reused between decks). Two decks with 4 "Ordem da chefia" each need 4, not 8.
- Row is green when `owned >= needed`.
- Only the owned quantity is editable here. The card itself is read-only.
- A card removed from every deck stays in Maintenance with "Decks: 0" and needed 0. A delete button (red, confirmation) appears only for cards with 0 decks. Cards in use cannot be deleted.

## Storage

- `localStorage`, one versioned key `ptcg:v1` with `{ decks, owned }`.
- A storage interface plus a reactive store using `useSyncExternalStore`, so screens and browser tabs stay in sync.
- No extra library. IndexedDB only if size ever becomes a problem (not expected).

## Backup ("Dados" menu)

- Export: downloads a `.json` file `{ version, exportedAt, decks, owned }`.
- Import: validate with a schema first. An invalid file is rejected without touching storage. Show a summary and ask for confirmation (AlertDialog). One mode only: replace everything. Merge is out of scope.

## Visual

- Dark theme only, solid panels. No translucency.
- Use only shadcn/ui components, reused. Add what is missing (input, card, dialog/alert-dialog, dropdown-menu, command/combobox, switch, ...).
- Internal design system: semantic tokens in `src/index.css` (`success`, `danger`, `primary`, panel and border tokens) and small shared wrappers on top of shadcn, so screens reuse them.
- Panel borders match the theme. Inputs have slightly rounded corners. Save buttons are blue, delete buttons red. Success is green, failure red.

## Out of scope

- Converting a deck to a Marketplace list (future, separate issue).
- External card catalog or network access.
- Merge import.
- Duplicating or reordering decks.
- Light theme, translucent panels.
- English card names and PT/EN name mapping.

## Issue slices (create in Linear: team DAL, project PTCG Tool)

1. Navigation, routes, dark theme and design tokens, base shadcn components. The converter moves to `/converter`.
2. Pure domain: parser, card keys, validation rules, with tests (TDD).
3. Storage and reactive store, with tests.
4. Deck list screen (blocks and "+" block).
5. Deck editor (three panels, rows, suggestions, row persistence).
6. Maintenance screen (needed = max, per-row save, delete at 0 decks).
7. "Dados" menu: export and import backup.
8. Docs: update `CONTEXT.md` (new terms), `docs/agents/issue-tracker.md` and `AGENTS.md` to point to Linear.

Dependencies: 2 before 3 before 4/5/6. 1 before 4/5/6/7. 3 before 7.
