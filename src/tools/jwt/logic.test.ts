import { createHmac } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { auditJwt, crackSecret, decodeJwt, forgeNone, signHs, signHS256, verifyHs, verifyHS256 } from './logic'

// Token de ejemplo de jwt.io, firmado con el secret "your-256-bit-secret".
const SAMPLE =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
const SAMPLE_PAYLOAD = { sub: '1234567890', name: 'John Doe', iat: 1516239022 }

const levels = (findings: { level: string; message: string }[], re: RegExp) => findings.filter((f) => re.test(f.message)).map((f) => f.level)

describe('decodeJwt', () => {
  it('decodifica header y payload', () => {
    const d = decodeJwt(SAMPLE)
    expect(d.header).toEqual({ alg: 'HS256', typ: 'JWT' })
    expect(d.payload).toEqual(SAMPLE_PAYLOAD)
    expect(d.signingInput).toBe(SAMPLE.split('.').slice(0, 2).join('.'))
  })
  it('acepta el prefijo "Bearer " y espacios', () => {
    expect(decodeJwt(`  Bearer ${SAMPLE}\n`).payload).toEqual(SAMPLE_PAYLOAD)
  })
  it('rechaza tokens mal formados con un mensaje útil', () => {
    expect(() => decodeJwt('a.b')).toThrow(/3 partes/)
    expect(() => decodeJwt('a.b.c.d.e')).toThrow(/JWE/)
    expect(() => decodeJwt('bm9qc29u.e30.x')).toThrow(/header no es JSON/)
  })
})

describe('HS256/384/512', () => {
  it('verifica con el secret correcto y falla con otro', async () => {
    expect(await verifyHS256(SAMPLE, 'your-256-bit-secret')).toBe(true)
    expect(await verifyHS256(SAMPLE, 'secret')).toBe(false)
  })

  it('firmar el payload de jwt.io reproduce exactamente su token', async () => {
    expect(await signHS256(SAMPLE_PAYLOAD, 'your-256-bit-secret')).toBe(SAMPLE)
  })

  it.each(['HS256', 'HS384', 'HS512'] as const)('%s coincide con HMAC de OpenSSL e ida y vuelta', async (alg) => {
    const t = await signHs(alg, { sub: 'alex' }, 'k3y')
    const [h, p, s] = t.split('.')
    const node = createHmac(`sha${alg.slice(2)}`, 'k3y').update(`${h}.${p}`).digest('base64url')
    expect(s).toBe(node)
    expect(await verifyHs(t, 'k3y')).toBe(true)
  })

  it('una firma manipulada no verifica', async () => {
    const tampered = SAMPLE.slice(0, -2) + (SAMPLE.endsWith('5c') ? 'AA' : '5c')
    expect(await verifyHS256(tampered, 'your-256-bit-secret')).toBe(false)
  })

  it('verificar un token sin HS* es un error', async () => {
    await expect(verifyHs(forgeNone(SAMPLE), 'x')).rejects.toThrow(/none/)
  })
})

describe('alg=none', () => {
  it('firma vacía, alg none y payload intacto', () => {
    const forged = forgeNone(SAMPLE)
    expect(forged.endsWith('.')).toBe(true)
    const d = decodeJwt(forged)
    expect(d.header).toEqual({ alg: 'none', typ: 'JWT' })
    expect(d.payload).toEqual(SAMPLE_PAYLOAD)
  })
  it('con payload modificado y variante de mayúsculas', () => {
    const d = decodeJwt(forgeNone(SAMPLE, { sub: '1', role: 'admin' }, 'NONE'))
    expect(d.header.alg).toBe('NONE')
    expect(d.payload).toEqual({ sub: '1', role: 'admin' })
  })
})

describe('auditJwt', () => {
  const now = new Date('2026-10-21T12:00:00Z')
  const nowSec = Math.floor(now.getTime() / 1000)

  it('token de jwt.io: sin exp, HS256 y sin iss/aud', () => {
    const f = auditJwt(decodeJwt(SAMPLE), now)
    expect(levels(f, /exp/)).toEqual(['alto'])
    expect(levels(f, /16500/)).toEqual(['info'])
    expect(levels(f, /iss o aud/)).toEqual(['info'])
  })

  it('alg none es crítico', () => {
    expect(auditJwt(decodeJwt(forgeNone(SAMPLE)), now)[0].level).toBe('crítico')
  })

  it('expirado, vida larga, jku, kid y datos sensibles', async () => {
    const t = await signHs('HS256', { iat: nowSec - 10 * 86400, exp: nowSec - 3600, password: 'x', iss: 'a', aud: 'b' }, 'k', { kid: '1', jku: 'https://evil.example/jwks' })
    const f = auditJwt(decodeJwt(t), now)
    expect(levels(f, /Expirado/)).toEqual(['medio'])
    expect(levels(f, /Vida larga/)).toEqual(['medio'])
    expect(levels(f, /jku/)).toEqual(['alto'])
    expect(levels(f, /kid/)).toEqual(['medio'])
    expect(levels(f, /"password"/)).toEqual(['alto'])
    expect(levels(f, /iss o aud/)).toEqual([])
  })
})

describe('crackSecret', () => {
  it('encuentra el secreto de jwt.io en la lista de comunes', async () => {
    let tried = 0
    expect(await crackSecret(SAMPLE, ['a', 'b', 'your-256-bit-secret', 'c'], (n) => (tried = n))).toBe('your-256-bit-secret')
    expect(tried).toBe(3)
  })
  it('devuelve null si no está', async () => {
    expect(await crackSecret(SAMPLE, ['x', 'y'])).toBeNull()
  })
})
