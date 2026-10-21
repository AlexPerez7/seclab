import { Link } from 'react-router-dom'
import { TOOLS, TRACKS } from '@/lib/registry'
import { BACKLOG } from '@/data/backlog'
import { StatusBadge } from '@/components/ui'

export default function Home() {
  const done = TOOLS.filter((t) => t.status === 'listo').length
  return (
    <div>
      <h1 className="font-mono text-2xl font-bold text-white">&gt;_ SecLab</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Laboratorio personal para estudiar y practicar ciberseguridad. Todo corre en el navegador. Cada herramienta
        se valida contra fuentes primarias y tiene tests con vectores de referencia.
      </p>
      <p className="mt-3 font-mono text-xs text-muted">
        núcleo: {done}/{TOOLS.length} listas · backlog: {BACKLOG.length} candidatas
      </p>

      {TRACKS.map((track) => (
        <section key={track} className="mt-8">
          <h2 className="mb-3 font-mono text-sm uppercase tracking-wider text-muted">{track}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.filter((t) => t.track === track).map((t) => (
              <Link key={t.id} to={`/tool/${t.id}`} className="card group p-4 transition-colors hover:border-acento/50">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <t.icon size={18} className="text-acento" />
                  <StatusBadge status={t.status} />
                </div>
                <h3 className="font-mono text-sm font-bold text-white group-hover:text-acento">{t.name}</h3>
                <p className="mt-1 text-xs text-muted">{t.desc}</p>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
