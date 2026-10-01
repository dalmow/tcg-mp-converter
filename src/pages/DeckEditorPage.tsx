import { useParams } from 'react-router'
import { PageLayout } from '@/components/PageLayout'
import { DeckEditor } from '@/components/deck-editor/DeckEditor'

/** Serves both `/decks/new` (no id) and `/decks/:id`. */
export default function DeckEditorPage() {
  const { id } = useParams()
  return (
    <PageLayout>
      <DeckEditor key={id} deckId={id} />
    </PageLayout>
  )
}
