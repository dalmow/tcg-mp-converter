# Accessibility audit (WCAG 2.2 AA) — DAL-22

Audit of the Decks, New/Edit deck, Converter and Maintenance screens (plus the
shared navbar, "Dados" menu, dialogs and toasts). Fixes are out of scope here and
are tracked in DAL-24.

- Audited build: DAL-19 branch (before the DAL-20 rename and DAL-21 favicon landed on `main`), production build served by `vite preview`. Findings are unaffected except the document title text in A-08.
- Date: 2026-10-01. Theme: dark only (the app has a single theme).
- Fixture: one saved deck ("Deck Teste", 18 cards) and a few owned entries in `localStorage`.

## Method and coverage

| Method | Tool / version | Result |
| --- | --- | --- |
| Automated, rules | axe-core (latest via npm, scratch dir, tags `wcag2a/2aa/21a/21aa/22aa/best-practice`) driven by playwright-core + system Chrome | Run on all 4 screens plus the not-found state, and on these states: converter with result and unresolved cards, new deck with save errors, combobox open, delete-deck dialog, discard-changes dialog, "Dados" menu open, success toast |
| Automated, scoring | Lighthouse (accessibility category, desktop) via `lighthouse` + `chrome-launcher` | Run on Decks, New deck, Converter, Maintenance |
| Manual, keyboard | Playwright Tab-order / focus probes (scripted) | Done for Decks, Edit deck, Converter, Maintenance, dialogs, menu, combobox |
| Manual, code review | Read of pages, `components/`, `ui/` wrappers, `index.css` | Done |
| Manual, layout | 320 px reflow probe; 1.5/0.12em/0.16em text-spacing override | Reflow measured; text-spacing override screenshot taken but **not visually reviewed in detail** |
| Screen reader testing (NVDA, JAWS, VoiceOver, TalkBack) | - | **NOT PERFORMED.** No screen reader is available in this environment. Everything about announcements below is inferred from roles/attributes and must be verified by a human with a screen reader. |

Tools were installed in a scratch directory only; no audit tooling was added to the
repository dependencies. Automated tools cover roughly a third of WCAG criteria, so
passing scans do not imply conformance.

### Lighthouse scores (accessibility)

| Screen | Score | Failing audits |
| --- | --- | --- |
| Decks | 100 | none |
| New deck | 96 | color-contrast (2 nodes) |
| Converter | 90 | color-contrast (5 nodes), label (2 nodes) |
| Maintenance | 100 | none in the fixture state (no unsatisfied-row Save button was contrast-flagged by Lighthouse, but axe flags the Save buttons, see A-03) |

Lighthouse is weaker than axe on state-dependent content; use the axe results as the reference.

### axe violations summary

| Screen / state | Violations |
| --- | --- |
| Decks | 0 |
| New deck / Edit deck | color-contrast (primary Save, danger Delete) |
| New deck, combobox open | aria-required-attr (combobox without `aria-controls`) |
| Converter | color-contrast (condition badges), label (two result textareas) |
| Maintenance | color-contrast (Save buttons) |
| Dialogs open | color-contrast only (page behind dialog); `aria-hidden-focus` reported as "needs review" for Base UI focus guards (expected, not a defect) |
| "Dados" menu open | region (moderate; menu portal content outside landmarks) |
| Not-found | 0 |

## Summary of issues

| Severity | Count |
| --- | --- |
| Critical | 2 |
| Serious | 6 |
| Moderate | 6 |
| Minor | 4 |
| **Total** | **18** |

Severity scale: **Critical** = blocks a task for a group of users; **Serious** = major
barrier or clear WCAG AA failure with a workaround; **Moderate** = WCAG AA failure of
limited reach or a significant usability gap; **Minor** = best-practice / low impact.

Issues are grouped in recommended fix order (blockers first, then shared components
that fix many screens at once, then per-screen refinements).

---

## Group 1 — Blockers (keyboard and screen reader cannot complete the task)

