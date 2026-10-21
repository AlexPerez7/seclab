import { describe, expect, it } from 'vitest'
import { PORTS, searchPorts } from './logic'

describe('datos', () => {
  it('no hay puertos duplicados', () => {
    const keys = PORTS.map((p) => `${p.port}/${p.proto}`)
    expect(new Set(keys).size).toBe(keys.length)
  })
})

describe('searchPorts', () => {
  it.skip('por número exacto', () => {
    expect(searchPorts('445').map((p) => p.service)).toEqual(['SMB'])
  })
  it.skip('por nombre, sin distinguir mayúsculas', () => {
    expect(searchPorts('kerberos').map((p) => p.port)).toContain(88)
  })
  it.skip('filtrando por grupo', () => {
    expect(searchPorts('', 'ad').every((p) => p.group === 'ad')).toBe(true)
  })
})
