import { useState, type ReactNode } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { Menu, X, ListTodo, BookOpen } from 'lucide-react'
import clsx from 'clsx'
import { TOOLS, TRACKS } from '@/lib/registry'
import { StatusBadge } from './ui'

function Sidebar({ onNavigate }: { onNavigate: () => void }) {
  return (
    <nav className="space-y-5 p-4">
      <Link to="/" onClick={onNavigate} className="block font-mono text-lg font-bold text-acento">
        &gt;_ SecLab
      </Link>
      {TRACKS.map((track) => (
        <div key={track}>
          <h3 className="mb-1.5 font-mono text-[11px] uppercase tracking-wider text-muted">{track}</h3>
          <ul className="space-y-0.5">
            {TOOLS.filter((t) => t.track === track).map((t) => (
              <li key={t.id}>
                <NavLink
                  to={`/tool/${t.id}`}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                      isActive ? 'bg-acento/10 text-acento' : 'text-slate-300 hover:bg-white/5',
                    )
                  }
                >
                  <t.icon size={15} className="shrink-0" />
                  <span className="min-w-0 flex-1 truncate">{t.name}</span>
                  {t.status !== 'pendiente' && <StatusBadge status={t.status} />}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div className="space-y-0.5 border-t border-edge pt-4">
        {[
          { to: '/docs', icon: BookOpen, label: 'Documentación' },
          { to: '/backlog', icon: ListTodo, label: 'Backlog' },
        ].map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              clsx('flex items-center gap-2 rounded-md px-2 py-1.5 text-sm', isActive ? 'bg-acento/10 text-acento' : 'text-muted hover:bg-white/5')
            }
          >
            <Icon size={15} /> {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export function Layout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="min-h-screen lg:flex">
      <div className="flex items-center justify-between border-b border-edge px-4 py-3 lg:hidden">
        <Link to="/" className="font-mono font-bold text-acento">&gt;_ SecLab</Link>
        <button type="button" className="btn" onClick={() => setOpen((v) => !v)} aria-label="menú">
          {open ? <X size={16} /> : <Menu size={16} />}
        </button>
      </div>
      <aside
        className={clsx(
          'border-edge bg-panel lg:sticky lg:top-0 lg:block lg:h-screen lg:w-64 lg:shrink-0 lg:overflow-y-auto lg:border-r',
          open ? 'block border-b' : 'hidden',
        )}
      >
        <Sidebar onNavigate={() => setOpen(false)} />
      </aside>
      <main className="mx-auto w-full max-w-5xl min-w-0 px-4 py-6 lg:px-8">{children}</main>
    </div>
  )
}
