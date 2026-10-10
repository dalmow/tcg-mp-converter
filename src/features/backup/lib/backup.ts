import { DECK_SIZE, parsePersistedData, totalQuantity, type PersistedData, type Result } from '@/features/decks'

export const BACKUP_VERSION = 1

export interface BackupFile extends PersistedData {
  version: number
  exportedAt: string
}

export interface BackupSummary {
  deckCount: number
  /** Owned entries with quantity greater than zero. */
  ownedCount: number
}

export function buildBackup(data: PersistedData, now: Date = new Date()): BackupFile {
  return { version: BACKUP_VERSION, exportedAt: now.toISOString(), ...data }
}

/** Triggers a browser download of the backup as a `.json` file. */
export function downloadBackup(data: PersistedData, now: Date = new Date()) {
  const backup = buildBackup(data, now)
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `ptcg-backup-${backup.exportedAt.slice(0, 10)}.json`
  link.click()
  URL.revokeObjectURL(url)
}

function readVersion(raw: unknown): unknown {
  return typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>).version : undefined
}

/** Returns a Portuguese error for the first deck invariant the data breaks, or null. */
function deckInvariantError(data: PersistedData): string | null {
  for (const deck of data.decks) {
    const keys = new Set(deck.cards.map((card) => card.key))
    if (keys.size !== deck.cards.length) {
      return `Deck "${deck.name}" tem cartas duplicadas`
    }
    if (totalQuantity(deck.cards) > DECK_SIZE) {
      return `Deck "${deck.name}" tem mais de ${DECK_SIZE} cartas`
    }
  }
  return null
}

/** Validates backup file text. Pure: never touches storage. */
export function parseBackup(text: string): Result<{ data: PersistedData; summary: BackupSummary }> {
  const invalid = { ok: false, error: 'Arquivo de backup inválido' } as const
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    return invalid
  }
  const version = readVersion(raw)
  if (typeof version !== 'number') return invalid
  if (version !== BACKUP_VERSION) {
    return { ok: false, error: 'Versão de backup não suportada' }
  }
  const parsed = parsePersistedData(raw)
  if (!parsed.ok) return invalid
  const { data } = parsed
  const invariantError = deckInvariantError(data)
  if (invariantError) return { ok: false, error: invariantError }
  return {
    ok: true,
    data,
    summary: {
      deckCount: data.decks.length,
      ownedCount: Object.values(data.owned).filter((entry) => entry.quantity > 0).length,
    },
  }
}
