import { useId, useMemo, useState } from 'react'
import { MaintenanceRow } from '@/components/maintenance/MaintenanceRow'
import { PageLayout } from '@/components/PageLayout'
import { Panel } from '@/components/Panel'
import { Switch } from '@/components/ui/switch'
import { getDeckStore, useDeckData } from '@/lib/deck/deckStore'
import { deriveMaintenance, isSatisfied, toOwnedEntry } from '@/lib/deck/maintenance'
import { CARD_CATEGORIES, type CardCategory } from '@/lib/deck/types'

const CATEGORY_TITLES: Record<CardCategory, string> = {
  pokemon: 'Pokémon',
  trainer: 'Treinadores',
  energy: 'Energias',
}

export default function MaintenancePage() {
  const { decks, owned } = useDeckData()
  const [onlyMissing, setOnlyMissing] = useState(true)
  const switchId = useId()

  const rows = useMemo(() => deriveMaintenance(decks, owned), [decks, owned])
  const ownedOf = (key: string) => owned[key]?.quantity ?? 0

  return (
    <PageLayout title="Manutenção">
      <div className="flex items-center gap-2">
        <Switch id={switchId} checked={onlyMissing} onCheckedChange={setOnlyMissing} />
        <label htmlFor={switchId} className="text-sm">
          Só faltantes
        </label>
      </div>
      {CARD_CATEGORIES.map((category) => {
        const visible = rows
          .filter((row) => row.category === category)
          .filter((row) => !onlyMissing || !isSatisfied(row, ownedOf(row.key)))
          .sort((a, b) => a.displayName.localeCompare(b.displayName))
        return (
          <Panel key={category} className="gap-3 p-4">
            <h2 className="font-semibold">{CATEGORY_TITLES[category]}</h2>
            {visible.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma carta.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {visible.map((row) => (
                  <MaintenanceRow
                    key={row.key}
                    row={row}
                    owned={ownedOf(row.key)}
                    onSave={(entry, quantity) => getDeckStore().setOwned(entry.key, toOwnedEntry(entry, quantity))}
                    onDelete={(entry) => getDeckStore().deleteOwned(entry.key)}
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
