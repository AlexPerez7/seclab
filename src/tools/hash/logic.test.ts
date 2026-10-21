import { describe, expect, it } from 'vitest'
import { hashText, hmac } from './logic'

/* Tests en .skip hasta implementar: al terminar cada función, quita el .skip. */

describe('hashText', () => {
  it.skip('vectores "abc" (RFC 1321 y FIPS 180-4)', async () => {
    expect(await hashText('MD5', 'abc')).toBe('900150983cd24fb0d6963f7d28e17f72')
    expect(await hashText('SHA-1', 'abc')).toBe('a9993e364706816aba3e25717850c26c9cd0d89d')
    expect(await hashText('SHA-256', 'abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')
  })

  it.skip('cadena vacía', async () => {
    expect(await hashText('MD5', '')).toBe('d41d8cd98f00b204e9800998ecf8427e')
    expect(await hashText('SHA-256', '')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')
  })
})

describe('hmac', () => {
  it.skip('RFC 4231 test case 2', async () => {
    expect(await hmac('SHA-256', 'Jefe', 'what do ya want for nothing?')).toBe(
      '5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843',
    )
  })
})
