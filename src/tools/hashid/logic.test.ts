import { describe, expect, it } from 'vitest'
import { analyzeHash, analyzeMany, identifyHash, parseCrypt } from './logic'

/* Hex crudos: ejemplos de https://hashcat.net/wiki/doku.php?id=example_hashes
   Formatos crypt: generados con `openssl passwd -1|-apr1|-5|-6 -salt saltsalt password`. */
const modes = (h: string) => identifyHash(h).map((c) => c.hashcat)
const first = (h: string) => identifyHash(h)[0]

const MD5CRYPT = '$1$saltsalt$qjXMvbEw8oaL.CzflDtaK/'
const APR1 = '$apr1$saltsalt$yAAkm4libquA.ZWLHbSBq/'
const SHA256CRYPT = '$5$saltsalt$gOjOtoMpVhru2uyjeJSEc/JaLQWOXMNmlOnj6T4AtC.'
const SHA512CRYPT = '$6$saltsalt$qFmFH.bQmmtXzyBY0s9v7Oicd2z4XSIecDzlB5KiA2/jctKu9YterLp8wwnSq.qc.eoxqOmSuNp2xS0ktL3nh/'
const BCRYPT = '$2a$05$LhayLxezLhK1LhWvKxCyLOj0j1u.Kj0jZ0pEmm134uzrQlFvQJLF6'

describe('hex crudo: ambiguo por longitud', () => {
  it('32 hex: MD5 primero, NTLM también candidato', () => {
    const m = modes('8743b52063cd84097a65d1633f5c74f5')
    expect(m[0]).toBe(0)
    expect(m).toEqual(expect.arrayContaining([0, 1000, 900, 3000]))
  })

  it('40, 64, 96 y 128 hex', () => {
    expect(first('b89eaac7e61417341b710b727768294d0e6a277b').hashcat).toBe(100)
    expect(first('127e6fbfe24a750e72930c220a8e138275656b8e5d8f48a98c3c92df2caba935').hashcat).toBe(1400)
    expect(first('a'.repeat(96)).hashcat).toBe(10800)
    expect(first('a'.repeat(128)).hashcat).toBe(1700)
  })

  it('SHA3-256 es el modo 17400 (no "SHA-512/256")', () => {
    expect(identifyHash('a'.repeat(64)).find((c) => c.hashcat === 17400)?.name).toBe('SHA3-256')
  })

  it('no distingue mayúsculas en hex', () => {
    expect(first('8743B52063CD84097A65D1633F5C74F5').hashcat).toBe(0)
  })

  it('los formatos con estructura van antes que los hex', () => {
    expect(identifyHash(SHA512CRYPT).every((c) => c.confidence === 'alta')).toBe(true)
  })
})

describe('Modular Crypt Format: el prefijo manda', () => {
  it.each([
    [MD5CRYPT, 500],
    [APR1, 1600],
    [SHA256CRYPT, 7400],
    [SHA512CRYPT, 1800],
    [BCRYPT, 3200],
    ['$P$984478476IagS59wHZvyQMArzfx58u.', 400],
  ])('%s → %i', (h, mode) => {
    expect(first(h).hashcat).toBe(mode)
  })

  it('yescrypt y Argon2 no tienen modo de hashcat pero sí formato de John', () => {
    expect(first('$y$j9T$saltsaltsaltsalt$' + 'A'.repeat(43))).toMatchObject({ name: 'yescrypt', john: 'crypt' })
    const argon = first('$argon2id$v=19$m=65536,t=3,p=4$c2FsdHNhbHQ$aGFzaGhhc2hoYXNo')
    expect(argon).toMatchObject({ name: 'Argon2', john: 'argon2' })
    expect(argon.hashcat).toBeUndefined()
  })
})

describe('Windows y Active Directory', () => {
  it('pwdump → NTLM y extrae el campo NT', () => {
    const line = 'Administrador:500:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::'
    const a = analyzeHash(line)
    expect(a.candidates[0].hashcat).toBe(1000)
    expect(a.extracted).toBe('31d6cfe0d16ae931b73c59d7e0c089c0')
    expect(a.known).toBe('NTLM de una contraseña vacía')
  })

  it('Kerberos: TGS etype 23/17/18 y AS-REP', () => {
    expect(first('$krb5tgs$23$*svc_sql$LAB.LOCAL$MSSQLSvc/sql01*$' + 'a'.repeat(32) + '$' + 'b'.repeat(64)).hashcat).toBe(13100)
    expect(first('$krb5tgs$18$svc$LAB.LOCAL$*spn*$' + 'a'.repeat(24) + '$' + 'b'.repeat(64)).hashcat).toBe(19700)
    expect(first('$krb5asrep$23$user@LAB.LOCAL:' + 'a'.repeat(32) + '$' + 'b'.repeat(64)).hashcat).toBe(18200)
  })

  it('NetNTLMv2 y DCC2', () => {
    const v2 = 'alex::LAB:1122334455667788:' + 'a'.repeat(32) + ':' + '0101000000000000' + 'c'.repeat(40)
    expect(first(v2).hashcat).toBe(5600)
    expect(first('$DCC2$10240#tom#e4e938d12fe5974dc42a90120bd9c90f').hashcat).toBe(2100)
  })
})

describe('otros formatos', () => {
  it('MySQL, LDAP y JWT', () => {
    expect(first('*' + 'A'.repeat(40)).hashcat).toBe(300)
    expect(first('{SHA}' + 'A'.repeat(27) + '=').hashcat).toBe(101)
    expect(first('eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ4In0.abc_-123').hashcat).toBe(16500)
  })

  it('entrada vacía o basura → sin candidatos', () => {
    expect(identifyHash('')).toEqual([])
    expect(identifyHash('hola mundo')).toEqual([])
    expect(identifyHash('zzzz')).toEqual([])
  })
})

describe('parseCrypt', () => {
  it('sha512crypt sin rounds usa el valor por defecto', () => {
    expect(parseCrypt(SHA512CRYPT)).toMatchObject({ id: '6', algorithm: 'sha512crypt', salt: 'saltsalt', cost: '5000 rondas (por defecto)' })
  })
  it('sha512crypt con rounds explícitos', () => {
    expect(parseCrypt(SHA512CRYPT.replace('$6$', '$6$rounds=10000$'))?.cost).toBe('10000 rondas')
  })
  it('bcrypt: coste, sal de 22 y hash de 31', () => {
    const p = parseCrypt(BCRYPT)!
    expect(p.cost).toMatch(/^05 \(2\^5 = 32 iteraciones\)$/)
    expect(p.salt).toHaveLength(22)
    expect(p.hash).toHaveLength(31)
  })
  it('md5crypt y no-crypt', () => {
    expect(parseCrypt(MD5CRYPT)).toMatchObject({ algorithm: 'md5crypt', salt: 'saltsalt' })
    expect(parseCrypt('8743b52063cd84097a65d1633f5c74f5')).toBeNull()
  })
})

describe('analyzeMany', () => {
  it('una entrada por línea, sin vacías ni comentarios', () => {
    const r = analyzeMany('# volcado\n\nd41d8cd98f00b204e9800998ecf8427e\r\n' + SHA512CRYPT + '\n')
    expect(r).toHaveLength(2)
    expect(r[0].known).toBe('MD5 de una cadena vacía')
  })
})