### A-01 Converter: Qualidade and Idioma selectors are not operable by keyboard or screen reader
- **Status:** Fixed. Qualidade and Idioma options are now `role="radio"` buttons inside labelled `role="radiogroup"`s, with roving tabindex and arrow-key navigation (DAL-28).
  Verification (DAL-28, `/converter`, axe-core 4.10.2 with wcag2a/aa/21aa/22aa + best-practice): no violation on the radiogroups or their names; the only violations are `color-contrast` on the badges and primary button (A-05, A-03). Focus: real Tab key lands on the checked radio with `:focus-visible` and a 3px full-opacity `--ring` (`oklch(0.556 0 0)`, ~4.2:1 on the page background, >= 3:1 per 1.4.11); the former `ring-ring/50` was dropped. Idioma accessible names are exactly `PTEN`/`PT`/`EN` (flag emoji is `aria-hidden`, redundant `title` removed). A-05 (`opacity-60`, badge colours) remains open and is out of scope here.
- **Screen:** Converter
- **WCAG:** 2.1.1 Keyboard (A), 4.1.2 Name, Role, Value (A), 1.3.1 Info and Relationships (A)
- **Severity:** Critical
- **Evidence:** `BadgeGroup` renders `<Badge onClick>` as a plain `<span>`. Probe: all 9 badges have `role=null`, `tabIndex=-1`; Tab goes navbar → decklist textarea → Converter button → result textareas and never reaches a badge. The selected state is only shown visually (border + opacity). The `<Label>Qualidade</Label>` is not associated with anything. axe did not report this (no interactive role is declared), so it is only found by manual review.
- **Fix:** Render each option as a real control: a `role="radiogroup"` (labelled by the "Qualidade"/"Idioma" label via `aria-labelledby`) containing `<button role="radio" aria-checked>` or visually-styled native `<input type="radio">` + `<label>`, with roving tabindex/arrow keys. Keep a visible focus ring.

### A-02 Converter: result textareas have no accessible name
- **Status:** Fixed. Each result textarea is named via `aria-labelledby` pointing at its `h2` (DAL-28).
  Verification (DAL-28): axe on `/converter` reports no `label`/name violations for the result textareas.
- **Screen:** Converter
- **WCAG:** 1.3.1 (A), 3.3.2 Labels or Instructions (A), 4.1.2 (A)
- **Severity:** Critical (axe: critical; Lighthouse `label` failure)
- **Evidence:** the two read-only `<Textarea>`s in `MarketplaceResult` have no label; the `<h2>` above is not programmatically linked.
- **Fix:** Give each an `aria-label`/`aria-labelledby` pointing at its `h2` ("Liga Pokemon" / "MYPCards"), e.g. `aria-labelledby={headingId}`.

---

## Group 2 — Shared styles / components that fail on several screens

### A-03 Contrast: primary (blue) buttons are 3.54:1
- **Status:** Fixed (DAL-29). `--primary` is now `oklch(0.55 0.19 255)`: white text 4.71:1 (was 3.54:1); `--primary-hover` `oklch(0.5 0.19 255)` 5.79:1. Blue used as text/link colour moved to a new `--primary-text` token (`oklch(0.72 0.15 255)`, >= 4.5:1 on background/card/panel).
- **Screens:** New/Edit deck (Salvar), Maintenance (Salvar per row), Converter (Converter button), dialogs
- **WCAG:** 1.4.3 Contrast (Minimum) (AA)
- **Severity:** Serious
- **Evidence:** axe: `#fafafa` on `#1d84f5` (`--primary: oklch(0.62 0.19 255)`), 14 px normal weight, needs 4.5:1. The hover colour (`--primary-hover`) is darker and therefore better, but the resting state fails.
- **Fix:** Darken `--primary` (roughly `oklch(0.55 0.19 255)` or lower reaches ~4.5:1 with near-white text; verify) and adjust `--primary-hover` accordingly, or use dark foreground text. Also used for the "Deck válido" icon and the link colour (`text-primary` on dark, that direction is fine).

