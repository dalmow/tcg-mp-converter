import { useParams } from 'react-router'
import { PageLayout } from '@/components/PageLayout'

/** Serves both `/decks/new` (no id) and `/decks/:id`. */
export default function DeckEditorPage() {
  const { id } = useParams()
  return <PageLayout title={id ? 'Deck' : 'Novo deck'} />
}
