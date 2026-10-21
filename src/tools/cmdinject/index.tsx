import { ToolStub } from '@/components/ToolStub'

export default function CommandInjection() {
  return (
    <ToolStub
      id="cmdinject"
      features={[
        'Selector de SO y técnica (visible, ciega por tiempo, OOB por DNS)',
        'Tabla de separadores con su semántica, y payloads generados por separador',
        'Evasión de filtros: ${IFS}, comillas partidas, variables vacías',
        'Detección: qué deja en los logs cada técnica y cómo se previene (no pasar entrada a la shell, usar APIs con argumentos)',
      ]}
    />
  )
}