### A-04 Contrast: danger (red) buttons are 3.42:1
- **Status:** Fixed (DAL-29). `--danger` fill is now `oklch(0.55 0.22 25)`: white text 5.21:1 (was 3.44:1); `--danger-hover` `oklch(0.5 0.2 25)` 6.39:1. Error text/icons/toast border use the new `--danger-text` token (the former light red, 4.99:1 on card).
- **Screens:** New/Edit deck (Excluir), Maintenance (Excluir / Confirmar exclusão), delete dialogs
- **WCAG:** 1.4.3 (AA)
- **Severity:** Serious
- **Evidence:** axe: `#fafafa` on `#f94144` (`--danger: oklch(0.65 0.22 25)`), needs 4.5:1.
- **Fix:** Darken `--danger` (e.g. about `oklch(0.55 0.22 25)`, verify), keep `--danger-hover` darker still. Check `text-danger` used as text on `--panel` (error messages): it passes today because it is the light variant of the same token, so changing the token for the fill requires a separate text token (e.g. `--danger-text`).

### A-05 Contrast: Qualidade condition badges (lime, yellow, amber, unselected state)
- **Status:** Fixed (DAL-29). Condition badges use `*-700` backgrounds with white text (green 4.94, lime 4.96, yellow 4.92, amber 5.05, orange 5.23, red 6.42; all >= 4.5:1). Unselected badges (Qualidade and Idioma) no longer use `opacity-60`: they get a neutral fill (`bg-muted text-foreground`) and a `--control-border` border, while the selected one keeps its colour and a `border-foreground` outline.
- **Screen:** Converter
- **WCAG:** 1.4.3 (AA)
- **Severity:** Serious
- **Evidence:** axe: white on `bg-lime-600` 3.06:1; black on `bg-yellow-500` 4.38:1 (measured at the 60 % opacity of the unselected state); `bg-amber-600` 2.55:1 (`opacity-60` lowers the text colour to `#9d9d9d`). The `green`/`red` badges are "needs review" (text too short for axe) and should be checked manually; white on `green-600` is about 3.3:1 and on `red-600` about 4.8:1.
- **Fix:** Do not signal "unselected" with `opacity-60` (it halves contrast of the text). Use a distinct, sufficiently contrasting treatment, and darker backgrounds (e.g. `*-700`/`*-800` with white text) for every condition. Resolve together with A-01.

### A-06 Form control boundaries have low non-text contrast
- **Status:** Fixed (DAL-29). New `--control-border` token (`oklch(0.55 0 0)`): 4.08:1 on background, 3.73:1 on panel, 3.69:1 on card (was ~1.6:1). Used by `Input`, `Textarea`, `InputGroup`, the outline `Button` and the combobox search field.
- **Screens:** New/Edit deck (name, quantity, card, owned inputs), Converter (textareas), Maintenance (owned input)
- **WCAG:** 1.4.11 Non-text Contrast (AA)
- **Severity:** Serious
- **Evidence:** by calculation (not reported by axe): `--input: oklch(0.32 0 0)` border/background on `--background: oklch(0.145 0 0)` is about 1.6:1, below the 3:1 required to identify the control boundary. Inputs on `--panel` are lower still. The placeholder-only hints (`#`, `Adq.`) rely on this boundary.
- **Fix:** Raise the input border to at least 3:1 against the adjacent background (about `oklch(0.55 0 0)` on the dark panel; verify), keep the focus ring at 3:1 too (`--ring: oklch(0.556 0 0)` is about 3.8:1, OK).

### A-07 Page reflows poorly at 320 px: horizontal scroll on every screen
- **Status:** Fixed (DAL-29). The navbar row now wraps (`flex-wrap`). Verified in Chrome at 320 px: `scrollWidth` 320 on Decks, New deck, Edit deck, Converter and Maintenance (was 361).
- **Screens:** All
- **WCAG:** 1.4.10 Reflow (AA)
- **Severity:** Serious
- **Evidence:** at a 320 px viewport `scrollWidth` is 361 px on Decks, Edit deck, Converter and Maintenance. The navbar (3 links + "Dados" in one non-wrapping row) is the driver; the three-column deck editor collapses below `lg` but the card row (quantity + combobox + owned + delete in one `flex` row) is also tight.
- **Fix:** Let the navbar wrap (`flex-wrap`) or collapse; verify the card row and maintenance row at 320 px with no horizontal scrolling (2-D scrolling is only allowed for content that needs it).

