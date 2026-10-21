import { describe, expect, it } from 'vitest'
import { intToIp, ipToInt, parseCidr, vlsm } from './logic'

describe('conversión IP ↔ entero', () => {
  it.skip('ida y vuelta, incluyendo el bit alto', () => {
    expect(ipToInt('192.168.1.10')).toBe(3232235786)
    expect(intToIp(4294967295)).toBe('255.255.255.255')
    expect(intToIp(ipToInt('10.20.30.40'))).toBe('10.20.30.40')
  })
})

describe('parseCidr', () => {
  it.skip('/24 desde una IP de host', () => {
    expect(parseCidr('192.168.1.10/24')).toMatchObject({
      cidr: '192.168.1.0/24',
      network: '192.168.1.0',
      broadcast: '192.168.1.255',
      firstHost: '192.168.1.1',
      lastHost: '192.168.1.254',
      mask: '255.255.255.0',
      wildcard: '0.0.0.255',
      usableHosts: 254,
      isPrivate: true,
    })
  })

  it.skip('casos borde /30, /31 y /32', () => {
    expect(parseCidr('10.0.0.0/30').usableHosts).toBe(2)
    expect(parseCidr('10.0.0.0/31').usableHosts).toBe(2) // RFC 3021
    expect(parseCidr('8.8.8.8/32')).toMatchObject({ usableHosts: 1, isPrivate: false })
  })

  it.skip('rechaza entradas inválidas', () => {
    expect(() => parseCidr('300.1.1.1/24')).toThrow()
    expect(() => parseCidr('10.0.0.0/33')).toThrow()
  })
})

describe('vlsm', () => {
  it.skip('asigna de mayor a menor dentro de la red base', () => {
    const res = vlsm('192.168.10.0/24', [
      { name: 'D', hosts: 2 },
      { name: 'A', hosts: 100 },
      { name: 'C', hosts: 10 },
      { name: 'B', hosts: 50 },
    ])
    expect(res.map((r) => `${r.name} ${r.subnet.cidr}`)).toEqual([
      'A 192.168.10.0/25',
      'B 192.168.10.128/26',
      'C 192.168.10.192/28',
      'D 192.168.10.208/30',
    ])
  })

  it.skip('falla si no cabe', () => {
    expect(() => vlsm('192.168.10.0/26', [{ name: 'X', hosts: 100 }])).toThrow()
  })
})
