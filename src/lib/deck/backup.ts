import { parsePersistedData, type PersistedData } from './storage'
import type { Result } from './types'

export const BACKUP_VERSION = 1

export interface BackupFile extends PersistedData {
  version: number
  exportedAt: string
}

export interface BackupSummary {
  deckCount: number
  ownedCount: number
}

export function buildBackup(data: PersistedData, now: Date = new Date()): BackupFile {
  return { version: BACKUP_VERSION, exportedAt: now.toISOString(), decks: data.decks, owned: data.owned }
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
  if (typeof raw !== 'object' || raw === null || (raw as { version?: unknown }).version !== BACKUP_VERSION) {
    return invalid
  }
  const parsed = parsePersistedData(raw)
  if (!parsed.ok) return invalid
  const { data } = parsed
  return {
    ok: true,
    data,
    summary: { deckCount: data.decks.length, ownedCount: Object.keys(data.owned).length },
  }
}
