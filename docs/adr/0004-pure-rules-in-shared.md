# ADR 0004: Pure rules used by two features live in `shared/lib`

Status: accepted. Amends the two-use clause of [ADR 0002](0002-feature-based-layout.md) for pure rules. Clarifies [ADR 0001](0001-architecture-overview.md) §3.

## Context

The card number range rule (`1..total` of a Coleção) is enforced by the decks feature (`cardParser`) and by the converter (`convertDecklist`). [ADR 0002](0002-feature-based-layout.md) says a feature that needs another feature's helper widens that feature's `index.ts`, and that code moves to `shared/` on its third repetition.

The decks `index.ts` also exports React components. A consumer that must stay React-free, such as `convertDecklist` ([ADR 0001](0001-architecture-overview.md) §3), would load React through that barrel. Widening it for a pure rule would break that.

## Decision

- A pure rule (a predicate or a message builder with no React and no feature state) used by two features lives once in `src/shared/lib/`. It is not re-exported through a feature's `index.ts` when that index exports React components.
- This applies to `src/shared/lib/cardNumber.ts`, which holds `isCardNumberInRange` and `cardNumberOutOfRangeReason`.
- A pure rule used by one feature stays in that feature's `lib/`, as ADR 0001 §3 says.
- The existing re-exports from `decks/index.ts` (`deckInvariantError`, `uniqueDecksById`, `parseOwnedText`) are not moved here. Move one when a React-free consumer needs it.

## Consequences

- Decks and the converter import the card number rule from `shared/lib/cardNumber`.
- The decks and converter screens show the same out-of-range text, because both use `cardNumberOutOfRangeReason`.
- The rule of three in ADR 0002 still applies to copied code. It does not require copying a shared rule to a third feature before moving it.
