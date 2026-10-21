import { Suspense, lazy, type ComponentType, type LazyExoticComponent } from 'react'
import { Routes, Route, useParams, Link } from 'react-router-dom'
import { Layout } from './components/Layout'
import { References } from './components/ui'
import { ToolGuide } from './components/ToolGuide'
import { findTool, TOOLS } from './lib/registry'
import Home from './pages/Home'
import Backlog from './pages/Backlog'
import Docs from './pages/Docs'

/* Cada herramienta vive en src/tools/<id>/index.tsx y se carga bajo demanda.
   import.meta.glob evita mantener un mapa id → fichero a mano. */
const modules = import.meta.glob<{ default: ComponentType }>('./tools/*/index.tsx')

const toolPages: Record<string, LazyExoticComponent<ComponentType>> = {}
for (const t of TOOLS) {
  const loader = modules[`./tools/${t.id}/index.tsx`]
  if (loader) toolPages[t.id] = lazy(loader)
  else if (import.meta.env.DEV) console.warn(`[registry] falta src/tools/${t.id}/index.tsx`)
}

function ToolRoute() {
  const { id = '' } = useParams()
  const tool = findTool(id)
  const Page = toolPages[id]
  if (!tool || !Page) return <NotFound />
  return (
    <Suspense fallback={<p className="font-mono text-sm text-muted">cargando…</p>}>
      <Page />
      <ToolGuide toolId={tool.id} />
      <References refs={tool.refs} />
    </Suspense>
  )
}

function NotFound() {
  return (
    <div className="font-mono">
      <p className="text-bad">404 — no existe esa herramienta.</p>
      <Link to="/" className="text-info hover:underline">volver al inicio</Link>
    </div>
  )
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tool/:id" element={<ToolRoute />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/docs/:id" element={<Docs />} />
        <Route path="/backlog" element={<Backlog />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  )
}
