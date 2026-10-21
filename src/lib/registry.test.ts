import { describe, expect, it } from 'vitest'
import { TOOLS } from './registry'
import { getDoc } from './docs'

describe('registry', () => {
  it('ids únicos', () => {
    const ids = TOOLS.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  // Definition of done: una herramienta "listo" tiene documentación propia con las dos secciones fijas.
  it.each(TOOLS.filter((t) => t.status === 'listo').map((t) => t.id))('%s tiene docs.md con "Cómo se usa" y "Casos de uso"', (id) => {
    const doc = getDoc(id)
    expect(doc, `falta src/tools/${id}/docs.md`).toBeDefined()
    expect(doc!.usage?.body, 'falta la sección "## Cómo se usa"').toBeTruthy()
    expect(doc!.useCases?.body, 'falta la sección "## Casos de uso"').toBeTruthy()
  })
})
