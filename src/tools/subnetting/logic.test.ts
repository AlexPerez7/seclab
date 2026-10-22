import { describe, expect, it } from 'vitest'
import {
  addressType, checkExercise, intToIp, ipToInt, maskToPrefix, parseCidr, prefixForHosts, randomExercise, toBinary, vlsm,
} from './logic'

describe('conversión IP ↔ entero', () => {
  it('ida y vuelta, incluyendo el bit alto', () => {
    expect(ipToInt('192.168.1.10')).toBe(3232235786)
    expect(intToIp(4294967295)).toBe('255.255.255.255')
    expect(intToIp(ipToInt('10.20.30.40'))).toBe('10.20.30.40')
  })
  it('rechaza octetos inválidos y ceros a la izquierda', () => {
    expect(() => ipToInt('300.1.1.1')).toThrow(/fuera de rango/)
    expect(() => ipToInt('10.0.0')).toThrow(/4 octetos/)
    expect(() => ipToInt('010.0.0.1')).toThrow(/octal/)
  })
  it('binario por octetos', () => {
    expect(toBinary(ipToInt('192.168.1.10'))).toBe('11000000.10101000.00000001.00001010')
  })
})

describe('máscaras', () => {
  it('máscara ↔ prefijo', () => {
    expect(maskToPrefix('255.255.255.0')).toBe(24)
    expect(maskToPrefix('255.255.240.0')).toBe(20)
    expect(maskToPrefix('0.0.0.0')).toBe(0)
    expect(maskToPrefix('255.255.255.255')).toBe(32)
  })
  it('rechaza máscaras no contiguas', () => {
    expect(() => maskToPrefix('255.0.255.0')).toThrow(/contiguos/)
  })
})

describe('parseCidr', () => {
  it('/24 desde una IP de host', () => {
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
      ipClass: 'C',
    })
  })

  it('prefijo no alineado a octeto: /20', () => {
    expect(parseCidr('172.16.37.200/20')).toMatchObject({
      network: '172.16.32.0', broadcast: '172.16.47.255', usableHosts: 4094, wildcard: '0.0.15.255',
    })
  })

  it('acepta la máscara en decimal punteado', () => {
    expect(parseCidr('10.1.2.3 255.255.0.0').cidr).toBe('10.1.0.0/16')
    expect(parseCidr('10.1.2.3/255.255.255.128').cidr).toBe('10.1.2.0/25')
  })

  it('casos borde /0, /30, /31 y /32', () => {
    expect(parseCidr('1.2.3.4/0')).toMatchObject({ network: '0.0.0.0', broadcast: '255.255.255.255', totalAddresses: 2 ** 32 })
    expect(parseCidr('10.0.0.0/30').usableHosts).toBe(2)
    expect(parseCidr('10.0.0.0/31')).toMatchObject({ usableHosts: 2, firstHost: '10.0.0.0', lastHost: '10.0.0.1' }) // RFC 3021
    expect(parseCidr('8.8.8.8/32')).toMatchObject({ usableHosts: 1, isPrivate: false, type: 'Pública' })
  })

  it('rechaza entradas inválidas', () => {
    expect(() => parseCidr('300.1.1.1/24')).toThrow()
    expect(() => parseCidr('10.0.0.0/33')).toThrow(/0 a 32/)
    expect(() => parseCidr('10.0.0.0')).toThrow(/Formato/)
  })
})

describe('tipos de dirección', () => {
  it.each([
    ['172.31.255.1', 'Privada (RFC 1918)'],
    ['172.32.0.1', 'Pública'],
    ['100.100.1.1', 'CGNAT compartida (RFC 6598)'],
    ['169.254.10.20', 'Link-local / APIPA (RFC 3927)'],
    ['127.0.0.1', 'Loopback'],
    ['224.0.0.251', 'Multicast'],
    ['203.0.113.5', 'Documentación TEST-NET-3 (RFC 5737)'],
    ['255.255.255.255', 'Broadcast limitado'],
  ])('%s → %s', (ip, type) => {
    expect(addressType(ipToInt(ip))).toBe(type)
  })
})

describe('vlsm', () => {
  it('prefijo mínimo por cantidad de hosts', () => {
    expect([1, 2, 3, 6, 14, 30, 62, 126, 254, 255].map(prefixForHosts)).toEqual([30, 30, 29, 29, 28, 27, 26, 25, 24, 23])
  })

  it('asigna de mayor a menor dentro de la red base', () => {
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
    expect(res.map((r) => r.wasted)).toEqual([26, 12, 4, 0])
  })

  it('falla si no cabe', () => {
    expect(() => vlsm('192.168.10.0/26', [{ name: 'X', hosts: 100 }])).toThrow(/no cabe/)
    expect(() => vlsm('192.168.10.0/24', [{ name: 'A', hosts: 126 }, { name: 'B', hosts: 126 }, { name: 'C', hosts: 2 }])).toThrow(/"C"/)
  })
})

describe('modo práctica', () => {
  it('genera ejercicios privados y válidos', () => {
    let seed = 1
    const rng = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
    for (let i = 0; i < 200; i++) {
      const s = parseCidr(randomExercise(rng))
      expect(s.isPrivate).toBe(true)
      expect(s.prefix).toBeGreaterThanOrEqual(16)
      expect(s.prefix).toBeLessThanOrEqual(30)
    }
  })

  it('corrige campo a campo', () => {
    expect(
      checkExercise('192.168.1.10/24', {
        network: '192.168.1.0', broadcast: ' 192.168.1.255 ', firstHost: '192.168.1.1', lastHost: '192.168.1.253', usableHosts: '254',
      }),
    ).toEqual({ network: true, broadcast: true, firstHost: true, lastHost: false, usableHosts: true })
  })
})
