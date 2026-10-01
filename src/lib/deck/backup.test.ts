import { describe, expect, it } from 'vitest'
import { buildBackup, parseBackup } from './backup'
import type { PersistedData } from './storage'

const data: PersistedData = {
  decks: [
    {
      id: 'd1',
      name: 'Alakazam',
      cards: [{ category: 'pokemon', key: 'MEG-54', displayName: 'Abra MEG 54', quantity: 2 }],
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

  it('rejects an unsupported version', () => {
    const text = JSON.stringify({ ...buildBackup(data), version: 2 })
    expect(parseBackup(text).ok).toBe(false)
  })
})
