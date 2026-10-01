import { describe, expect, it } from 'vitest'
import { addDeckCard, maxQuantityFor, validateDeck, validateQuantity } from './deckRules'
import type { Deck, DeckCard, OwnedMap } from './types'

const collections = { MEG: 132, BLK: 86, SVI: 198 }

const abra: DeckCard = { category: 'pokemon', key: 'MEG-54', displayName: 'Abra MEG 54', quantity: 4 }
const fire: DeckCard = { category: 'energy', key: 'energy:fogo', displayName: 'Energia Fogo', quantity: 56 }

function deck(cards: DeckCard[]): Deck {
  return { id: '1', name: 'D', cards }
}

function ownedFor(cards: DeckCard[], extra = 0): OwnedMap {
  return Object.fromEntries(
    cards.map((c) => [c.key, { displayName: c.displayName, category: c.category, quantity: c.quantity + extra }]),
  )
}

describe('addDeckCard / quantity', () => {
  it('rejects a duplicate key', () => {
    const result = addDeckCard(deck([abra]), { ...abra, quantity: 1 })
    expect(result).toEqual({ ok: false, error: 'Carta já está no deck, edite a linha existente' })
  })
  it('adds a new card', () => {
    const result = addDeckCard(deck([abra]), fire)
    expect(result.ok && result.deck.cards).toHaveLength(2)
  })
  it('caps the sum at 60', () => {
    const d = deck([fire])
    expect(maxQuantityFor(d, 'MEG-54')).toBe(4)
    expect(validateQuantity(d, 'MEG-54', 4)).toBeNull()
    expect(validateQuantity(d, 'MEG-54', 5)).not.toBeNull()
    expect(addDeckCard(d, { ...abra, quantity: 5 }).ok).toBe(false)
  })
  it('excludes the edited row from the cap', () => {
    expect(maxQuantityFor(deck([abra, fire]), 'energy:fogo')).toBe(56)
  })
  it('rejects zero, negative and non-integer quantities', () => {
    for (const q of [0, -1, 1.5, NaN]) expect(validateQuantity(deck([]), 'x', q)).not.toBeNull()
  })
})

describe('validateDeck', () => {
  const full = [abra, fire]

  it('is valid with 60 cards, valid rows, and enough owned', () => {
    const result = validateDeck(deck(full), ownedFor(full), collections)
    expect(result).toMatchObject({ valid: true, total: 60, missingMessage: null })
  })

  it('rule 1: fails when the sum is not 60', () => {
    const cards = [abra]
    const result = validateDeck(deck(cards), ownedFor(cards), collections)
    expect(result).toMatchObject({ valid: false, totalOk: false, missingMessage: null })
  })

  it('rule 2: fails on a row with an unknown collection or number over total', () => {
    const bad: DeckCard = { ...abra, key: 'MEG-200', displayName: 'Abra MEG 200' }
    const cards = [bad, fire]
    const result = validateDeck(deck(cards), ownedFor(cards), collections)
    expect(result).toMatchObject({ valid: false, rowsOk: false })
  })

  it('rule 2: fails when the key does not match the text', () => {
    const cards = [{ ...abra, key: 'MEG-55' }, fire]
    expect(validateDeck(deck(cards), ownedFor(cards), collections).rowsOk).toBe(false)
  })

  it('rule 3: sums copies by normalized name across printings', () => {
    const a: DeckCard = { category: 'pokemon', key: 'MEG-54', displayName: 'Abra MEG 54', quantity: 2 }
    const b: DeckCard = { category: 'pokemon', key: 'SVI-10', displayName: 'abra SVI 10', quantity: 3 }
    const cards = [a, b, { ...fire, quantity: 55 }]
    const result = validateDeck(deck(cards), ownedFor(cards), collections)
    expect(result).toMatchObject({ valid: false, copiesOk: false, rowsOk: true })
  })

  it('rule 3: trainers by normalized name; special energy follows the rule', () => {
    const t: DeckCard = { category: 'trainer', key: 'ordem da chefia', displayName: 'Ordem da Chefia', quantity: 4 }
    const e: DeckCard = { category: 'energy', key: 'BLK-86', displayName: 'Energia de Prisma BLK 86', quantity: 5 }
    const cards = [t, e, { ...fire, quantity: 51 }]
    expect(validateDeck(deck(cards), ownedFor(cards), collections).copiesOk).toBe(false)
  })

  it('rule 3: basic energy is exempt', () => {
    const cards = [fire, { ...abra, quantity: 4 }]
    expect(validateDeck(deck(cards), ownedFor(cards), collections).copiesOk).toBe(true)
  })

  it('rule 4: reports "faltam N cartas" when only owned fails', () => {
    const owned = ownedFor(full)
    owned['MEG-54'].quantity = 1
    owned['energy:fogo'].quantity = 55
    const result = validateDeck(deck(full), owned, collections)
    expect(result).toMatchObject({ valid: false, ownedOk: false, missingCount: 4, missingMessage: 'faltam 4 cartas' })
  })

  it('rule 4: missing card with no owned entry counts as 0 owned', () => {
    const result = validateDeck(deck(full), {}, collections)
    expect(result.missingCount).toBe(60)
  })

  it('rule 4: no missing message when another rule also fails', () => {
    const result = validateDeck(deck([abra]), {}, collections)
    expect(result.missingMessage).toBeNull()
  })

  it('uses the singular message for one missing card', () => {
    const owned = ownedFor(full)
    owned['MEG-54'].quantity = 3
    expect(validateDeck(deck(full), owned, collections).missingMessage).toBe('falta 1 carta')
  })
})
