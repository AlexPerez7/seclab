import { useMemo, useState } from 'react'
import clsx from 'clsx'
import { BACKLOG, type BacklogFlag } from '@/data/backlog'
import { ToolHeader } from '@/components/ui'
import { ListTodo } from 'lucide-react'

const FLAG_LABEL: Record<BacklogFlag, string> = {
  candidata: '⭐ siguiente candidata',
  red: '🌐 usa red/API externa',
  sensible: '⚠️ ofensiva sensible',
}

export default function Backlog() {
  const [q, setQ] = useState('')
  const [flag, setFlag] = useState<BacklogFlag | null>(null)

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return BACKLOG.filter(
      (b) =>
        (!flag || b.flags.includes(flag)) &&
        (!needle || `${b.name} ${b.desc} ${b.id}`.toLowerCase().includes(needle)),
    )
  }, [q, flag])

  const categories = [...new Set(filtered.map((b) => b.category))]

  return (
    <div>
      <ToolHeader
        icon={ListTodo}
        title="Backlog"
        desc="Herramientas de HackNexus que no entran en el núcleo inicial. Detalle y criterios en docs/BACKLOG.md."
      />
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <input className="input max-w-xs" placeholder="buscar…" value={q} onChange={(e) => setQ(e.target.value)} />
        {(Object.keys(FLAG_LABEL) as BacklogFlag[]).map((f) => (
          <button key={f} type="button" className={clsx('btn', flag === f && 'btn-active')} onClick={() => setFlag(flag === f ? null : f)}>
            {FLAG_LABEL[f]}
          </button>
        ))}
        <span className="font-mono text-xs text-muted">{filtered.length} / {BACKLOG.length}</span>
      </div>
      {categories.map((cat) => (
        <section key={cat} className="mb-6">
          <h2 className="mb-2 font-mono text-sm uppercase tracking-wider text-muted">{cat}</h2>
          <ul className="card divide-y divide-edge">
            {filtered.filter((b) => b.category === cat).map((b) => (
              <li key={b.id} className="px-4 py-2.5">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-mono text-sm text-white">{b.name}</span>
                  <span className="font-mono text-[11px] text-muted">{b.id}</span>
                  {b.flags.map((f) => (
                    <span key={f} className="text-[11px]" title={FLAG_LABEL[f]}>{FLAG_LABEL[f].split(' ')[0]}</span>
                  ))}
                </div>
                <p className="mt-0.5 text-xs text-muted">{b.desc}</p>
                {b.note && <p className="mt-0.5 text-xs text-warn">{b.note}</p>}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
