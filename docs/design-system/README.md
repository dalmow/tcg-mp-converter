## Content fundamentals

Write in Brazilian Portuguese, direct and unadorned — one player talking to another, not a company talking to a customer. Real copy from the product: "Cole sua decklist e converta pro formato aceito pelas lojas parceiras.", "Cartas que faltam para completar seus decks, agrupadas por categoria.", "Todos os dados atuais serão substituídos." Short sentences, no exclamation points, no emoji anywhere in UI copy or icons.

Sentence case for body copy and paragraph text; panel/section headings (`h2`) are short nouns in Title Case — "Decklist", "Qualidade", "Idioma", "Pokémon", "Treinadores", "Energias" — never a full sentence. Button labels are a single verb or short verb phrase, capitalized only at the start: "Converter", "Salvar", "Cancelar", "Substituir tudo", "Adicionar carta". Destructive actions say exactly what they do — "Excluir", "Substituir tudo" — never a euphemism.

Counts are always literal and never rounded or abbreviated: "15/60 cartas", "Precisa: 4", "O backup contém 1 deck(s) e 3 carta(s) adquirida(s)." — keep the `(s)` pluralization-agnostic pattern for generated counts rather than writing separate singular/plural strings.

## Visual foundations

### Surfaces and ink

The app has exactly three surface depths, darkest to lightest: `surface-000` is the page itself; `surface-100` is a resting panel, card or input; `surface-200` is anything that floats above the page — a dropdown, a modal, a toast. Never skip a depth (a modal never sits directly on `surface-000`'s shade; a resting input never borrows `surface-200`).

Text has five weights, and the choice is about role, not taste: `ink` for anything the user reads as content (titles, values, labels they act on); `ink-soft` for the landing hero paragraph, a supporting sentence that reads brighter than `ink-muted` (the same grey as the resting nav links and the "Dados" menu items); `ink-muted` for supporting sentences and secondary labels; `ink-faint` for a caption that stands alone (an eyebrow, a close icon); `ink-subtle` for a micro-label that never carries meaning by itself — it always sits next to a bold value, an icon, or a color-coded border, exactly as the table headers and "Decks:" captions do. Don't reach for `ink-subtle` as a shortcut for "a bit quieter than `ink-muted`" — it only just clears the 4.5:1 floor, one step down from `ink-faint`, and stays reserved for decoration-weight micro-labels that always sit beside a bolder value, an icon or a color-coded border — never for standalone body text.

### Brand, accent and signal

`primary` (navy) is the one color an action gets when it is the main thing to do on the screen — Converter, Salvar. Pair a filled `primary` button with a 1.5px `secondary` border, not a neutral one: that cyan outline on a navy fill is the brand's one signature combination and appears nowhere else. `secondary` (cyan) is the accent: the active nav link, the selected pill, a focus state, and — doubling as a status color — "this is complete." `danger` (red) is destructive actions and "this is missing," never a resting UI color.

This pairing is deliberately color-blind-safe: success is `secondary`, a cyan that sits nowhere near red on the hue wheel, so a pendency row (`danger`) and a complete row (`secondary`) are told apart without relying on red/green discrimination at all. Keep it that way — never introduce a green "success" token here. The one place this system falls short of its own bar: a Manutenção row drops the text/icon label and signals state by border and background tint alone (an explicit product decision, not an oversight). DeckEditor's table rows keep the icon-plus-sentence pattern ("Linha com pendências — faltam 2 cartas") and are the accessible reference — reach for that fuller pattern first, and treat the color-only row as the exception, not the default. The count is the one generated count that switches form: "faltam 1 carta" for one copy, as in the issue copy, instead of the `(s)` pattern. Accepted difference: the artboard's other pendency reasons ("quantidade em branco", "quantidade negativa") are not shown yet; the sentence gives only the missing count, and only for a resolved card.

The quality scale (`quality-mint` → `quality-near-mint` → `quality-slightly-played` → `quality-moderately-played` → `quality-heavily-played` → `quality-damaged`) always renders in that exact order, green to red, mint first. It is a one-off ordinal scale for card condition, not a reusable status pair — don't repurpose its green for "success" elsewhere; `secondary` already owns that.

### Buttons, pills and the button-group

A filled action is `primary` or `danger`; nothing else gets a solid fill. A quiet action is the `ghost` button variant: transparent, a `border` hairline, and on hover a `secondary`-tinted background with a `secondary`-tinted border — never a filled hover state. A selected pill (quality, language) fills solid in its own color with dark text on top of light fills (`#0a090e` on `quality-near-mint`) or `#0a090e` on `secondary`; an unselected pill is a hollow outline in that same color (quality) or a plain `border` outline with `ink` text (language) — never grey-out an unselected quality pill, its own hue stays visible as the outline.

Two or more icon-only actions that belong together (Salvar/Excluir, a maintenance row's quantity actions) go in one button-group: a single outer `border-radius: radius-md` with `overflow: hidden`, no border on the group itself unless the group is the only action in the row, and a 1px `divider-accent` seam between buttons — never a border around each button individually, and never a neutral grey divider. A button-group's height always matches the input beside it.

### Rows, cards and panels

A panel is `surface-100`, `radius-2xl`, a `border-faint` hairline, `space-8` padding (20px, the artboard value adopted in DAL-54), `space-6` gap between its heading and its content — this is the one card shape in the system; don't invent a second. Two accepted differences: the DeckEditor category panels use a `space-7` (16px) gap, and the landing feature cards use `radius-3xl` with `space-10` padding (the closing call-to-action card uses `radius-4xl`). A list row inside a panel can carry its own state: resting rows have no fill or border; a pendency row gets `danger-tint` background and a 1.5px `danger` border; a complete row gets `secondary-tint` and a 1.5px `secondary` border; a no-op row that needs no action (Precisa: 0 with nothing to save) gets a 1px **dashed** `border-dashed` on a near-transparent `rgba(255,255,255,0.03)` fill and keeps only the one action that still applies (Excluir, never Salvar, when there's nothing to save).

A button and a control are always less rounded than the panel they live in: panels are `radius-2xl` (16px), buttons and inputs are `radius-sm`/`radius-md` (8–10px). This gap is deliberate at every scale in the system — never round a control up to match its container.

### Badges

A "Decks:" caption in `ink-subtle` introduces a row of `chip-accent` badges, one badge per deck using that card — never fold multiple decks into one badge's text. `chip-accent` is `secondary-tint-strong` background, a `secondary-border-soft` border, `ink` is NOT used here — the badge text is `secondary` itself, `radius-pill`, `caption` type (11px, weight 600, as in tokens.json). A card used by no deck gets no badge at all: just the word "nenhum" in `ink-subtle`.

### Progress

A progress indicator is a 6px track with the literal count beside it ("45/60") on the right, and no label row. The track is `border-faint`-colored with 3px corner rounding, filled with `linear-gradient(90deg, danger, primary)` left to right. It never carries its own panel background or border, and no "X faltam" sentence repeats the count. The deck list tiles are its one use. Its label is the accessible name only, so the count is the one visible signal.

### Toggle

A toggle is a 40×22px `radius-pill` track, `secondary` when on (there is no visual "off" tint beyond the track going to `border`-level grey — off state: `rgba(255,255,255,0.14)`), with an 18×18px `surface-000`-colored knob that slides between a 2px inset on either edge. The track sits in a 24px slot, with a 1px vertical margin, because the Manutenção row was laid out around that slot.

### Modal

A modal sits in `surface-200`, `radius-3xl`, a `border` hairline (the 0.14 `border` token), `shadow-modal`, centered over an `overlay`-dimmed page. Title is `modal-title`; a warning sentence inside it is `danger-soft`, not `danger` — `danger` itself is reserved for the button. A modal's destructive confirm button is always a filled `danger` button, never `primary` — the system deliberately overrides "the main action is `primary`" here because the main action is also the dangerous one.

### Toast

A toast is `surface-200`, `radius-md`, `shadow-toast`, fixed to the bottom-right corner of the viewport, a 1.5px colored border (`secondary` for success, `danger` for error) carrying an icon in that same color plus `caption`-weight text and a close button in `ink-faint`. Never stack more meaning into color alone — the icon shape (check vs. exclamation) is what actually distinguishes success from error at a glance; the border color reinforces it.

### Navigation and layout

Page content is centered at `max-w-page` (1240px) with `px-page-gutter` side padding (`clamp(20px, 4vw, 40px)`). The header is sticky, `surface-header` with a 10px backdrop blur, a `border-faint` bottom hairline; the active nav-link is `secondary`, a resting one is `ink-soft` cooling to `secondary` on hover. Below 860px wide, the inline nav links and the desktop "Dados" trigger disappear in favor of a single hamburger button that opens the `radius-4xl`, `shadow-mobile-nav` mobile sheet full of stacked nav rows. The sheet has no `overlay` scrim, on purpose: it is an anchored panel under the header, like the desktop "Dados" dropdown, not a modal, and the page stays visible behind it (the `Navegacao.dc.html` artboard shows the panel alone, with no scrim). Escape, a nav link or the hamburger closes it. A "Dados" dropdown (desktop) is `surface-200`, `radius-lg`, `shadow-dropdown`, anchored under its trigger.

## Iconography

Every icon is an inline SVG line icon — never an icon font, a sprite sheet, or emoji. Stroke only, `fill="none"`, `stroke-width` between 1.4 and 1.8, always `stroke-linecap="round"` and (for multi-segment icons) `stroke-linejoin="round"`. Sizes run from 12–13px (inline feedback, close buttons) through 14–18px (row/table actions) to 20–26px (menu button, logomark).

Every lucide icon takes its stroke from one default: `ICON_STROKE_WIDTH` (1.6) in `src/shared/ui/icons.tsx`, set by `IconDefaults` around the app shell. Inline SVGs (the nav icons, the logomark) set their own stroke.

An icon-only control carries both `aria-label` and `title`. The rule has two parts. The `title` is the short action shown on hover ("Remover carta", "Adicionar carta", "Fechar"). The `aria-label` is the full accessible name, and it adds the row or panel when several controls share the action ("Excluir linha 2 de Pokémon", "Adicionar carta de Treinadores"). When the action needs no context, both are the same text ("Abrir menu de navegação", "Salvar deck").

Two icons break the line-only rule on purpose: the toast error dot (a small solid circle at the base of the exclamation stroke) and the logomark. The logomark is two overlapping `radius`-cornered rounded rectangles standing for two trading cards: the back card is `secondary` at 50% opacity, the front card is solid `primary` — this exact two-card silhouette is the brand's mark and should never be redrawn as one shape, a diamond, or a generic app icon.

## Accepted differences

These are deliberate, and the code keeps them. Anything else that differs from this document is a bug.

- Fixed sizes that have no token use the numeric Tailwind scale, which is the same px: `size-4.5` is the 18px icon, `size-3.25` the 13px one, `min-w-55` the 220px input column.
- Deck list tiles keep a 22px card padding (`[--card-spacing:22px]`) and a fixed 280px tile column, both from the artboard grid.
- The card suggestion list uses `shadow-dropdown`, the dropdown shadow of this system.
- Panels set no text size of their own: their content sets `text-body`, `text-ui` or the size it needs.
- The Manutenção row is color-only, as the Brand, accent and signal section explains.
- The no-op row fill (`rgba(255,255,255,0.03)`), the 10px header blur and the fluid landing sizes are one-off values, not tokens.

## Consuming this system

This folder is the source of truth for the design system; the private claude.ai artifacts it was exported from are no longer needed. `mockups/` holds the `.dc.html` artboards and their `theme.css`.

Tokens live in `src/index.css`, inside the `@theme static` block, and are exposed as Tailwind utilities (`bg-surface-100`, `text-ink-muted`, `rounded-2xl`, `shadow-modal`, `text-h2`, `p-space-8`, `max-w-page`, `px-page-gutter`, the `nav:` breakpoint at 860px). `src/shared/lib/designTokens.test.ts` fails when `src/index.css` and `tokens.json` drift apart, and fails when a declared token has no class in `src`, so change both together and remove a token from both when nothing uses it. Spacing tokens are named `space-N` (not `N`) so the numeric Tailwind scale (`p-4`) keeps its meaning; `page-gutter` is the only named spacing token, because it is fluid.

Three utilities in `src/index.css` cover shared patterns: `status-border` (the 1.5px border of a filled primary or a status row), `hide-number-spinners` (the number cells of the deck editor and Manutenção without the browser stepper) and `no-scrollbar` (the card suggestion list). The state variants `data-open`, `data-closed`, `data-checked`, `data-unchecked`, `data-selected` and `data-disabled` are defined there too, from the attributes Base UI and cmdk set.

Fonts are self-hosted through `@fontsource-variable/space-grotesk` (display) and `@fontsource-variable/manrope` (body); no Google Fonts request is made. There is no monospace family or token: code-like text, such as an unresolved decklist line in the converter, uses `font-body`. The artboards in `mockups/` still link Google Fonts because they are static references, not app code.

The shadcn token names (`--background`, `--card`, `--muted-foreground`, ...) no longer exist; use the DS utilities (`bg-surface-000`, `text-ink-muted`, ...) only. Build every surface from the three-depth `surface-*` scale and the five-step `ink-*` text scale before reaching for a one-off color — the whole system is these two scales plus `primary`/`secondary`/`danger` and their tints.
