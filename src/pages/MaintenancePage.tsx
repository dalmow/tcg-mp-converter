import { useId, useMemo, useState } from 'react'
import { MaintenanceRow } from '@/components/maintenance/MaintenanceRow'
import { PAGE_META } from '@/lib/pageMeta'
import { usePageMeta } from '@/lib/usePageMeta'
import { PageLayout } from '@/components/PageLayout'
import { Panel } from '@/components/Panel'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/toast'
import { getDeckStore, useDeckData } from '@/lib/deck/deckStore'
import { deriveMaintenance, isSatisfied, toOwnedEntry } from '@/lib/deck/maintenance'
import { CARD_CATEGORIES, type CardCategory } from '@/lib/deck/types'

const CATEGORY_TITLES: Record<CardCategory, string> = {
  pokemon: 'Pokémon',
  trainer: 'Treinadores',
  energy: 'Energias',
}

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
    >
      <div className="flex items-center gap-space-3">
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
          <Panel key={category} className="gap-space-4 rounded-2xl p-5">
            <h2 className="text-body-strong">{CATEGORY_TITLES[category]}</h2>
            {visible.length === 0 ? (
              <p className="text-ui text-ink-muted">Nenhuma carta.</p>
            ) : (
              <ul className="flex flex-col gap-space-3">
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
