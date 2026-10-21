/* HashID — identificación de formatos de hash.
   Los modos de hashcat se contrastan con https://hashcat.net/wiki/doku.php?id=example_hashes
   (o en local: `hashcat --example-hashes -m <modo>`). */

export type Confidence = 'alta' | 'media' | 'baja'

export interface HashCandidate {
  name: string
  /** Modo de hashcat (-m). */
  hashcat?: number
  /** Formato de John the Ripper (--format=). */
  john?: string
  confidence: Confidence
  note?: string
}

interface Signature extends HashCandidate {
  re: RegExp
}

const B64CRYPT = '[./0-9A-Za-z]'
const HEX = (n: number) => new RegExp(`^[0-9a-f]{${n}}$`, 'i')

/* Orden: dentro de cada nivel de confianza, del más al menos probable. */
const SIGNATURES: Signature[] = [
  // ── Modular Crypt Format ($id$…): el prefijo identifica el algoritmo sin ambigüedad ──
  { re: new RegExp(`^\\$2[abxy]\\$\\d{2}\\$${B64CRYPT}{53}$`), name: 'bcrypt', hashcat: 3200, john: 'bcrypt', confidence: 'alta' },
  { re: new RegExp(`^\\$1\\$${B64CRYPT}{0,8}\\$${B64CRYPT}{22}$`), name: 'md5crypt', hashcat: 500, john: 'md5crypt', confidence: 'alta', note: 'El formato clásico de /etc/shadow antiguo y de routers Cisco (type 5).' },
  { re: new RegExp(`^\\$apr1\\$${B64CRYPT}{0,8}\\$${B64CRYPT}{22}$`), name: 'Apache apr1 (md5crypt)', hashcat: 1600, confidence: 'alta', note: 'Típico de ficheros .htpasswd.' },
  { re: new RegExp(`^\\$5\\$(rounds=\\d+\\$)?${B64CRYPT}{0,16}\\$${B64CRYPT}{43}$`), name: 'sha256crypt', hashcat: 7400, john: 'sha256crypt', confidence: 'alta' },
  { re: new RegExp(`^\\$6\\$(rounds=\\d+\\$)?${B64CRYPT}{0,16}\\$${B64CRYPT}{86}$`), name: 'sha512crypt', hashcat: 1800, john: 'sha512crypt', confidence: 'alta', note: 'El formato por defecto de /etc/shadow en muchas distribuciones Linux.' },
  { re: new RegExp(`^\\$y\\$${B64CRYPT}+\\$${B64CRYPT}*\\$${B64CRYPT}{43}$`), name: 'yescrypt', john: 'crypt', confidence: 'alta', note: 'Por defecto en /etc/shadow de Debian 11+, Ubuntu 22.04+ y Fedora 35+. hashcat no lo soporta: usar John.' },
  { re: /^\$argon2(id|i|d)\$v=\d+\$m=\d+,t=\d+,p=\d+\$[A-Za-z0-9+/]+\$[A-Za-z0-9+/]+$/, name: 'Argon2', john: 'argon2', confidence: 'alta', note: 'KDF moderno (ganador de la Password Hashing Competition). Muy costoso de atacar a propósito.' },
  { re: new RegExp(`^\\$[PH]\\$${B64CRYPT}{31}$`), name: 'phpass (WordPress, phpBB)', hashcat: 400, john: 'phpass', confidence: 'alta' },

  // ── Windows y Active Directory ──
  { re: /^[^:]+:\d+:[0-9a-f]{32}:[0-9a-f]{32}:::$/i, name: 'pwdump (línea SAM/NTDS)', hashcat: 1000, john: 'nt', confidence: 'alta', note: 'Formato usuario:RID:LM:NT. El hash que interesa es el 4.º campo (NT). Para hashcat, extráelo o usa --username.' },
  { re: /^\$DCC2\$\d+#[^#]+#[0-9a-f]{32}$/i, name: 'Domain Cached Credentials 2 (DCC2)', hashcat: 2100, john: 'mscash2', confidence: 'alta', note: 'Credenciales de dominio cacheadas en el equipo. Lentas de crackear (PBKDF2) y no sirven para pass-the-hash.' },
  { re: /^\$krb5tgs\$23\$/, name: 'Kerberos 5 TGS-REP etype 23 (Kerberoasting)', hashcat: 13100, john: 'krb5tgs', confidence: 'alta', note: 'Ticket de servicio cifrado con RC4. Se obtiene pidiendo un TGS para una cuenta con SPN.' },
  { re: /^\$krb5tgs\$17\$/, name: 'Kerberos 5 TGS-REP etype 17 (AES128)', hashcat: 19600, confidence: 'alta' },
  { re: /^\$krb5tgs\$18\$/, name: 'Kerberos 5 TGS-REP etype 18 (AES256)', hashcat: 19700, confidence: 'alta' },
  { re: /^\$krb5asrep\$23\$/, name: 'Kerberos 5 AS-REP etype 23 (AS-REP roasting)', hashcat: 18200, john: 'krb5asrep', confidence: 'alta', note: 'Cuentas con "no requerir preautenticación Kerberos" activado.' },
  { re: /^[^:]+::[^:]*:[0-9a-f]{16}:[0-9a-f]{32}:[0-9a-f]+$/i, name: 'NetNTLMv2', hashcat: 5600, john: 'netntlmv2', confidence: 'alta', note: 'Respuesta de desafío capturada en la red (Responder, relay). No sirve para pass-the-hash: hay que crackearla.' },
  { re: /^[^:]+::[^:]*:[0-9a-f]{48}:[0-9a-f]{48}:[0-9a-f]{16}$/i, name: 'NetNTLMv1', hashcat: 5500, john: 'netntlm', confidence: 'alta', note: 'Protocolo obsoleto y muy débil: con el desafío adecuado se recupera el hash NT.' },

  // ── Otros formatos con estructura propia ──
  { re: /^\*[0-9A-F]{40}$/, name: 'MySQL 4.1+ (mysql_native_password)', hashcat: 300, john: 'mysql-sha1', confidence: 'alta', note: 'SHA1(SHA1(contraseña)) en mayúsculas con un * delante.' },
  { re: /^pbkdf2_sha256\$\d+\$[^$]+\$[A-Za-z0-9+/=]{44}$/, name: 'Django PBKDF2-SHA256', hashcat: 10000, confidence: 'alta' },
  { re: /^\{SHA\}[A-Za-z0-9+/]{27}=$/, name: 'LDAP {SHA}', hashcat: 101, confidence: 'alta', note: 'SHA-1 sin sal en Base64.' },
  { re: /^\{SSHA\}[A-Za-z0-9+/]+={0,2}$/, name: 'LDAP {SSHA}', hashcat: 111, confidence: 'alta', note: 'SHA-1 con sal en Base64.' },
  { re: /^\{SSHA512\}[A-Za-z0-9+/]+={0,2}$/, name: 'LDAP {SSHA512}', hashcat: 1711, confidence: 'alta' },
  { re: /^eyJ[\w-]*\.eyJ[\w-]*\.[\w-]+$/, name: 'JWT (HS256/384/512)', hashcat: 16500, confidence: 'alta', note: 'No es un hash: es un token firmado. hashcat puede atacar el secreto HMAC. Ver la herramienta JWT.' },
  { re: /^WPA\*0[12]\*/, name: 'WPA PMKID / EAPOL', hashcat: 22000, confidence: 'alta', note: 'Formato hc22000, generado con hcxpcapngtool a partir de una captura.' },

  // ── Hex crudo: solo la longitud orienta, y varias funciones comparten longitud ──
  { re: HEX(32), name: 'MD5', hashcat: 0, john: 'raw-md5', confidence: 'media' },
  { re: HEX(32), name: 'NTLM', hashcat: 1000, john: 'nt', confidence: 'media', note: 'Mismo aspecto que MD5. Si viene de Windows, AD o un volcado de credenciales, es NTLM.' },
  { re: HEX(32), name: 'MD4', hashcat: 900, john: 'raw-md4', confidence: 'baja' },
  { re: HEX(32), name: 'LM', hashcat: 3000, john: 'lm', confidence: 'baja', note: 'Obsoleto. Si aparece, la contraseña tenía como máximo 14 caracteres y se trata en mayúsculas.' },
  { re: HEX(40), name: 'SHA-1', hashcat: 100, john: 'raw-sha1', confidence: 'media' },
  { re: HEX(40), name: 'RIPEMD-160', hashcat: 6000, john: 'ripemd-160', confidence: 'baja' },
  { re: HEX(56), name: 'SHA-224', hashcat: 1300, john: 'raw-sha224', confidence: 'media' },
  { re: HEX(56), name: 'SHA3-224', hashcat: 17300, confidence: 'baja' },
  { re: HEX(64), name: 'SHA-256', hashcat: 1400, john: 'raw-sha256', confidence: 'media' },
  { re: HEX(64), name: 'SHA3-256', hashcat: 17400, confidence: 'baja' },
  { re: HEX(96), name: 'SHA-384', hashcat: 10800, john: 'raw-sha384', confidence: 'media' },
  { re: HEX(96), name: 'SHA3-384', hashcat: 17500, confidence: 'baja' },
  { re: HEX(128), name: 'SHA-512', hashcat: 1700, john: 'raw-sha512', confidence: 'media' },
  { re: HEX(128), name: 'SHA3-512', hashcat: 17600, confidence: 'baja' },
  { re: HEX(128), name: 'Whirlpool', hashcat: 6100, confidence: 'baja' },
  { re: HEX(16), name: 'MySQL 3.2.3 (OLD_PASSWORD)', hashcat: 200, confidence: 'baja', note: 'Formato antiguo y roto. 16 hex también puede ser media hash LM.' },
  { re: HEX(8), name: 'CRC32', hashcat: 11500, confidence: 'baja', note: 'Es un checksum, no un hash criptográfico. hashcat espera el formato crc:00000000.' },
  { re: new RegExp(`^${B64CRYPT}{13}$`), name: 'DES crypt (descrypt)', hashcat: 1500, john: 'descrypt', confidence: 'baja', note: 'Unix antiguo: 2 caracteres de sal + 11 de hash. Solo usa los primeros 8 caracteres de la contraseña.' },
]

const ORDER: Record<Confidence, number> = { alta: 0, media: 1, baja: 2 }

/** Formatos posibles de un hash, de más a menos probable. Vacío si no coincide con ninguno. */
export function identifyHash(input: string): HashCandidate[] {
  const h = input.trim()
  if (!h) return []
  return SIGNATURES.filter((s) => s.re.test(h))
    .map(({ re: _re, ...c }) => c)
    .sort((a, b) => ORDER[a.confidence] - ORDER[b.confidence])
}

/** Hashes famosos que delatan algo por sí solos. */
export const KNOWN_HASHES: Record<string, string> = {
  d41d8cd98f00b204e9800998ecf8427e: 'MD5 de una cadena vacía',
  da39a3ee5e6b4b0d3255bfef95601890afd80709: 'SHA-1 de una cadena vacía',
  e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855: 'SHA-256 de una cadena vacía',
  '31d6cfe0d16ae931b73c59d7e0c089c0': 'NTLM de una contraseña vacía',
  aad3b435b51404eeaad3b435b51404ee: 'LM vacío: el almacenamiento LM está deshabilitado (lo normal hoy)',
}

export interface CryptParts {
  id: string
  algorithm: string
  /** Factor de coste: rondas (sha-crypt), log2 de iteraciones (bcrypt) o parámetros (yescrypt). */
  cost?: string
  salt: string
  hash: string
}

const CRYPT_NAMES: Record<string, string> = {
  '1': 'md5crypt', apr1: 'Apache apr1', '2a': 'bcrypt', '2b': 'bcrypt', '2x': 'bcrypt', '2y': 'bcrypt',
  '5': 'sha256crypt', '6': 'sha512crypt', y: 'yescrypt',
}

/** Desglosa un hash en Modular Crypt Format ($id$…$sal$hash). */
export function parseCrypt(input: string): CryptParts | null {
  const h = input.trim()
  const bcrypt = /^\$(2[abxy])\$(\d{2})\$([./0-9A-Za-z]{22})([./0-9A-Za-z]{31})$/.exec(h)
  if (bcrypt) {
    const [, id, cost, salt, hash] = bcrypt
    return { id, algorithm: 'bcrypt', cost: `${cost} (2^${Number(cost)} = ${(2 ** Number(cost)).toLocaleString('es')} iteraciones)`, salt, hash }
  }
  const sha = /^\$([56])\$(?:rounds=(\d+)\$)?([^$]{0,16})\$([./0-9A-Za-z]+)$/.exec(h)
  if (sha) {
    const [, id, rounds, salt, hash] = sha
    return { id, algorithm: CRYPT_NAMES[id], cost: rounds ? `${rounds} rondas` : '5000 rondas (por defecto)', salt, hash }
  }
  const md5 = /^\$(1|apr1)\$([^$]{0,8})\$([./0-9A-Za-z]{22})$/.exec(h)
  if (md5) {
    const [, id, salt, hash] = md5
    return { id, algorithm: CRYPT_NAMES[id], cost: '1000 rondas (fijo)', salt, hash }
  }
  const yes = /^\$y\$([^$]+)\$([^$]*)\$([./0-9A-Za-z]+)$/.exec(h)
  if (yes) {
    const [, params, salt, hash] = yes
    return { id: 'y', algorithm: 'yescrypt', cost: params, salt, hash }
  }
  return null
}

export interface HashAnalysis {
  input: string
  candidates: HashCandidate[]
  known?: string
  crypt: CryptParts | null
  /** Hash NT extraído de una línea pwdump. */
  extracted?: string
}

export function analyzeHash(input: string): HashAnalysis {
  const h = input.trim()
  const pwdump = /^[^:]+:\d+:[0-9a-f]{32}:([0-9a-f]{32}):::$/i.exec(h)
  const lookup = (pwdump ? pwdump[1] : h).toLowerCase()
  return {
    input: h,
    candidates: identifyHash(h),
    known: KNOWN_HASHES[lookup],
    crypt: parseCrypt(h),
    extracted: pwdump?.[1],
  }
}

/** Una línea por hash; ignora líneas vacías y comentarios (#). */
export const analyzeMany = (text: string): HashAnalysis[] =>
  text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'))
    .map(analyzeHash)

export const hashcatCommand = (mode: number) => `hashcat -m ${mode} -a 0 hashes.txt wordlist.txt`
export const johnCommand = (format: string) => `john --format=${format} --wordlist=wordlist.txt hashes.txt`
