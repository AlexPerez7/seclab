import { describe, expect, it } from 'vitest'
import { parseDoc, slugify } from './docs'

describe('slugify', () => {
  it('quita acentos y símbolos', () => {
    expect(slugify('Cómo se usa')).toBe('como-se-usa')
    expect(slugify('HMAC: ¿por qué no basta SHA256(k + m)?')).toBe('hmac-por-que-no-basta-sha256k-m')
  })
})

describe('parseDoc', () => {
  const md = [
    '# Hash Suite',
    '',
    'Intro.',
    '',
    '## Cómo se usa',
    '1. Paso',
    '',
    '## Casos de uso',
    '- Caso',
    '',
    '## Fondo',
    '```md',
    '## esto no es un título',
    '```',
  ].join('\n')

  it('separa título, intro y secciones', () => {
    const d = parseDoc(md)
    expect(d.title).toBe('Hash Suite')
    expect(d.intro).toBe('Intro.')
    expect(d.sections.map((s) => s.slug)).toEqual(['como-se-usa', 'casos-de-uso', 'fondo'])
    expect(d.usage?.body).toBe('1. Paso')
    expect(d.useCases?.body).toBe('- Caso')
  })

  it('ignora los ## dentro de bloques de código', () => {
    expect(parseDoc(md).sections.at(-1)?.body).toContain('## esto no es un título')
  })

  it('las secciones fijas son opcionales', () => {
    const d = parseDoc('# X\n\n## Otra\ntexto')
    expect(d.usage).toBeUndefined()
    expect(d.sections).toHaveLength(1)
  })
})
