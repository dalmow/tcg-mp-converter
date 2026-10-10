import { useId, useMemo, useState } from 'react'
import { MaintenanceRow } from './MaintenanceRow'
import { PAGE_META } from '@/shared/lib/pageMeta'
import { usePageMeta } from '@/shared/hooks/usePageMeta'
import { PageLayout } from '@/shared/layout/PageLayout'
import { Panel } from '@/shared/ui/Panel'
import { Switch } from '@/shared/ui/Switch'
import { useToast } from '@/shared/hooks/useToast'
import { CARD_CATEGORIES, CATEGORY_TITLES, getDeckStore, useDeckData } from '@/features/decks'
import { deriveMaintenance, isSatisfied, toOwnedEntry } from '@/features/maintenance/lib/maintenance'

export default function MaintenancePage() {
  usePageMeta(PAGE_META.maintenance)
  const { decks, owned } = useDeckData()
  const [onlyMissing, setOnlyMissing] = useState(true)
  const switchId = useId()
  const toast = useToast()

  const rows = useMemo(() => deriveMaintenance(decks, owned), [decks, owned])
  const ownedOf = (key: string) => owned[key]?.quantity ?? 0

  return (
    <PageLayout
      title="Manutenção"
      subtitle="Cartas que faltam para completar seus decks, agrupadas por categoria."
      compact
    >
      <div className="flex items-center gap-space-4">
        <Switch id={switchId} checked={onlyMissing} onCheckedChange={setOnlyMissing} />
        <label htmlFor={switchId} className="text-body-strong">
          Só faltantes
        </label>
      </div>
      {CARD_CATEGORIES.map((category) => {
        const visible = rows
          .filter((row) => row.category === category)
          .filter((row) => !onlyMissing || !isSatisfied(row, ownedOf(row.key)))
          .sort((a, b) => a.displayName.localeCompare(b.displayName))
        return (
          <Panel key={category} className="px-(--card-spacing)">
            <h2 className="text-body-strong">{CATEGORY_TITLES[category]}</h2>
            {visible.length === 0 ? (
              <p className="text-ui text-ink-muted">Nenhuma carta.</p>
            ) : (
              <ul className="flex flex-col gap-space-5">
                {visible.map((row) => (
                  <MaintenanceRow
                    key={row.key}
                    row={row}
                    owned={ownedOf(row.key)}
                    onSave={(entry, quantity) => {
                      getDeckStore().setOwned(entry.key, toOwnedEntry(entry, quantity))
                      toast.success('Quantidade salva')
                    }}
                    onDelete={(entry) => {
                      const result = getDeckStore().deleteOwned(entry.key)
                      // On failure the row shows the error inline.
                      if (result.ok) toast.success('Carta excluída')
                      return result
                    }}
                  />
                ))}
              </ul>
            )}
          </Panel>
        )
      })}
    </PageLayout>
  )
}
