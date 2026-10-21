import { findTool } from '@/lib/registry'
import { ToolHeader, TodoNote } from './ui'

/** Página provisional de una herramienta del esqueleto: muestra qué hará y dónde está su plan. */
export function ToolStub({ id, features }: { id: string; features: string[] }) {
  const tool = findTool(id)
  if (!tool) return null
  return (
    <div>
      <ToolHeader icon={tool.icon} title={tool.name} desc={tool.desc} />
      <TodoNote>
        <p className="mb-2 font-mono text-xs text-warn">pendiente de implementar</p>
        <ul className="list-disc space-y-1 pl-5">
          {features.map((f) => <li key={f}>{f}</li>)}
        </ul>
        <p className="mt-3 text-xs text-muted">
          Lógica en <code className="text-slate-300">src/tools/{id}/logic.ts</code>, tests en{' '}
          <code className="text-slate-300">logic.test.ts</code> y apuntes en <code className="text-slate-300">NOTES.md</code>.
          {tool.origin && <> Referencia: <code className="text-slate-300">hacknexus/src/tools/{tool.origin}.tsx</code>.</>}
        </p>
      </TodoNote>
    </div>
  )
}