### A-08 Document title is the same on every screen
- **Screens:** All
- **WCAG:** 2.4.2 Page Titled (A)
- **Severity:** Moderate
- **Evidence:** `document.title` is the same static string on all routes (the audited build used "PTCG Marketplace Converter"; it is now "PTCG Tools" after DAL-20) (hash router, no per-route title). The visible/sr-only `h1` varies, but the tab/window title does not tell users (and screen readers announcing a navigation) where they are.
- **Fix:** Set `document.title` per route (e.g. "Decks - PTCG ..." / "Editando deck X - ..." ) with a small `useDocumentTitle` hook in `PageLayout`/`DeckEditor`.

### A-09 Success/error toasts: transient, no pause, tiny close target
- **Status:** Fixed (DAL-29). Error toasts no longer auto-dismiss (they stay until closed); success toasts still dismiss after 5 s but the timer is paused while the toast is hovered or has focus inside and restarts when it leaves. The close button hit area is now 24x24 px (`size-6`). Regression tests in `src/components/ui/toast.test.tsx`. Screen-reader announcement is still untested.
- **Screens:** All (toast region mounted globally)
- **WCAG:** 2.2.1 Timing Adjustable (A), 4.1.3 Status Messages (AA), 2.5.8 Target Size (Minimum) (AA)
- **Severity:** Moderate
- **Evidence:** every toast auto-dismisses after 5 s with no pause on hover/focus, and **error** toasts (e.g. invalid backup file) also vanish, so a keyboard or screen-magnifier user can lose the message before reading it. Semantics are good (`role="status"` for success, `role="alert"` for errors, region labelled "Notificações"). The close button measures 16x16 px with no spacing exception (< 24x24).
- **Fix:** Pause the timer on hover and focus-within, do not auto-dismiss errors (or give them at least a much longer time), and enlarge the close button hit area to at least 24x24 px (padding). Screen-reader announcement of the toasts is **untested**.

---

## Group 3 — Deck editor (New / Edit deck)

### A-10 Card combobox does not expose its list correctly
- **Status:** Fixed (DAL-30)
- **Screen:** New / Edit deck
- **WCAG:** 4.1.2 Name, Role, Value (A)
- **Severity:** Moderate (axe: critical `aria-required-attr`)
- **Evidence:** with the suggestions open the input has `role="combobox"`, `aria-expanded="true"` and an existing `role="listbox"`, but no `aria-controls` and no `aria-activedescendant`. Keyboard use works (ArrowDown + Enter picks the suggestion), but a screen reader is not told which option is highlighted or that a list exists.
- **Fix:** Link the input to the listbox id with `aria-controls` and surface the highlighted `cmdk` item through `aria-activedescendant` (or switch to the Base UI Combobox/Autocomplete primitive which wires this up). Announce the suggestion count (polite live region) if possible.

### A-11 Row validity is conveyed by border colour only; errors are not tied to their fields
- **Status:** Fixed (DAL-30)
- **Screen:** New / Edit deck
- **WCAG:** 1.4.1 Use of Color (A), 3.3.1 Error Identification (A), 1.3.1 (A), 3.3.3 (AA)
- **Severity:** Serious
- **Evidence:** `CardRow` colours all three inputs `border-success`/`border-danger`; a valid/invalid row is otherwise indistinguishable for colour-blind users. The error/warning `<p>` under the row is not linked to the inputs (`aria-describedby`/`aria-invalid` absent on quantity, card and owned inputs), and the warning is not announced (no `role`), only the blocking error has `role="alert"`. The deck-name input does set `aria-invalid` but also lacks `aria-describedby` for its `role="alert"` message.
- **Fix:** Add `aria-invalid` and `aria-describedby` (pointing at the message id) to the affected inputs; add a non-colour cue (icon plus text) to invalid/warning rows; keep `role="alert"` for blocking errors and `role="status"` for warnings.

