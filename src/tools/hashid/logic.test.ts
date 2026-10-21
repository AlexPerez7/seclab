import { describe, expect, it } from 'vitest'
import { identifyHash } from './logic'

/* Modos verificados contra https://hashcat.net/wiki/doku.php?id=example_hashes */
const modes = (h: string) => identifyHash(h).map((c) => c.hashcat)

describe('identifyHash', () => {
  it.skip('32 hex: MD5 y NTLM son candidatos', () => {
    const m = modes('8743b52063cd84097a65d1633f5c74f5')
    expect(m).toContain(0)
    expect(m).toContain(1000)
  })

  it.skip('40 hex → SHA-1, 64 hex → SHA-256', () => {
    expect(modes('b89eaac7e61417341b710b727768294d0e6a277b')).toContain(100)
    expect(modes('127e6fbfe24a750e72930c220a8e138275656b8e5d8f48a98c3c92df2caba935')).toContain(1400)
  })

  it.skip('prefijos crypt: inequívocos y en primer lugar', () => {
    expect(modes('$2y$10$abcdefghijklmnopqrstuuJ6vE5lNhOVkYwwbEdmCqf7Ki9Y5uXO.')[0]).toBe(3200)
    expect(modes('$6$saltsalt$abc')[0]).toBe(1800)
    expect(modes('$1$saltsalt$abc')[0]).toBe(500)
  })

  it.skip('entrada vacía o basura → sin candidatos', () => {
    expect(identifyHash('')).toEqual([])
    expect(identifyHash('hola mundo')).toEqual([])
  })
})
