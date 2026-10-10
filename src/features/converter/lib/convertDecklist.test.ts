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
    const result = convertDecklist('1 Iron Valiant ex MEG 91', { MEG: 132 }, 'NM', 'PTEN')

    expect(result.ligaPokemon).toBe('1 Iron Valiant ex (091/132) [QUALIDADE=NM][IDIOMA=PTEN]')
    expect(result.mypCards).toBe('1 Iron Valiant ex (091/132)')
  })

  it('parses card name suffixes like "V" and "VSTAR"', () => {
    const decklist = ['1 Arceus V MEG 100', '1 Arceus VSTAR MEG 101'].join('\n')

    const result = convertDecklist(decklist, { MEG: 132 }, 'NM', 'PTEN')

    expect(result.ligaPokemon.split('\n')).toEqual([
      '1 Arceus V (100/132) [QUALIDADE=NM][IDIOMA=PTEN]',
      '1 Arceus VSTAR (101/132) [QUALIDADE=NM][IDIOMA=PTEN]',
    ])
  })

  it('ignores section headers and converts every card line', () => {
    const decklist = ['Pokemon: 2', '1 Abra MEG 53', '2 Fragmento Encantado PFL 94', 'Trainer: 0'].join('\n')

    const result = convertDecklist(decklist, { MEG: 132, PFL: 94 }, 'NM', 'PTEN')

    expect(result.ligaPokemon.split('\n')).toEqual([
      '1 Abra (053/132) [QUALIDADE=NM][IDIOMA=PTEN]',
      '2 Fragmento Encantado (094/094) [QUALIDADE=NM][IDIOMA=PTEN]',
    ])
  })

  it('merges duplicate lines for the same collection and number by summing quantity', () => {
    const decklist = ['2 Abra MEG 53', '1 Abra MEG 53'].join('\n')

    const result = convertDecklist(decklist, { MEG: 132 }, 'NM', 'PTEN')

    expect(result.ligaPokemon).toBe('3 Abra (053/132) [QUALIDADE=NM][IDIOMA=PTEN]')
    expect(result.mypCards).toBe('3 Abra (053/132)')
  })

  it('matches a collection code case-insensitively', () => {
    const result = convertDecklist('3 Abra meg 53', { MEG: 132 }, 'NM', 'PTEN')

    expect(result.ligaPokemon).toBe('3 Abra (053/132) [QUALIDADE=NM][IDIOMA=PTEN]')
    expect(result.unresolvedCards).toEqual([])
  })

  it('reports a card with an unregistered collection as unresolved, without stopping the rest', () => {
    const decklist = ['1 Abra MEG 53', '1 Mewtwo ZZZ 1'].join('\n')

    const result = convertDecklist(decklist, { MEG: 132 }, 'NM', 'PTEN')

    expect(result.ligaPokemon).toBe('1 Abra (053/132) [QUALIDADE=NM][IDIOMA=PTEN]')
    expect(result.unresolvedCards).toEqual([{ line: '1 Mewtwo ZZZ 1', reason: 'Coleção "ZZZ" não cadastrada' }])
  })

  it('reports malformed lines as unresolved, without stopping the rest', () => {
    const decklist = ['1 Abra MEG 53', '1 Abra MEG', 'x3 Pikachu MEG 10'].join('\n')

    const result = convertDecklist(decklist, { MEG: 132 }, 'NM', 'PTEN')

    expect(result.ligaPokemon).toBe('1 Abra (053/132) [QUALIDADE=NM][IDIOMA=PTEN]')
    expect(result.unresolvedCards).toEqual([
      { line: '1 Abra MEG', reason: 'Linha em formato inválido' },
      { line: 'x3 Pikachu MEG 10', reason: 'Linha em formato inválido' },
    ])
  })

  it.each([
    ['CRLF', '\r\n'],
    ['CR', '\r'],
  ])('gives the same output for %s line endings as for LF', (_, lineEnding) => {
    const lines = ['Pokemon: 1', '1 Abra MEG 53', '1 Abra MEG', '']

    const lfResult = convertDecklist(lines.join('\n'), { MEG: 132 }, 'NM', 'PTEN')
    const result = convertDecklist(lines.join(lineEnding), { MEG: 132 }, 'NM', 'PTEN')

    expect(lfResult.ligaPokemon).toBe('1 Abra (053/132) [QUALIDADE=NM][IDIOMA=PTEN]')
    expect(result).toEqual(lfResult)
  })

  it('trims surrounding whitespace from each line before parsing and reporting it', () => {
    const decklist = ['   1 Abra MEG 53   ', '   1 Abra MEG   '].join('\n')

    const result = convertDecklist(decklist, { MEG: 132 }, 'NM', 'PTEN')

    expect(result.ligaPokemon).toBe('1 Abra (053/132) [QUALIDADE=NM][IDIOMA=PTEN]')
    expect(result.unresolvedCards).toEqual([{ line: '1 Abra MEG', reason: 'Linha em formato inválido' }])
  })

  it('reports a card number above the collection total as unresolved, keeping the card at the total', () => {
    const decklist = ['1 Abra MEG 53', '1 Abra MEG 54'].join('\n')

    const result = convertDecklist(decklist, { MEG: 53 }, 'NM', 'PTEN')

    expect(result.ligaPokemon).toBe('1 Abra (053/053) [QUALIDADE=NM][IDIOMA=PTEN]')
    expect(result.mypCards).toBe('1 Abra (053/053)')
    expect(result.unresolvedCards).toEqual([
      { line: '1 Abra MEG 54', reason: 'Número 54 fora do total da coleção "MEG" (53)' },
    ])
  })

  it('reports a card number of zero as unresolved', () => {
    const result = convertDecklist('1 Abra MEG 0', { MEG: 132 }, 'NM', 'PTEN')

    expect(result.ligaPokemon).toBe('')
    expect(result.unresolvedCards).toEqual([
      { line: '1 Abra MEG 0', reason: 'Número 0 fora do total da coleção "MEG" (132)' },
    ])
  })
})
