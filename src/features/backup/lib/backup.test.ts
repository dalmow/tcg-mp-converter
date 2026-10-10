import { describe, expect, it } from 'vitest'
import { buildBackup, parseBackup } from './backup'
import { recoverPersistedData, type PersistedData } from '@/features/decks'

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

  it('ignores unknown fields', () => {
    const text = JSON.stringify({ ...buildBackup(data), extra: true })
    expect(parseBackup(text)).toEqual({
      ok: true,
      data,
      summary: { deckCount: 1, ownedCount: 2 },
    })
  })
})

describe('parseBackup agrees with storage recovery on deck invariants', () => {
  const deck = data.decks[0]
  const card = deck.cards[0]

  it.each([
    ['repeats a card key', { ...deck, cards: [card, card] }],
    [
      'has more than 60 cards',
      {
        ...deck,
        cards: [
          { ...card, quantity: 40 },
          { ...card, key: 'MEG-2', quantity: 21 },
        ],
      },
    ],
  ])('rejects the backup and drops from storage a deck that %s', (_label, invalidDeck) => {
    const decks = [invalidDeck]
    expect(parseBackup(JSON.stringify(buildBackup({ decks, owned: {} }))).ok).toBe(false)
    expect(recoverPersistedData({ decks, owned: {} }).decks).toEqual([])
  })

  it('rejects the backup and keeps only the first of two decks that share an id', () => {
    const decks = [deck, { ...deck, name: 'Outro' }]
    expect(parseBackup(JSON.stringify(buildBackup({ decks, owned: {} }))).ok).toBe(false)
    expect(recoverPersistedData({ decks, owned: {} }).decks).toEqual([deck])
  })
})
