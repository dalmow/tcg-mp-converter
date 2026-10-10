import { parseCard } from '@/features/decks'
import { isIntegerText } from '@/shared/lib/integer'
import type {
  CollectionConfig,
  Condition,
  ConvertDecklistResult,
  Language,
  UnresolvedCard,
} from '@/shared/types/domain'

const INVALID_FORMAT_REASON = 'Linha em formato inválido'

function padLeft3(value: number): string {
  return String(value).padStart(3, '0')
}

interface ValidLine {
  key: string
  quantity: number
  name: string
  collection: string
  number: number
}

const sectionHeaderPattern = /:\s*\d+$/

function isSectionHeader(line: string): boolean {
  return sectionHeaderPattern.test(line)
}

function mergeDuplicates(validLines: ValidLine[]): ValidLine[] {
  const merged = new Map<string, ValidLine>()

  for (const validLine of validLines) {
    const existing = merged.get(validLine.key)

    if (existing) {
      existing.quantity += validLine.quantity
    } else {
      merged.set(validLine.key, { ...validLine })
    }
  }

  return [...merged.values()]
}

export function convertDecklist(
  decklist: string,
  config: CollectionConfig,
  condition: Condition,
  language: Language,
): ConvertDecklistResult {
  const lines = decklist
    .split(/\r\n|\r|\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .filter((line) => !isSectionHeader(line))

  const ligaPokemonLines: string[] = []
  const mypCardsLines: string[] = []
  const unresolvedCards: UnresolvedCard[] = []

  const validLines: ValidLine[] = []

  for (const line of lines) {
    // Line shape: `<quantity> <name> <COLLECTION> <number>`. Only the card part goes to parseCard.
    const tokens = line.split(/\s+/)
    const quantityToken = tokens[0]
    const numberToken = tokens[tokens.length - 1]
    const collection = tokens[tokens.length - 2]

    if (tokens.length < 4 || !isIntegerText(quantityToken) || !isIntegerText(numberToken)) {
      unresolvedCards.push({ line, reason: INVALID_FORMAT_REASON })
      continue
    }

    // The converter names the collection as typed; parseCard owns the range check and the card key.
    if (config[collection.toUpperCase()] === undefined) {
      unresolvedCards.push({ line, reason: `Coleção "${collection}" não cadastrada` })
      continue
    }

    const parsed = parseCard('pokemon', tokens.slice(1).join(' '), config)
    const printing = parsed.ok ? parsed.card.printing : undefined
    if (!parsed.ok || !printing) {
      unresolvedCards.push({ line, reason: parsed.ok ? INVALID_FORMAT_REASON : parsed.error })
      continue
    }

    validLines.push({
      key: parsed.card.key,
      quantity: Number(quantityToken),
      name: parsed.card.name,
      collection: printing.collection,
      number: printing.number,
    })
  }

  for (const { quantity, name, collection, number } of mergeDuplicates(validLines)) {
    const numberFormatted = padLeft3(number)
    const totalFormatted = padLeft3(config[collection])

    ligaPokemonLines.push(
      `${quantity} ${name} (${numberFormatted}/${totalFormatted}) [QUALIDADE=${condition}][IDIOMA=${language}]`,
    )
    mypCardsLines.push(`${quantity} ${name} (${numberFormatted}/${totalFormatted})`)
  }

  return {
    ligaPokemon: ligaPokemonLines.join('\n'),
    mypCards: mypCardsLines.join('\n'),
    unresolvedCards,
  }
}
