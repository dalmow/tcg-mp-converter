import type { CollectionConfig } from '../types'
import type { CardCategory, Result } from './types'

export interface ParsedCard {
  category: CardCategory
  key: string
  displayName: string
  /** Name normalized for the 4-copy rule (trim, lowercase, no accents). */
  normalizedName: string
  basicEnergy: boolean
}

export type ParseCardResult = Result<{ card: ParsedCard }>

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

interface CardTextParts {
  name: string
  collection?: string
  number?: number
  /** Trailing integer present without a collection token before it. */
  hasLooseNumber: boolean
}

/** Splits `<name> [<COLLECTION> <number>]` by tokens; the collection token is not validated here. */
function splitCardText(text: string): CardTextParts {
  const tokens = text.trim().split(/\s+/).filter(Boolean)
  const last = tokens[tokens.length - 1]
  if (tokens.length >= 3 && integerPattern.test(last)) {
    return {
      name: tokens.slice(0, -2).join(' '),
      collection: tokens[tokens.length - 2],
      number: Number(last),
      hasLooseNumber: false,
    }
  }
  if (tokens.length >= 1 && integerPattern.test(last)) {
    return { name: tokens.slice(0, -1).join(' '), number: Number(last), hasLooseNumber: true }
  }
  return { name: tokens.join(' '), hasLooseNumber: false }
}

const PRINTING_LABEL: Record<CardCategory, string> = {
  pokemon: 'Pokémon',
  energy: 'Energia especial',
  trainer: 'Treinador',
}

function buildCard(
  category: CardCategory,
  key: string,
  displayName: string,
  normalizedName: string,
  basicEnergy: boolean,
): ParseCardResult {
  return { ok: true, card: { category, key, displayName, normalizedName, basicEnergy } }
}

function resolvePrinting(
  category: CardCategory,
  parts: CardTextParts,
  collections: CollectionConfig,
): Result<{ key: string; displayName: string }> {
  if (!parts.name || parts.collection === undefined || parts.number === undefined) {
    return { ok: false, error: `${PRINTING_LABEL[category]} exige nome, coleção e número` }
  }
  const collection = parts.collection.toUpperCase()
  const total = collections[collection]
  if (total === undefined) {
    return { ok: false, error: `Coleção ${collection} não cadastrada` }
  }
  if (parts.number < 1 || parts.number > total) {
    return { ok: false, error: `Número ${parts.number} fora do total da coleção ${collection} (${total})` }
  }
  return { ok: true, key: `${collection}-${parts.number}`, displayName: `${parts.name} ${collection} ${parts.number}` }
}

function parseBasicEnergyType(name: string): string | undefined {
  const normalized = normalizeName(name).replace(/^energia\s+/, '')
  return basicEnergyByNormalizedType.get(normalized)
}

export function parseCard(category: CardCategory, text: string, collections: CollectionConfig): ParseCardResult {
  const parts = splitCardText(text)
  if (!parts.name) {
    return { ok: false, error: 'Informe o nome da carta' }
  }

  if (category === 'trainer') {
    // A trainer name may end in a digit; only a known collection acronym before it counts as a printing.
    if (parts.collection !== undefined && collections[parts.collection.toUpperCase()] !== undefined) {
      return { ok: false, error: 'Treinador não aceita coleção nem número' }
    }
    const name = text.trim().split(/\s+/).join(' ')
    const normalizedName = normalizeName(name)
    return buildCard(category, normalizedName, name, normalizedName, false)
  }

  const hasPrinting = parts.collection !== undefined || parts.hasLooseNumber
  if (category === 'energy' && !hasPrinting) {
    const type = parseBasicEnergyType(parts.name)
    if (!type) {
      return { ok: false, error: 'Energia especial exige coleção e número' }
    }
    const normalizedType = normalizeName(type)
    // Prefixed so a basic energy key can never equal a trainer's normalized-name key.
    return buildCard(category, `energy:${normalizedType}`, `Energia ${type}`, normalizedType, true)
  }

  const printing = resolvePrinting(category, parts, collections)
  if (!printing.ok) return printing
  return buildCard(category, printing.key, printing.displayName, normalizeName(parts.name), false)
}
