import { createHash, createHmac } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { bitDiff, hashAll, hashBytes, hashesMatch, hashText, hmac, md5 } from './logic'

const enc = new TextEncoder()

describe('md5 — suite de prueba de RFC 1321 (apéndice A.5)', () => {
  const vectors: [string, string][] = [
    ['', 'd41d8cd98f00b204e9800998ecf8427e'],
    ['a', '0cc175b9c0f1b6a831c399e269772661'],
    ['abc', '900150983cd24fb0d6963f7d28e17f72'],
    ['message digest', 'f96b697d7cb7938d525a2f31aaf161d0'],
    ['abcdefghijklmnopqrstuvwxyz', 'c3fcd3d76192e4007dfb496cca67e13b'],
    ['ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 'd174ab98d277d9f5a5611c2c9f419d9f'],
    ['1234567890'.repeat(8), '57edf4a22be3c955ac49da2e2107b67a'],
  ]
  it.each(vectors)('MD5("%s")', (input, expected) => {
    expect(md5(enc.encode(input))).toBe(expected)
  })

  it('coincide con OpenSSL en todas las longitudes de 0 a 200 bytes (bordes del padding)', () => {
    for (let n = 0; n <= 200; n++) {
      const data = Uint8Array.from({ length: n }, (_, i) => (i * 31 + n) & 0xff)
      expect(md5(data), `n=${n}`).toBe(createHash('md5').update(data).digest('hex'))
    }
  })
})

describe('hashText — vectores de FIPS 180-4', () => {
  it('"abc"', async () => {
    expect(await hashText('MD5', 'abc')).toBe('900150983cd24fb0d6963f7d28e17f72')
    expect(await hashText('SHA-1', 'abc')).toBe('a9993e364706816aba3e25717850c26c9cd0d89d')
    expect(await hashText('SHA-256', 'abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')
    expect(await hashText('SHA-512', 'abc')).toBe(
      'ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f',
    )
  })

  it('cadena vacía', async () => {
    expect(await hashText('MD5', '')).toBe('d41d8cd98f00b204e9800998ecf8427e')
    expect(await hashText('SHA-256', '')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')
  })

  it('texto UTF-8 con acentos y emoji coincide con OpenSSL', async () => {
    const s = 'contraseña 🔐'
    expect(await hashText('SHA-384', s)).toBe(createHash('sha384').update(s, 'utf8').digest('hex'))
  })
})

describe('hashAll', () => {
  it('devuelve todos los algoritmos con la longitud correcta', async () => {
    const all = await hashAll(enc.encode('SecLab'))
    expect(Object.fromEntries(Object.entries(all).map(([k, v]) => [k, v.length]))).toEqual({
      MD5: 32, 'SHA-1': 40, 'SHA-256': 64, 'SHA-384': 96, 'SHA-512': 128,
    })
    expect(all['SHA-1']).toBe(await hashBytes('SHA-1', enc.encode('SecLab')))
  })
})

describe('hmac', () => {
  it('RFC 4231 test case 2', async () => {
    expect(await hmac('SHA-256', 'Jefe', 'what do ya want for nothing?')).toBe(
      '5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843',
    )
  })

  it('coincide con OpenSSL para todos los algoritmos', async () => {
    for (const [alg, node] of [['SHA-1', 'sha1'], ['SHA-384', 'sha384'], ['SHA-512', 'sha512']] as const) {
      expect(await hmac(alg, 'clave', 'mensaje')).toBe(createHmac(node, 'clave').update('mensaje').digest('hex'))
    }
  })
})

describe('comparación y avalancha', () => {
  it('hashesMatch ignora mayúsculas, espacios y 0x', () => {
    expect(hashesMatch(' 0xABC123 ', 'abc123')).toBe(true)
    expect(hashesMatch('', '')).toBe(false)
    expect(hashesMatch('abc', 'abd')).toBe(false)
  })

  it('bitDiff cuenta bits distintos', () => {
    expect(bitDiff('00', 'ff')).toEqual({ diff: 8, total: 8 })
    expect(bitDiff('a0', 'a1')).toEqual({ diff: 1, total: 8 })
    expect(() => bitDiff('00', '000')).toThrow()
  })

  it('un carácter distinto cambia cerca de la mitad de los bits de SHA-256', async () => {
    const { diff, total } = bitDiff(await hashText('SHA-256', 'SecLab'), await hashText('SHA-256', 'Seclab'))
    expect(diff / total).toBeGreaterThan(0.35)
    expect(diff / total).toBeLessThan(0.65)
  })
})
