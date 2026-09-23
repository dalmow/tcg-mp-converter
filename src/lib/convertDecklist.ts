import type { CollectionConfig, Condition, ConvertDecklistResult, Language, UnresolvedCard } from './types'

function padLeft3(value: number): string {
  return String(value).padStart(3, '0')
}

interface ParsedLine {
  quantity: number
  name: string
  collection: string
  number: number
}

const sectionHeaderPattern = /:\s*\d+$/

function isSectionHeader(line: string): boolean {
  return sectionHeaderPattern.test(line.trim())
}

function parseLine(line: string): ParsedLine {
  const tokens = line.trim().split(/\s+/)
  const number = tokens[tokens.length - 1]
  const collection = tokens[tokens.length - 2]
  const name = tokens.slice(1, tokens.length - 2).join(' ')

  return {
    quantity: Number(tokens[0]),
    name,
    collection,
    number: Number(number),
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

  const parsedLines = mergeDuplicates(lines.map(parseLine))

  const ligaPokemonLines: string[] = []
  const mypCardsLines: string[] = []
  const unresolvedCards: UnresolvedCard[] = []

  for (const { quantity, name, collection, number } of parsedLines) {
    const total = config[collection]
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
