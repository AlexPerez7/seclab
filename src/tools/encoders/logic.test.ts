import { describe, expect, it } from 'vitest'
import { decode, encode, type Codec } from './logic'

describe('base64 — vectores de RFC 4648 §10', () => {
  const vectors: [string, string][] = [
    ['', ''],
    ['f', 'Zg=='],
    ['fo', 'Zm8='],
    ['foo', 'Zm9v'],
    ['foob', 'Zm9vYg=='],
    ['fooba', 'Zm9vYmE='],
    ['foobar', 'Zm9vYmFy'],
  ]
  it.each(vectors)('"%s" → "%s"', (plain, b64) => {
    expect(encode('base64', plain)).toBe(b64)
    expect(decode('base64', b64)).toBe(plain)
  })

  it('codifica UTF-8, no Latin-1', () => {
    expect(encode('base64', 'ñ')).toBe('w7E=')
  })

  it('rechaza base64 inválido', () => {
    expect(() => decode('base64', 'no es base64!')).toThrow()
  })
})

describe('base64url', () => {
  it('usa - y _ y quita el padding', () => {
    // ">??" = 0x3e 0x3f 0x3f → "Pj8/" en base64 estándar
    expect(encode('base64', '>??')).toBe('Pj8/')
    expect(encode('base64url', '>??')).toBe('Pj8_')
    expect(decode('base64url', 'Zm8')).toBe('fo')
  })
})

describe('hex — RFC 4648 §10 (base16)', () => {
  it('foobar ↔ 666f6f626172', () => {
    expect(encode('hex', 'foobar')).toBe('666f6f626172')
    expect(decode('hex', '66 6F 6F 62 61 72')).toBe('foobar')
  })
  it('rechaza longitud impar', () => {
    expect(() => decode('hex', 'abc')).toThrow()
  })
})

describe('url y binario', () => {
  it('url codifica espacios y &', () => {
    expect(encode('url', 'a b&c')).toBe('a%20b%26c')
    expect(decode('url', 'a+b%26c')).toBe('a b&c')
  })
  it('binario por byte', () => {
    expect(encode('binary', 'A')).toBe('01000001')
    expect(decode('binary', '01001000 01101001')).toBe('Hi')
  })
})

describe('ida y vuelta', () => {
  const codecs: Codec[] = ['base64', 'base64url', 'hex', 'url', 'binary']
  it.each(codecs)('%s conserva texto con acentos y emoji', (c) => {
    const s = 'Contraseña: pájaro 🐦 & <script>'
    expect(decode(c, encode(c, s))).toBe(s)
  })
})
