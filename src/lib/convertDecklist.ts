import type { CollectionConfig, Condition, ConvertDecklistResult, Language, UnresolvedCard } from './types'

function padLeft3(value: number): string {
  return String(value).padStart(3, '0')
}

interface ParsedLine {
  sourceLine: string
  quantity: number
  name: string
  collection: string
  number: number
}

const sectionHeaderPattern = /:\s*\d+$/

function isSectionHeader(line: string): boolean {
  return sectionHeaderPattern.test(line.trim())
}

const integerPattern = /^\d+$/

type ParseLineResult = { ok: true; value: ParsedLine } | { ok: false }

function parseLine(line: string): ParseLineResult {
  const tokens = line.trim().split(/\s+/)
  const quantityToken = tokens[0]
  const numberToken = tokens[tokens.length - 1]
  const collection = tokens[tokens.length - 2]
  const name = tokens.slice(1, tokens.length - 2).join(' ')

  if (tokens.length < 4 || !integerPattern.test(quantityToken) || !integerPattern.test(numberToken)) {
    return { ok: false }
  }

  return {
    ok: true,
    value: {
      sourceLine: line,
      quantity: Number(quantityToken),
      name,
      collection,
      number: Number(numberToken),
    },
  }
}

function mergeDuplicates(parsedLines: ParsedLine[]): ParsedLine[] {
  const merged = new Map<string, ParsedLine>()

  for (const parsedLine of parsedLines) {
    const key = `${parsedLine.collection}/${parsedLine.number}`
    const existing = merged.get(key)

    if (existing) {
      existing.quantity += parsedLine.quantity
    } else {
      merged.set(key, { ...parsedLine })
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
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .filter((line) => !isSectionHeader(line))

  const ligaPokemonLines: string[] = []
  const mypCardsLines: string[] = []
  const unresolvedCards: UnresolvedCard[] = []

  const validLines: ParsedLine[] = []

  for (const line of lines) {
    const parsed = parseLine(line)

    if (!parsed.ok) {
      unresolvedCards.push({ line, reason: 'Linha em formato inválido' })
      continue
    }

    validLines.push(parsed.value)
  }

  const parsedLines = mergeDuplicates(validLines)

  for (const { sourceLine, quantity, name, collection, number } of parsedLines) {
    const normalizedCollection = Object.keys(config).find(
      (registeredCollection) => registeredCollection.toUpperCase() === collection.toUpperCase(),
    )
    const total = normalizedCollection === undefined ? undefined : config[normalizedCollection]

    if (total === undefined) {
      unresolvedCards.push({ line: sourceLine, reason: `Coleção "${collection}" não cadastrada` })
      continue
    }

    const numberFormatted = padLeft3(number)
    const totalFormatted = padLeft3(total)

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
