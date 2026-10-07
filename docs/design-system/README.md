## Content fundamentals

Write in Brazilian Portuguese, direct and unadorned — one player talking to another, not a company talking to a customer. Real copy from the product: "Cole sua decklist e converta pro formato aceito pelas lojas parceiras.", "Cartas que faltam para completar seus decks, agrupadas por categoria.", "Todos os dados atuais serão substituídos." Short sentences, no exclamation points, no emoji anywhere in UI copy or icons.

Sentence case for body copy and paragraph text; panel/section headings (`h2`) are short nouns in Title Case — "Decklist", "Qualidade", "Idioma", "Pokémon", "Treinadores", "Energias" — never a full sentence. Button labels are a single verb or short verb phrase, capitalized only at the start: "Converter", "Salvar", "Cancelar", "Substituir tudo", "Adicionar carta". Destructive actions say exactly what they do — "Excluir", "Substituir tudo" — never a euphemism.

Counts are always literal and never rounded or abbreviated: "15/60 cartas", "Precisa: 4", "O backup contém 1 deck(s) e 3 carta(s) adquirida(s)." — keep the `(s)` pluralization-agnostic pattern for generated counts rather than writing separate singular/plural strings.

## Visual foundations

### Surfaces and ink

The app has exactly three surface depths, darkest to lightest: `surface-000` is the page itself; `surface-100` is a resting panel, card or input; `surface-200` is anything that floats above the page — a dropdown, a modal, a toast. Never skip a depth (a modal never sits directly on `surface-000`'s shade; a resting input never borrows `surface-200`).

Text has four weights, and the choice is about role, not taste: `ink` for anything the user reads as content (titles, values, labels they act on); `ink-muted` for supporting sentences and secondary labels; `ink-faint` for a caption that stands alone (an eyebrow, a close icon); `ink-subtle` for a micro-label that never carries meaning by itself — it always sits next to a bold value, an icon, or a color-coded border, exactly as the table headers and "Decks:" captions do. Don't reach for `ink-subtle` as a shortcut for "a bit quieter than `ink-muted`" — it only just clears the 4.5:1 floor, one step down from `ink-faint`, and stays reserved for decoration-weight micro-labels that always sit beside a bolder value, an icon or a color-coded border — never for standalone body text.

### Brand, accent and signal

`primary` (navy) is the one color an action gets when it is the main thing to do on the screen — Converter, Salvar. Pair a filled `primary` button with a 1.5px `secondary` border, not a neutral one: that cyan outline on a navy fill is the brand's one signature combination and appears nowhere else. `secondary` (cyan) is the accent: the active nav link, the selected pill, a focus state, and — doubling as a status color — "this is complete." `danger` (red) is destructive actions and "this is missing," never a resting UI color.

This pairing is deliberately color-blind-safe: success is `secondary`, a cyan that sits nowhere near red on the hue wheel, so a pendency row (`danger`) and a complete row (`secondary`) are told apart without relying on red/green discrimination at all. Keep it that way — never introduce a green "success" token here. The one place this system falls short of its own bar: a Manutenção row drops the text/icon label and signals state by border and background tint alone (an explicit product decision, not an oversight). DeckEditor's table rows keep the icon-plus-sentence pattern ("Linha com pendências — faltam 2 cartas") and are the accessible reference — reach for that fuller pattern first, and treat the color-only row as the exception, not the default.

The quality scale (`quality-mint` → `quality-near-mint` → `quality-slightly-played` → `quality-moderately-played` → `quality-heavily-played` → `quality-damaged`) always renders in that exact order, green to red, mint first. It is a one-off ordinal scale for card condition, not a reusable status pair — don't repurpose its green for "success" elsewhere; `secondary` already owns that.

### Buttons, pills and the button-group

A filled action is `primary` or `danger`; nothing else gets a solid fill. A quiet action is `.btn-ghost`: transparent, a `border` hairline, and on hover a `secondary`-tinted background with a `secondary`-tinted border — never a filled hover state. A selected pill (quality, language) fills solid in its own color with dark text on top of light fills (`#0a090e` on `quality-near-mint`) or `#0a090e` on `secondary`; an unselected pill is a hollow outline in that same color (quality) or a plain `border` outline with `ink` text (language) — never grey-out an unselected quality pill, its own hue stays visible as the outline.

Two or more icon-only actions that belong together (Salvar/Excluir, a maintenance row's quantity actions) go in one button-group: a single outer `border-radius: radius-md` with `overflow: hidden`, no border on the group itself unless the group is the only action in the row, and a 1px `divider-accent` seam between buttons — never a border around each button individually, and never a neutral grey divider. A button-group's height always matches the input beside it.

### Rows, cards and panels

A panel is `surface-100`, `radius-2xl`, a `border-faint` hairline, `space-8` padding, `space-6` gap between its heading and its content — this is the one card shape in the system; don't invent a second. A list row inside a panel can carry its own state: resting rows have no fill or border; a pendency row gets `danger-tint` background and a 1.5px `danger` border; a complete row gets `secondary-tint` and a 1.5px `secondary` border; a no-op row that needs no action (Precisa: 0 with nothing to save) gets a 1px **dashed** `border-dashed` on a near-transparent `rgba(255,255,255,0.03)` fill and keeps only the one action that still applies (Excluir, never Salvar, when there's nothing to save).

A button and a control are always less rounded than the panel they live in: panels are `radius-2xl` (16px), buttons and inputs are `radius-sm`/`radius-md` (8–10px). This gap is deliberate at every scale in the system — never round a control up to match its container.

### Badges

A "Decks:" caption in `ink-subtle` introduces a row of `chip-accent` badges, one badge per deck using that card — never fold multiple decks into one badge's text. `chip-accent` is `secondary-tint-strong` background, a `secondary-border-soft` border, `ink` is NOT used here — the badge text is `secondary` itself, `radius-pill`, `caption` type. A card used by no deck gets no badge at all: just the word "nenhum" in `ink-subtle`.

### Progress

A progress indicator is a label row (an `eyebrow` caption left, a bold count + `ink-subtle` suffix right — "15" + "/60 cartas") above a 6px track: `border-faint`-colored track, `radius-sm`-adjacent 3px corner rounding, filled with `linear-gradient(90deg, danger, primary)` left to right. It never carries its own panel background or border — it sits directly on the page or panel behind it, label text only, no "X faltam" sentence duplicating the count already shown.

### Toggle

A toggle is a 40×22px `radius-pill` track, `secondary` when on (there is no visual "off" tint beyond the track going to `border`-level grey — off state: `rgba(255,255,255,0.14)`), with an 18×18px `surface-000`-colored knob that slides between a 2px inset on either edge.

### Modal

A modal sits in `surface-200`, `radius-3xl`, a `border` at 0.12 opacity, `shadow-modal`, centered over an `overlay`-dimmed page. Title is `modal-title`; a warning sentence inside it is `danger-soft`, not `danger` — `danger` itself is reserved for the button. A modal's destructive confirm button is always a filled `danger` button, never `primary` — the system deliberately overrides "the main action is `primary`" here because the main action is also the dangerous one.

### Toast

A toast is `surface-200`, `radius-md`, `shadow-toast`, fixed to the bottom-right corner of the viewport, a 1.5px colored border (`secondary` for success, `danger` for error) carrying an icon in that same color plus `caption`-weight text and a close button in `ink-faint`. Never stack more meaning into color alone — the icon shape (check vs. exclamation) is what actually distinguishes success from error at a glance; the border color reinforces it.

### Navigation and layout

Page content is centered at `max-width: 1240px`. The header is sticky, `surface-header` with a 10px backdrop blur, a `border-faint` bottom hairline; the active nav-link is `secondary`, a resting one is `#cfc9de` cooling to `secondary` on hover. Below 860px wide, the inline nav links and the desktop "Dados" trigger disappear in favor of a single hamburger button that opens the `radius-4xl`, `shadow-mobile-nav` mobile sheet full of stacked nav rows. A "Dados" dropdown (desktop) is `surface-200`, `radius-lg`, `shadow-dropdown`, anchored under its trigger.

## Iconography

Every icon is an inline SVG line icon — never an icon font, a sprite sheet, or emoji. Stroke only, `fill="none"`, `stroke-width` between 1.4 and 1.8, always `stroke-linecap="round"` and (for multi-segment icons) `stroke-linejoin="round"`. Sizes run from 12–13px (inline feedback, close buttons) through 14–18px (row/table actions) to 20–26px (menu button, logomark). An icon-only control always carries both `aria-label` and `title` with the same Portuguese action text ("Remover carta", "Salvar deck", "Fechar notificação").

Two icons break the line-only rule on purpose: the toast error dot (a small solid circle at the base of the exclamation stroke) and the logomark. The logomark is two overlapping `radius`-cornered rounded rectangles standing for two trading cards: the back card is `secondary` at 50% opacity, the front card is solid `primary` — this exact two-card silhouette is the brand's mark and should never be redrawn as one shape, a diamond, or a generic app icon.

## Consuming this system

This folder is the source of truth for the design system; the private claude.ai artifacts it was exported from are no longer needed. `mockups/` holds the `.dc.html` artboards and their `theme.css`.

Tokens live in `src/index.css`, inside the `@theme static` block, and are exposed as Tailwind utilities (`bg-surface-100`, `text-ink-muted`, `rounded-2xl`, `shadow-modal`, `text-h2`, `p-space-8`, the `nav:` breakpoint at 860px). `src/lib/designTokens.test.ts` fails when `src/index.css` and `tokens.json` drift apart, so change both together. Spacing tokens are named `space-N` (not `N`) so the numeric Tailwind scale (`p-4`) keeps its meaning.

Fonts are self-hosted through `@fontsource-variable/space-grotesk` (display) and `@fontsource-variable/manrope` (body); no Google Fonts request is made. The artboards in `mockups/` still link Google Fonts because they are static references, not app code.

The shadcn token names (`--background`, `--card`, `--muted-foreground`, ...) remain as temporary aliases pointing at these tokens and are removed in the redesign cleanup issue. Build every surface from the three-depth `surface-*` scale and the four-step `ink-*` text scale before reaching for a one-off color — the whole system is these two scales plus `primary`/`secondary`/`danger` and their tints.
