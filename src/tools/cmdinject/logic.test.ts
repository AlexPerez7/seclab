import { describe, expect, it } from 'vitest'
import { generatePayloads, SEPARATORS } from './logic'

describe('generatePayloads', () => {
  it.skip('un payload por separador, y cada uno empieza por él', () => {
    const ps = generatePayloads('unix', 'visible')
    expect(ps).toHaveLength(SEPARATORS.unix.length)
    for (const p of ps) expect(p.payload.startsWith(p.separator)).toBe(true)
  })

  it.skip('ciega por tiempo usa el retardo pedido', () => {
    expect(generatePayloads('unix', 'time', { delaySeconds: 5 })[0].payload).toContain('sleep 5')
    expect(generatePayloads('windows', 'time', { delaySeconds: 5 })[0].payload).toContain('ping -n 6 127.0.0.1')
  })

  it.skip('OOB incluye el dominio propio', () => {
    const ps = generatePayloads('unix', 'oob-dns', { domain: 'abc.oast.example' })
    expect(ps.every((p) => p.payload.includes('abc.oast.example'))).toBe(true)
  })

  it.skip('OOB sin dominio es un error', () => {
    expect(() => generatePayloads('unix', 'oob-dns')).toThrow()
  })
})
