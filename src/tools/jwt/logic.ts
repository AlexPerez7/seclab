import { notImplemented } from '@/lib/todo'
// Para las partes Base64url conviene reutilizar encode/decode de '../encoders/logic'.

export interface DecodedJwt {
  header: Record<string, unknown>
  payload: Record<string, unknown>
  /** Firma tal cual viene en el token (Base64url). */
  signature: string
  /** `base64url(header).base64url(payload)`: lo que realmente se firma. */
  signingInput: string
}

/** Separa y decodifica las tres partes. Lanza un error si el token no es un JWS compacto válido. */
export function decodeJwt(token: string): DecodedJwt {
  return notImplemented('decodeJwt', token)
}

/** Verifica una firma HS256 con WebCrypto (HMAC-SHA256). */
export async function verifyHS256(token: string, secret: string): Promise<boolean> {
  return notImplemented('verifyHS256', token, secret)
}

/** Firma un payload con HS256. */
export async function signHS256(payload: Record<string, unknown>, secret: string): Promise<string> {
  return notImplemented('signHS256', payload, secret)
}

/** Ataque alg=none: mismo payload, header con "alg":"none" y firma vacía. Solo para probar en un lab propio. */
export function forgeNone(token: string): string {
  return notImplemented('forgeNone', token)
}

/** Avisos de seguridad: alg none, sin exp, ya expirado, HS con kid/jku, datos sensibles en el payload… (RFC 8725). */
export function auditJwt(decoded: DecodedJwt, now: Date = new Date()): string[] {
  return notImplemented('auditJwt', decoded, now)
}
