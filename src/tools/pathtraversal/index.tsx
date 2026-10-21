import { ToolStub } from '@/components/ToolStub'

export default function PathTraversal() {
  return (
    <ToolStub
      id="pathtraversal"
      features={[
        'Selector de SO, profundidad, codificación y objetivo, con la lista de payloads lista para copiar',
        'Ficha de cada objetivo: qué contiene y por qué interesa',
        'Variantes de evasión: absolutas, ....// anidado, prefijo de ruta válida, null byte en sistemas viejos',
        'Sección de defensa: canonicalizar y luego validar contra una allowlist',
      ]}
    />
  )
}