### A-12 Repeated, non-unique accessible names for row controls
- **Status:** Fixed (DAL-30)
- **Screens:** New / Edit deck, Maintenance
- **WCAG:** 2.4.6 Headings and Labels (AA), 2.5.3 Label in Name (A), 1.3.1 (A)
- **Severity:** Moderate
- **Evidence:** each deck row exposes identical names "Quantidade", "Carta", "Adquirido", "Excluir linha" (and "Adicionar carta" three times, one per panel); each Maintenance row exposes "Adquirido" (sr-only label) and unnamed-by-card "Salvar"/"Excluir" buttons. In forms-mode navigation a user cannot tell which card a control belongs to. The Maintenance numeric inputs and the placeholder `#` / `Adq.` are also terse.
- **Fix:** Make names specific: "Adquirido de {card}", "Salvar {card}", "Excluir {card}"; for "Adicionar carta" use "Adicionar carta de Pokémon/Treinador/Energia"; for deck-editor rows use `aria-label` including the row position or the typed card name (e.g. "Excluir linha 3 de Pokémon").

### A-13 Focus is lost when a row is deleted; no heading structure in the editor
- **Status:** Fixed (DAL-30)
- **Screen:** New / Edit deck
- **WCAG:** 2.4.3 Focus Order (A), 1.3.1 Info and Relationships (A), 2.4.6 (AA)
- **Severity:** Moderate
- **Evidence:** after "Excluir linha", `document.activeElement` is `BODY` (the focused button is removed). The three category panels are `role="region"` with `CardTitle` rendered as a non-heading, so the editor has only the `h1` (Decks, Converter and Maintenance use `h2` for their sections). Adding a row correctly moves focus to the new quantity input.
- **Fix:** After deleting, move focus to the next/previous row's input or the panel's "Adicionar carta" button; render `CardTitle` as an `h2` in the panels.

---

## Group 4 — Dialogs, menus and navigation

### A-14 Discard-changes dialog cannot be dismissed with Escape
- **Screen:** New / Edit deck (blocker dialog)
- **WCAG:** 2.1.1 Keyboard (A) / 3.2.2 expectations; ARIA Authoring Practices dialog pattern
- **Severity:** Moderate
- **Evidence:** the `AlertDialog` for the blocked navigation is controlled by `blocker.state === 'blocked'` without `onOpenChange`; pressing Escape leaves it open (probe: dialog still present). Focus handling is otherwise good (focus lands on "Continuar editando", returns to the trigger after the delete-deck dialog closes, `role="alertdialog"` with `aria-labelledby`/`aria-describedby`).
- **Fix:** Wire `onOpenChange={(open) => !open && blocker.reset?.()}` so Escape means "Continuar editando".
- **Status:** Fixed (DAL-31). `onOpenChange` resets the blocker; regression test in `DeckEditor.test.tsx`.

### A-15 "Dados" menu content is outside landmarks; menu trigger lacks context
- **Screen:** All (navbar)
- **WCAG:** 1.3.1 (A) (best practice `region`)
- **Severity:** Minor
- **Evidence:** axe `region` (moderate) while the menu is open: the Base UI portal sits outside `main`/`nav`. The menu itself behaves well (focus moves to the menu, `role="menu"`, Escape closes). Also, `aria-valid-attr-value` is "needs review" on the trigger (Base UI id reference while closed).
- **Fix:** Usually acceptable for portalled popups; confirm the trigger's `aria-controls` target exists when open, and consider labelling `nav` with `aria-label="Principal"`.
- **Status:** Fixed (DAL-31). The menu portals into the `nav` landmark, `nav` is labelled "Principal", and a test confirms the trigger's `aria-controls` target exists when open.

