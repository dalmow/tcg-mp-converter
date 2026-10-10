import { useParams } from 'react-router'
import { PageLayout } from '@/shared/layout/PageLayout'
import { DeckEditor } from './DeckEditor'

/** Serves both `/decks/new` (no id) and `/decks/:id`. */
export default function DeckEditorPage() {
  const { id } = useParams()
  return (
    <PageLayout title={id ? undefined : 'Novo deck'}>
      <DeckEditor key={id} deckId={id} />
    </PageLayout>
  )
}
