import type { CollectionConfig } from '../types'
import type { CardCategory } from './types'

export interface ParsedCard {
  category: CardCategory
  key: string
  displayName: string
  /** Name normalized for the 4-copy rule (trim, lowercase, no accents). */
  normalizedName: string
  basicEnergy: boolean
}

export type ParseCardResult = { ok: true; card: ParsedCard } | { ok: false; error: string }

export function normalizeName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
}

const BASIC_ENERGY_TYPES = ['Grama', 'Fogo', 'Água', 'Elétrica', 'Psíquica', 'Lutadora', 'Escuridão', 'Metal']

const basicEnergyByNormalizedType = new Map(BASIC_ENERGY_TYPES.map((type) => [normalizeName(type), type]))

const integerPattern = /^\d+$/

interface Split {
  name: string
  collection?: string
  number?: number
  /** Trailing integer present without a collection token before it. */
  strayNumber: boolean
}

function split(text: string): Split {
  const tokens = text.trim().split(/\s+/).filter(Boolean)
  const last = tokens[tokens.length - 1]
  if (tokens.length >= 3 && integerPattern.test(last)) {
    return {
      name: tokens.slice(0, -2).join(' '),
      collection: tokens[tokens.length - 2],
      number: Number(last),
      strayNumber: false,
    }
  }
  if (tokens.length >= 1 && integerPattern.test(last)) {
    return { name: tokens.slice(0, -1).join(' '), number: Number(last), strayNumber: true }
  }
  return { name: tokens.join(' '), strayNumber: false }
}

function resolvePrinting(
  label: string,
  parts: Split,
  collections: CollectionConfig,
): { ok: true; key: string; displayName: string } | { ok: false; error: string } {
  if (!parts.name || parts.collection === undefined || parts.number === undefined) {
    return { ok: false, error: `${label} exige nome, coleção e número` }
  }
  const collection = parts.collection.toUpperCase()
  const total = collections[collection]
  if (total === undefined) {
    return { ok: false, error: `Coleção ${collection} não cadastrada` }
  }
  if (parts.number < 1 || parts.number > total) {
    return { ok: false, error: `Número ${parts.number} fora do total da coleção ${collection} (${total})` }
  }
  return {
    ok: true,
    key: `${collection}-${parts.number}`,
    displayName: `${parts.name} ${collection} ${parts.number}`,
  }
}

function parseBasicEnergyType(name: string): string | undefined {
  const normalized = normalizeName(name).replace(/^energia\s+/, '')
  return basicEnergyByNormalizedType.get(normalized)
}

export function parseCard(category: CardCategory, text: string, collections: CollectionConfig): ParseCardResult {
  const parts = split(text)
  if (!parts.name) {
    return { ok: false, error: 'Informe o nome da carta' }
  }
  const hasPrinting = parts.collection !== undefined || parts.strayNumber

  if (category === 'trainer') {
    if (hasPrinting) {
      return { ok: false, error: 'Treinador não aceita coleção nem número' }
    }
    const normalizedName = normalizeName(parts.name)
    return {
      ok: true,
      card: { category, key: normalizedName, displayName: parts.name, normalizedName, basicEnergy: false },
    }
  }

  if (category === 'energy' && !hasPrinting) {
    const type = parseBasicEnergyType(parts.name)
    if (!type) {
      return { ok: false, error: 'Energia especial exige coleção e número' }
    }
    const normalizedType = normalizeName(type)
    return {
      ok: true,
      card: {
        category,
        key: normalizedType,
        displayName: `Energia ${type}`,
        normalizedName: normalizedType,
        basicEnergy: true,
      },
    }
  }

  const printing = resolvePrinting(category === 'pokemon' ? 'Pokémon' : 'Energia especial', parts, collections)
  if (!printing.ok) return printing
  return {
    ok: true,
    card: {
      category,
      key: printing.key,
      displayName: printing.displayName,
      normalizedName: normalizeName(parts.name),
      basicEnergy: false,
    },
  }
}
