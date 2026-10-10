import { describe, expect, it } from 'vitest'
import { buildBackup, parseBackup } from './backup'
import type { DeckCard, PersistedData } from '@/features/decks'

const data: PersistedData = {
  decks: [
    {
      id: 'd1',
      name: 'Alakazam',
      cards: [
        {
          category: 'pokemon',
          key: 'MEG-54',
          displayName: 'Abra MEG 54',
          quantity: 2,
        },
      ],
    },
  ],
  owned: {
    'MEG-54': { displayName: 'Abra MEG 54', category: 'pokemon', quantity: 3 },
    fogo: { displayName: 'Energia Fogo', category: 'energy', quantity: 10 },
  },
}

const deck = data.decks[0]
const card = deck.cards[0]

describe('buildBackup', () => {
  it('builds the payload with version, timestamp, decks and owned', () => {
    const payload = buildBackup(data, new Date('2026-01-02T03:04:05.000Z'))
    expect(payload).toEqual({
      version: 1,
      exportedAt: '2026-01-02T03:04:05.000Z',
      decks: data.decks,
      owned: data.owned,
    })
  })
})

describe('parseBackup', () => {
  it('round-trips an exported backup with a summary', () => {
    const text = JSON.stringify(buildBackup(data))
    expect(parseBackup(text)).toEqual({
      ok: true,
      data,
      summary: { deckCount: 1, ownedCount: 2 },
    })
  })

  it('rejects text that is not JSON', () => {
    expect(parseBackup('not json').ok).toBe(false)
  })

  it('rejects a file with invalid data', () => {
    const text = JSON.stringify({ version: 1, decks: [{ id: 1 }], owned: {} })
    expect(parseBackup(text).ok).toBe(false)
  })

  it.each([
    ['an unknown card category', { decks: [{ ...deck, cards: [{ ...card, category: 'item' }] }] }],
    ['a non-integer card quantity', { decks: [{ ...deck, cards: [{ ...card, quantity: 1.5 }] }] }],
    ['a decks value that is not an array', { decks: {} }],
    ['an owned value that is an array', { owned: [] }],
  ])('rejects a file with %s', (_label, overrides) => {
    expect(parseBackup(JSON.stringify({ ...buildBackup(data), ...overrides })).ok).toBe(false)
  })

  it('rejects an owned entry that breaks the schema', () => {
    const text = JSON.stringify({
      ...buildBackup(data),
      owned: { fogo: { displayName: 'Energia Fogo', category: 'energy', quantity: -1 } },
    })
    expect(parseBackup(text).ok).toBe(false)
  })

  it('rejects an unsupported version with a specific message', () => {
    const text = JSON.stringify({ ...buildBackup(data), version: 2 })
    expect(parseBackup(text)).toEqual({
      ok: false,
      error: 'Versão de backup não suportada',
    })
  })

  it('counts only owned cards with quantity above zero in the summary', () => {
    const withZero: PersistedData = {
      ...data,
      owned: {
        ...data.owned,
        fogo: { displayName: 'Energia Fogo', category: 'energy', quantity: 0 },
      },
    }
    const result = parseBackup(JSON.stringify(buildBackup(withZero)))
    expect(result.ok && result.summary.ownedCount).toBe(1)
  })

  it('imports a file without exportedAt', () => {
    const { exportedAt: _exportedAt, ...withoutTimestamp } = buildBackup(data)
    expect(parseBackup(JSON.stringify(withoutTimestamp)).ok).toBe(true)
  })

  it('ignores unknown fields', () => {
    const text = JSON.stringify({ ...buildBackup(data), decks: [{ ...deck, color: 'red' }] })
    expect(parseBackup(text)).toEqual({
      ok: true,
      data,
      summary: { deckCount: 1, ownedCount: 2 },
    })
  })

  it('rejects a deck with a duplicate card key', () => {
    const bad: PersistedData = {
      ...data,
      decks: [{ ...deck, cards: [card, card] }],
    }
    expect(parseBackup(JSON.stringify(buildBackup(bad)))).toEqual({
      ok: false,
      error: 'Deck "Alakazam" tem cartas duplicadas',
    })
  })

  it('rejects a deck with more than 60 cards', () => {
    const cards: DeckCard[] = [
      { category: 'pokemon', key: 'MEG-1', displayName: 'A', quantity: 40 },
      { category: 'pokemon', key: 'MEG-2', displayName: 'B', quantity: 21 },
    ]
    const bad: PersistedData = {
      ...data,
      decks: [{ ...deck, cards }],
    }
    expect(parseBackup(JSON.stringify(buildBackup(bad)))).toEqual({
      ok: false,
      error: 'Deck "Alakazam" tem mais de 60 cartas',
    })
  })

  it('rejects two decks that share an id', () => {
    const bad: PersistedData = {
      ...data,
      decks: [deck, { ...deck, name: 'Outro' }],
    }
    expect(parseBackup(JSON.stringify(buildBackup(bad)))).toEqual({
      ok: false,
      error: 'Dois decks têm o mesmo id',
    })
  })
})
