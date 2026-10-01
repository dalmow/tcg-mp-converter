import { useEffect } from 'react'
import type { PageMeta } from './pageMeta.ts'

function setMeta(name: string, content: string | null) {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)
  if (content === null) {
    tag?.remove()
    return
  }
  if (!tag) {
    tag = document.createElement('meta')
    tag.name = name
    document.head.append(tag)
  }
  tag.content = content
}

/** Applies the route's `<title>`, meta description and robots directive. */
export function usePageMeta({ title, description, noindex }: PageMeta) {
  useEffect(() => {
    document.title = title
    setMeta('description', description)
    setMeta('robots', noindex ? 'noindex' : null)
  }, [title, description, noindex])
}
