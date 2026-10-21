import { describe, expect, it } from 'vitest'
import { auditJwt, decodeJwt, forgeNone, signHS256, verifyHS256 } from './logic'

// Token de ejemplo de jwt.io, firmado con el secret "your-256-bit-secret".
const SAMPLE =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

describe('decodeJwt', () => {
  it.skip('decodifica header y payload', () => {
    const d = decodeJwt(SAMPLE)
    expect(d.header).toEqual({ alg: 'HS256', typ: 'JWT' })
    expect(d.payload).toEqual({ sub: '1234567890', name: 'John Doe', iat: 1516239022 })
  })
  it.skip('rechaza tokens mal formados', () => {
    expect(() => decodeJwt('a.b')).toThrow()
  })
})

describe('HS256', () => {
  it.skip('verifica con el secret correcto y falla con otro', async () => {
    expect(await verifyHS256(SAMPLE, 'your-256-bit-secret')).toBe(true)
    expect(await verifyHS256(SAMPLE, 'secret')).toBe(false)
  })
  it.skip('firmar y verificar es ida y vuelta', async () => {
    const t = await signHS256({ sub: 'alex' }, 'k3y')
    expect(await verifyHS256(t, 'k3y')).toBe(true)
  })
})

describe('ataques y auditoría', () => {
  it.skip('forgeNone deja la firma vacía y alg=none', () => {
    const forged = forgeNone(SAMPLE)
    expect(forged.endsWith('.')).toBe(true)
    expect(decodeJwt(forged).header.alg).toBe('none')
  })
  it.skip('avisa de un token sin exp', () => {
    expect(auditJwt(decodeJwt(SAMPLE)).join(' ')).toMatch(/exp/)
  })
})