### A-16 Skip link and navigation landmark labelling
- **Screens:** All
- **WCAG:** 2.4.1 Bypass Blocks (A)
- **Severity:** Minor
- **Evidence:** there is no "skip to content" link; the navbar has 4 tab stops before the page content, which is low. `<nav>` is unlabelled but there is only one.
- **Fix:** Optional: add a visually-hidden-until-focused skip link targeting `main`, label the `nav` ("Principal"). Low priority for a 4-item nav.
- **Status:** Fixed (DAL-31). Skip link is the first tab stop, visible on focus, targets `main#conteudo` (`tabIndex=-1`); `nav` labelled "Principal".

---

## Group 5 — Minor / polish

### A-17 Switch "Só faltantes" and target sizes
- **Screen:** Maintenance
- **WCAG:** 2.5.8 Target Size (Minimum) (AA)
- **Severity:** Minor
- **Evidence:** the switch track is 32x18 px (height < 24). The associated `<label>` and the `after:-inset-y-2` hit area in `switch.tsx` enlarge the clickable area, and spacing around is generous, so this probably meets the spacing exception; verify manually. The Lighthouse/axe `target-size` rule did not flag it.
- **Fix:** Make the track at least 24 px tall or confirm the label is the primary target; also nothing else among buttons/links/inputs (other than the toast close button, A-09) measured under 24x24.
- **Status:** Fixed (DAL-32). Switch track is now 24 px tall (`h-6`) in both sizes.

### A-18 Remaining small items
- **Screens:** various
- **WCAG:** 3.1.2 Language of Parts (AA), 1.4.1 (A), 3.3.2 (A)
- **Severity:** Minor
- **Evidence and fix:**
  - `ui/dialog.tsx` contains an English sr-only "Close" label (unused by current screens, but would be an English string in a pt-BR page): translate to "Fechar".
  - Converter language buttons relied on flag emoji + `title`. Fixed in DAL-28: the flag is `aria-hidden`, the `title` is removed and the visible code (`PTEN`/`PT`/`EN`) is the accessible name.
  - The "Copiar" button gives no feedback (no toast/status) that the clipboard write succeeded or failed: announce via the existing toast (`toast.success('Copiado')`, `toast.error` on rejection), which also covers 4.1.3.
  - Deck-list "Deck válido/inválido" icons already have `role="img"` + names (good). The tile's missing-cards message is red text; it carries text, so no colour-only issue.
- **Status:** Fixed (DAL-32). Dialog close labels read "Fechar"; "Copiar" announces "Copiado" (toast status) or "Não foi possível copiar" (toast alert).

---

## What passed

- Language: `<html lang="pt-BR">`; a single `main` and `nav` landmark per page; exactly one `h1` per screen (sr-only except Edit deck); not-found state has an `h1` and a link back.
- Focus is visible on buttons, links and inputs (ring/outline present in all probed elements); no keyboard traps found in dialogs or the menu; dialog initial focus and focus return are correct.
- Deck editor: new-row focus moves to the quantity input; the combobox is keyboard operable (ArrowDown/Enter).
- `prefers-reduced-motion`: no rule found in `src/index.css`; animations come from `tw-animate-css` utilities and were not checked individually.
- Toast semantics (status vs alert) and labelled notification region.

## Not done / limitations

- **Screen reader testing was not performed** (no NVDA/JAWS/VoiceOver/TalkBack in this environment). Announcement behaviour of toasts, dialogs, the combobox and form errors is inferred from markup only.
- Only the dark theme exists, so there is no light-theme pass; Windows High Contrast / forced-colors mode was not tested.
- No mobile device or browser zoom (200 %/400 %) run beyond the 320 px reflow probe; text-spacing override (1.4.12) was rendered but not reviewed pixel by pixel.
- The Lighthouse "Maintenance" score of 100 reflects the fixture state; axe reports the Save buttons there (A-03).
- Colour-contrast values for `green-600`/`red-600` badges are estimates (axe could not evaluate them); other contrast values are axe measurements or noted calculations.
- The audit used a fixed fixture with a single deck; edge cases with very long names or many cards were not covered.
