import { useEffect } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { BookOpen, Wrench } from 'lucide-react'
import { findTool, TOOLS, TRACKS } from '@/lib/registry'
import { getDoc } from '@/lib/docs'
import { Markdown } from '@/components/Markdown'
import { ToolHeader } from '@/components/ui'

/* Con HashRouter la URL ya usa el "#", así que la sección va en ?s=<slug> y se hace scroll a mano. */
const scrollToSection = (slug: string) => document.getElementById(slug)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

function DocsIndex() {
  return (
    <div>
      <ToolHeader icon={BookOpen} title="Documentación" desc="Documentación propia de cada herramienta: cómo se usa, casos de uso y la teoría detrás." />
      {TRACKS.map((track) => (
        <section key={track} className="mb-6">
          <h2 className="mb-2 font-mono text-sm uppercase tracking-wider text-muted">{track}</h2>
          <ul className="card divide-y divide-edge">
            {TOOLS.filter((t) => t.track === track).map((t) => {
              const doc = getDoc(t.id)
              return (
                <li key={t.id} className="flex items-center gap-3 px-4 py-2.5">
                  <t.icon size={16} className={doc ? 'text-acento' : 'text-muted'} />
                  {doc ? (
                    <Link to={`/docs/${t.id}`} className="flex-1 text-sm text-slate-200 hover:text-acento">{t.name}</Link>
                  ) : (
                    <span className="flex-1 text-sm text-muted">{t.name}</span>
                  )}
                  <span className="font-mono text-[11px] text-muted">{doc ? `${doc.sections.length} secciones` : 'pendiente'}</span>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}

function ToolDocPage({ id }: { id: string }) {
  const tool = findTool(id)
  const doc = getDoc(id)
  const [params] = useSearchParams()
  const section = params.get('s')

  useEffect(() => {
    if (section) scrollToSection(section)
    else window.scrollTo({ top: 0 })
  }, [id, section])

  if (!tool || !doc) {
    return (
      <div className="font-mono text-sm">
        <p className="text-muted">Esta herramienta todavía no tiene documentación.</p>
        <Link to="/docs" className="text-info hover:underline">ver toda la documentación</Link>
      </div>
    )
  }

  return (
    <div className="lg:flex lg:gap-8">
      <article className="min-w-0 flex-1">
        <ToolHeader icon={tool.icon} title={doc.title || tool.name} desc={tool.desc} />
        <Link to={`/tool/${id}`} className="btn mb-6">
          <Wrench size={13} /> abrir la herramienta
        </Link>
        <Markdown source={doc.markdown.replace(/^# .*\n/, '')} />
      </article>
      <nav className="hidden w-52 shrink-0 lg:block">
        <div className="sticky top-6">
          <h3 className="mb-2 font-mono text-[11px] uppercase tracking-wider text-muted">En esta página</h3>
          <ul className="space-y-1 border-l border-edge text-sm">
            {doc.sections.map((s) => (
              <li key={s.slug}>
                <button
                  type="button"
                  onClick={() => scrollToSection(s.slug)}
                  className="-ml-px border-l border-transparent pl-3 text-left text-muted hover:border-acento hover:text-slate-200"
                >
                  {s.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </div>
  )
}

export default function Docs() {
  const { id } = useParams()
  return id ? <ToolDocPage id={id} /> : <DocsIndex />
}
