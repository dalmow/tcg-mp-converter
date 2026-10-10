import { describe, expect, it } from 'vitest'
import collections from '@/shared/data/collections.json'
import type { Deck } from '@/features/decks/types/deck'
import { deriveRowState } from './rowLogic'
import type { RowContext } from './rowLogic'

const deck: Deck = {
  id: 'd',
  name: 'Deck',
  cards: [{ category: 'pokemon', key: 'MEG-54', displayName: 'Abra MEG 54', quantity: 3 }],
}
const context: RowContext = { category: 'pokemon', otherRows: deck, decks: [deck], owned: {}, collections }

function derive(text: string, quantityText: string, ownedText: string) {
  return deriveRowState(context, { text, quantityText, ownedText })
}

describe('deriveRowState', () => {
  it('is valid for a parsed card with owned covering the quantity', () => {
    expect(derive('Abra MEG 53', '1', '1').valid).toBe(true)
  })

  it('is invalid when owned is below the quantity or not a number', () => {
    expect(derive('Abra MEG 53', '2', '1').valid).toBe(false)
    expect(derive('Abra MEG 53', '1', 'x').valid).toBe(false)
  })

  it('is invalid when the card text does not parse', () => {
    expect(derive('Abra XYZ 54', '1', '1').valid).toBe(false)
  })

  it('reports a quantity error for an invalid quantity', () => {
    expect(derive('Abra MEG 53', '', '1').quantityError).not.toBeNull()
  })

  it('warns above 4 copies of the same name and marks the row invalid', () => {
    const state = derive('Abra MEG 53', '2', '2')
    expect(state.warning).toBe('Mais de 4 cópias de Abra MEG 53 no deck')
    expect(state.valid).toBe(false)
  })
})
