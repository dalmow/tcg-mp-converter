# ADR 0004: Pure rules used by two features live in `shared/lib`

Status: accepted

## Context

The card number range rule (`1..total` of a Coleção) is enforced by the decks feature (`cardParser`) and by the converter (`convertDecklist`). [ADR 0002](0002-feature-based-layout.md) says a feature that needs another feature's helper widens that feature's `index.ts`, and that code moves to `shared/` on its third repetition.

The decks `index.ts` is the public API of a feature whose components import React. Re-exporting the rule from it would make `convertDecklist` depend on React. [ADR 0001](0001-architecture-overview.md) requires that `convertDecklist` has no React dependency, and its tests run in a node environment.

## Decision

- A pure rule (a predicate or a message builder with no React and no feature state) that two features use is placed in `src/shared/lib/`, once, instead of being copied or re-exported through a feature's `index.ts`.
- This applies to `src/shared/lib/cardNumber.ts`, which holds `isCardNumberInRange` and `cardNumberOutOfRangeReason`.
- The rule of three in ADR 0002 still applies to copies. It does not apply to a single shared rule that must be imported without pulling a feature's components.

## Consequences

- `shared/lib/` gains a file that only one feature type touches today: the converter and decks both import it.
- A feature that needs a pure rule from another feature moves that rule to `shared/lib/` in the same change. It does not widen the other feature's `index.ts` when the index exports React components.
- The decks feature keeps its own error wording, except that the out-of-range message is now built by the shared helper, so both screens show the same text.
