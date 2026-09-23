import { describe, expect, it } from 'vitest'
import { convertDecklist } from './convertDecklist'

describe('convertDecklist', () => {
  it('converts a single card line for both marketplaces', () => {
    const result = convertDecklist('3 Abra MEG 53', { MEG: 132 }, 'NM', 'PTEN')

    expect(result.ligaPokemon).toBe('3 Abra (053/132) [QUALIDADE=NM][IDIOMA=PTEN]')
    expect(result.mypCards).toBe('3 Abra (053/132)')
    expect(result.unresolvedCards).toEqual([])
  })

  it('parses multi-word card names and suffixes like "ex"', () => {
    const result = convertDecklist(
      '1 Iron Valiant ex MEG 91',
      { MEG: 132 },
      'NM',
      'PTEN',
    )

    expect(result.ligaPokemon).toBe('1 Iron Valiant ex (091/132) [QUALIDADE=NM][IDIOMA=PTEN]')
    expect(result.mypCards).toBe('1 Iron Valiant ex (091/132)')
  })
})
