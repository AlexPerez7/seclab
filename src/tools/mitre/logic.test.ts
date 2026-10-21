import { describe, expect, it } from 'vitest'
import { searchTechniques, TACTICS, TECHNIQUES, toNavigatorLayer } from './logic'

describe('datos', () => {
  it('14 tácticas de Enterprise', () => {
    expect(TACTICS).toHaveLength(14)
  })
  it('cada técnica apunta a tácticas existentes', () => {
    const valid = new Set(TACTICS.map((t) => t.shortName))
    for (const t of TECHNIQUES) for (const tac of t.tactics) expect(valid.has(tac), `${t.id} → ${tac}`).toBe(true)
  })
})

describe('searchTechniques', () => {
  it.skip('por id y por nombre', () => {
    expect(searchTechniques('T1003').map((t) => t.id)).toEqual(['T1003'])
    expect(searchTechniques('kerberoast').map((t) => t.id)).toEqual(['T1558.003'])
  })
  it.skip('filtrando por táctica', () => {
    const r = searchTechniques('', 'credential-access')
    expect(r.map((t) => t.id)).toContain('T1110')
    expect(r.every((t) => t.tactics.includes('credential-access'))).toBe(true)
  })
})

describe('toNavigatorLayer', () => {
  it.skip('incluye las técnicas marcadas', () => {
    const layer = toNavigatorLayer(['T1003'], 'test') as { name: string; domain: string; techniques: { techniqueID: string }[] }
    expect(layer.name).toBe('test')
    expect(layer.domain).toBe('enterprise-attack')
    expect(layer.techniques.map((t) => t.techniqueID)).toEqual(['T1003'])
  })
})
