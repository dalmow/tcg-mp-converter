import { z } from 'zod'
import { deckInvariantError, persistedDataSchema, type PersistedData, type Result } from '@/features/decks'

export const BACKUP_VERSION = 1

const backupFileSchema = persistedDataSchema.extend({
  version: z.number(),
  exportedAt: z.string(),
})
export type BackupFile = z.infer<typeof backupFileSchema>

const backupVersionSchema = z.object({ version: z.number() })

const INVALID_FILE_ERROR = 'Arquivo de backup inválido'

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

/** Validates backup file text. Pure: never touches storage. */
export function parseBackup(text: string): Result<{ data: PersistedData; summary: BackupSummary }> {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    return { ok: false, error: INVALID_FILE_ERROR }
  }
  const version = backupVersionSchema.safeParse(raw)
  if (!version.success) return { ok: false, error: INVALID_FILE_ERROR }
  if (version.data.version !== BACKUP_VERSION) {
    return { ok: false, error: 'Versão de backup não suportada' }
  }
  const parsed = backupFileSchema.safeParse(raw)
  if (!parsed.success) return { ok: false, error: INVALID_FILE_ERROR }
  const { decks, owned } = parsed.data
  for (const deck of decks) {
    const invariantError = deckInvariantError(deck)
    if (invariantError) return { ok: false, error: invariantError }
  }
  return {
    ok: true,
    data: { decks, owned },
    summary: {
      deckCount: decks.length,
      ownedCount: Object.values(owned).filter((entry) => entry.quantity > 0).length,
    },
  }
}
