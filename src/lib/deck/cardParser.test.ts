import { describe, expect, it } from 'vitest'
import { normalizeName, parseCard } from './cardParser'
import type { CardCategory } from './types'

const collections = { MEG: 132, BLK: 86 }

function ok(category: CardCategory, text: string) {
  const result = parseCard(category, text, collections)
  if (!result.ok) throw new Error(result.error)
  return result.card
}

function error(category: CardCategory, text: string) {
  const result = parseCard(category, text, collections)
  if (result.ok) throw new Error('expected error')
  return result.error
}

describe('normalizeName', () => {
  it('trims, lowercases and strips accents', () => {
    expect(normalizeName('  Ordem da Chefía ')).toBe('ordem da chefia')
  })
})

describe('parseCard pokemon', () => {
  it('keys by collection-number', () => {
    expect(ok('pokemon', 'Abra MEG 54')).toMatchObject({
      key: 'MEG-54',
      displayName: 'Abra MEG 54',
      normalizedName: 'abra',
    })
  })
  it('is case tolerant and strips leading zeros', () => {
    expect(ok('pokemon', 'Iron Valiant ex meg 054')).toMatchObject({
      key: 'MEG-54',
      displayName: 'Iron Valiant ex MEG 54',
    })
  })
  it('requires collection and number', () => {
    expect(error('pokemon', 'Abra')).toBe('Pokémon exige nome, coleção e número')
    expect(error('pokemon', 'Abra 54')).toBe('Pokémon exige nome, coleção e número')
  })
  it('rejects unknown collection', () => {
    expect(error('pokemon', 'Abra XXX 5')).toBe('Coleção XXX não cadastrada')
  })
  it('rejects number above total or zero', () => {
    expect(ok('pokemon', 'Abra MEG 132').key).toBe('MEG-132')
    expect(error('pokemon', 'Abra MEG 133')).toContain('fora do total')
    expect(error('pokemon', 'Abra MEG 0')).toContain('fora do total')
  })
  it('rejects empty text', () => {
    expect(error('pokemon', '  ')).toBe('Informe o nome da carta')
  })
})

describe('parseCard trainer', () => {
  it('keys by normalized name', () => {
    expect(ok('trainer', 'Ordem da Chefia')).toMatchObject({ key: 'ordem da chefia', displayName: 'Ordem da Chefia' })
  })
  it('rejects collection or number', () => {
    expect(error('trainer', 'Ordem da chefia MEG 5')).toBe('Treinador não aceita coleção nem número')
  })
  it('keeps a trailing number that is not preceded by a collection as part of the name', () => {
    expect(ok('trainer', 'Carta 2')).toMatchObject({ key: 'carta 2', displayName: 'Carta 2' })
    expect(ok('trainer', 'Ordem da chefia 5')).toMatchObject({ key: 'ordem da chefia 5' })
  })
  it('detects the collection case-insensitively', () => {
    expect(error('trainer', 'Ordem da chefia meg 5')).toBe('Treinador não aceita coleção nem número')
  })
})

describe('parseCard energy', () => {
  it('recognizes basic energy with or without prefix, any accent/case', () => {
    expect(ok('energy', 'Energia Fogo')).toMatchObject({
      key: 'energy:fogo',
      displayName: 'Energia Fogo',
      basicEnergy: true,
    })
    expect(ok('energy', 'agua')).toMatchObject({ key: 'energy:agua', displayName: 'Energia Água', basicEnergy: true })
    expect(ok('energy', 'Energia Elétrica').key).toBe('energy:eletrica')
  })
  it('never collides with a trainer key of the same name', () => {
    expect(ok('energy', 'Fogo').key).not.toBe(ok('trainer', 'Fogo').key)
  })
  it('parses special energy like a pokemon', () => {
    expect(ok('energy', 'Energia de Prisma BLK 86')).toMatchObject({
      key: 'BLK-86',
      normalizedName: 'energia de prisma',
      basicEnergy: false,
    })
  })
  it('rejects non-basic name without collection and number', () => {
    expect(error('energy', 'Energia de Prisma')).toBe('Energia especial exige coleção e número')
  })
  it('validates special energy collection', () => {
    expect(error('energy', 'Energia de Prisma BLK 87')).toContain('fora do total')
  })
})
