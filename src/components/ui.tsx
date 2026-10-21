import { useState, type ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Check, Copy, ExternalLink, Construction } from 'lucide-react'
import clsx from 'clsx'
import type { Reference, ToolStatus } from '@/lib/registry'

export function ToolHeader({ icon: Icon, title, desc }: { icon: LucideIcon; title: string; desc: string }) {
  return (
    <header className="mb-6 flex items-start gap-3">
      <div className="rounded-lg border border-edge bg-panel p-2.5 text-acento">
        <Icon size={22} />
      </div>
      <div className="min-w-0">
        <h1 className="font-mono text-xl font-bold text-white">{title}</h1>
        <p className="mt-1 text-sm text-muted">{desc}</p>
      </div>
    </header>
  )
}

export function Card({ title, children, className }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={clsx('card mb-4 p-5', className)}>
      {title && <h2 className="mb-3 font-mono text-sm font-bold text-white">{title}</h2>}
      {children}
    </section>
  )
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-muted">{label}</span>
      {children}
    </label>
  )
}

export function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(text)
    setDone(true)
    setTimeout(() => setDone(false), 1200)
  }
  return (
    <button type="button" onClick={copy} className="btn" disabled={!text}>
      {done ? <Check size={13} /> : <Copy size={13} />}
      {done ? 'copiado' : 'copiar'}
    </button>
  )
}

const STATUS_STYLE: Record<ToolStatus, string> = {
  pendiente: 'border-edge text-muted',
  'en-progreso': 'border-warn/40 text-warn',
  listo: 'border-acento/40 text-acento',
}

export function StatusBadge({ status }: { status: ToolStatus }) {
  return (
    <span className={clsx('rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase', STATUS_STYLE[status])}>
      {status}
    </span>
  )
}

/** Aviso de "por implementar" para las herramientas del esqueleto. */
export function TodoNote({ children }: { children: ReactNode }) {
  return (
    <div className="card mb-4 flex gap-3 border-warn/30 bg-warn/5 p-4 text-sm text-slate-300">
      <Construction size={18} className="mt-0.5 shrink-0 text-warn" />
      <div>{children}</div>
    </div>
  )
}

export function References({ refs }: { refs: Reference[] }) {
  if (!refs.length) return null
  return (
    <Card title="Fuentes primarias">
      <ul className="space-y-1.5 text-sm">
        {refs.map((r) => (
          <li key={r.url}>
            <a href={r.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-info hover:underline">
              {r.label} <ExternalLink size={12} />
            </a>
          </li>
        ))}
      </ul>
    </Card>
  )
}
