import { Link } from 'react-router-dom'
import { BookOpen, ArrowRight } from 'lucide-react'
import { getDoc } from '@/lib/docs'
import { Markdown } from './Markdown'
import { Card } from './ui'

/** "Cómo se usa" y "Casos de uso" del docs.md de la herramienta, con enlace a su documentación completa. */
export function ToolGuide({ toolId }: { toolId: string }) {
  const doc = getDoc(toolId)
  if (!doc) return null
  const extra = doc.sections.filter((s) => s !== doc.usage && s !== doc.useCases)

  return (
    <>
      <div className="mb-4 grid gap-4 md:grid-cols-2">
        {[doc.usage, doc.useCases].map(
          (s) =>
            s && (
              <section key={s.slug} className="card p-5">
                <h2 className="mb-3 font-mono text-sm font-bold text-white">{s.title}</h2>
                <Markdown source={s.body} />
              </section>
            ),
        )}
      </div>
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-acento" />
            <span className="font-mono text-sm font-bold text-white">Documentación</span>
          </div>
          <Link to={`/docs/${toolId}`} className="btn">
            leer completa <ArrowRight size={13} />
          </Link>
        </div>
        {extra.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
            {extra.map((s) => (
              <li key={s.slug}>
                <Link to={`/docs/${toolId}?s=${s.slug}`} className="text-info hover:underline">{s.title}</Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  )
}
