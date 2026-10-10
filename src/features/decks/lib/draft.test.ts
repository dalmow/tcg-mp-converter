import { describe, expect, it } from 'vitest'
import collections from '@/shared/data/collections.json'
import type { Deck } from '@/features/decks/types/deck'
import { buildDeckSave, draftTotalQuantity, isDirty, NAME_REQUIRED, OWNED_INVALID, rowsFromDeck } from './draft'
import type { DraftRow } from './draft'

function row(partial: Partial<DraftRow> & Pick<DraftRow, 'id'>): DraftRow {
  return { category: 'pokemon', quantityText: '', text: '', ownedText: null, originalKey: null, ...partial }
}

const draft = (name: string, rows: DraftRow[]) => ({ id: 'deck', name, rows })

describe('buildDeckSave', () => {
  it('builds the deck and writes owned for rows with no owned record', () => {
    const result = buildDeckSave(
      draft(' Alakazam ', [row({ id: 'a', quantityText: '2', text: 'Abra MEG 54' })]),
      {},
      collections,
    )
    expect(result).toEqual({
      ok: true,
      deck: {
        id: 'deck',
        name: 'Alakazam',
        cards: [{ category: 'pokemon', key: 'MEG-54', displayName: 'Abra MEG 54', quantity: 2 }],
      },
      owned: { 'MEG-54': { displayName: 'Abra MEG 54', category: 'pokemon', quantity: 0 } },
    })
  })

  it('writes owned only for edited rows or rows without a record', () => {
    const stored = {
      'MEG-54': { displayName: 'Abra MEG 54', category: 'pokemon' as const, quantity: 5 },
      'MEG-55': { displayName: 'Kadabra MEG 55', category: 'pokemon' as const, quantity: 1 },
    }
    const result = buildDeckSave(
      draft('D', [
        row({ id: 'a', quantityText: '1', text: 'Abra MEG 54' }),
        row({ id: 'b', quantityText: '1', text: 'Kadabra MEG 55', ownedText: '3' }),
      ]),
      stored,
      collections,
    )
    expect(result.ok && result.owned).toEqual({
      'MEG-55': { displayName: 'Kadabra MEG 55', category: 'pokemon', quantity: 3 },
    })
  })

  it('discards blank rows silently', () => {
    const result = buildDeckSave(
      draft('D', [row({ id: 'a' }), row({ id: 'b', quantityText: ' ', text: '' })]),
      {},
      collections,
    )
    expect(result.ok && result.deck.cards).toEqual([])
  })

  it('blocks on an empty name, reporting it with the row errors', () => {
    const result = buildDeckSave(
      draft(' ', [row({ id: 'a', quantityText: '1', text: 'Abra XYZ 54' })]),
      {},
      collections,
    )
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.nameError).toBe(NAME_REQUIRED)
      expect(result.rowErrors.a).toMatch(/XYZ/)
    }
  })

  it('blocks on partially filled rows, invalid quantity, duplicates and non-integer owned', () => {
    const result = buildDeckSave(
      draft('D', [
        row({ id: 'text-only', text: 'Abra MEG 54' }),
        row({ id: 'qty-only', quantityText: '2' }),
        row({ id: 'ok', quantityText: '1', text: 'Abra MEG 53' }),
        row({ id: 'dup', quantityText: '1', text: 'Abra MEG 53' }),
        row({ id: 'owned', quantityText: '1', text: 'Abra MEG 52', ownedText: 'x' }),
        row({ id: 'big', category: 'energy', quantityText: '61', text: 'Fogo' }),
      ]),
      {},
      collections,
    )
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(Object.keys(result.rowErrors).sort()).toEqual(['big', 'dup', 'owned', 'qty-only', 'text-only'])
      expect(result.rowErrors.dup).toBe('Carta já está no deck, edite a linha existente')
      expect(result.rowErrors.owned).toBe(OWNED_INVALID)
    }
  })

  it('still reports a duplicate of a row whose owned value is invalid in the same attempt', () => {
    const result = buildDeckSave(
      draft('D', [
        row({ id: 'first', quantityText: '1', text: 'Abra MEG 53', ownedText: 'x' }),
        row({ id: 'dup', quantityText: '1', text: 'Abra MEG 53' }),
      ]),
      {},
      collections,
    )
    expect(result.ok).toBe(false)
    if (!result.ok) expect(Object.keys(result.rowErrors).sort()).toEqual(['dup', 'first'])
  })

  it('does not block on warnings (more than 4 copies, owned below quantity)', () => {
    const result = buildDeckSave(
      draft('D', [
        row({ id: 'a', quantityText: '3', text: 'Abra MEG 54', ownedText: '0' }),
        row({ id: 'b', quantityText: '3', text: 'Abra MEG 53', ownedText: '0' }),
      ]),
      {},
      collections,
    )
    expect(result.ok).toBe(true)
  })
})

describe('draftTotalQuantity', () => {
  it('sums the quantities of the rows that parse as a card', () => {
    const rows = [
      row({ id: 'a', quantityText: '2', text: 'abra meg 54' }),
      row({ id: 'b', category: 'trainer', quantityText: '4', text: 'Ordem da chefia' }),
    ]
    expect(draftTotalQuantity(rows, collections)).toBe(6)
  })

  it('leaves out a row whose quantity is still blank, instead of adding NaN', () => {
    const rows = [
      row({ id: 'a', quantityText: '2', text: 'abra meg 54' }),
      row({ id: 'b', category: 'energy', text: 'Psíquica' }),
    ]
    expect(draftTotalQuantity(rows, collections)).toBe(2)
  })

  it('leaves out a row that does not parse as a card yet', () => {
    const rows = [
      row({ id: 'a', quantityText: '2', text: 'abra meg 54' }),
      row({ id: 'b', quantityText: '5', text: 'Abra XYZ 54' }),
    ]
    expect(draftTotalQuantity(rows, collections)).toBe(2)
  })

  it('is zero for a draft with no rows', () => {
    expect(draftTotalQuantity([], collections)).toBe(0)
  })
})

describe('isDirty', () => {
  const saved: Deck = {
    id: 'deck',
    name: 'Alakazam',
    cards: [{ category: 'pokemon', key: 'MEG-54', displayName: 'Abra MEG 54', quantity: 2 }],
  }

  it('is clean for a new deck with nothing typed (blank rows included)', () => {
    expect(isDirty('', [], undefined)).toBe(false)
    expect(isDirty(' ', [row({ id: 'a' })], undefined)).toBe(false)
  })

  it('is clean for an untouched saved deck', () => {
    expect(isDirty('Alakazam', rowsFromDeck(saved), saved)).toBe(false)
  })

  it('is dirty after a change of name, rows or edited owned', () => {
    expect(isDirty('Other', rowsFromDeck(saved), saved)).toBe(true)
    expect(isDirty('Alakazam', [], saved)).toBe(true)
    expect(isDirty('Alakazam', [...rowsFromDeck(saved), row({ id: 'n', text: 'x' })], saved)).toBe(true)
    expect(
      isDirty(
        'Alakazam',
        rowsFromDeck(saved).map((r) => ({ ...r, quantityText: '3' })),
        saved,
      ),
    ).toBe(true)
    expect(
      isDirty(
        'Alakazam',
        rowsFromDeck(saved).map((r) => ({ ...r, ownedText: '2' })),
        saved,
      ),
    ).toBe(true)
  })

  it('is dirty for a new deck with anything typed', () => {
    expect(isDirty('Novo', [], undefined)).toBe(true)
  })
})
