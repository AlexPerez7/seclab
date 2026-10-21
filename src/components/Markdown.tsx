import { useMemo } from 'react'
import { marked } from 'marked'
import { slugify } from '@/lib/docs'

const ENTITIES: Record<string, string> = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'" }
const decodeEntities = (s: string) => s.replace(/&(amp|lt|gt|quot|#39);/g, (e) => ENTITIES[e])

/** Renderiza markdown propio (docs.md del repo, no contenido de terceros) y pone ids a los títulos para poder enlazarlos. */
export function Markdown({ source }: { source: string }) {
  const html = useMemo(() => {
    const out = marked.parse(source, { async: false, gfm: true }) as string
    return out.replace(
      /<h([2-4])>(.*?)<\/h\1>/g,
      (_, level: string, inner: string) => `<h${level} id="${slugify(decodeEntities(inner))}">${inner}</h${level}>`,
    )
  }, [source])
  return <div className="prose-lab" dangerouslySetInnerHTML={{ __html: html }} />
}
