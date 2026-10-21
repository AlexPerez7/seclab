import { notImplemented } from '@/lib/todo'

export type HashAlg = 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512'

export const HASH_ALGS: HashAlg[] = ['MD5', 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512']

/**
 * Hash de bytes en hex minúsculas.
 * - SHA-*: crypto.subtle.digest (WebCrypto), disponible también en Node para los tests.
 * - MD5: WebCrypto no lo trae. Implementarlo a mano siguiendo RFC 1321 es un buen ejercicio.
 */
export async function hashBytes(alg: HashAlg, data: Uint8Array): Promise<string> {
  return notImplemented('hashBytes', alg, data)
}

export const hashText = (alg: HashAlg, text: string) => hashBytes(alg, new TextEncoder().encode(text))

/** HMAC (RFC 2104) con crypto.subtle.importKey + sign. Devuelve hex. */
export async function hmac(alg: Exclude<HashAlg, 'MD5'>, key: string, message: string): Promise<string> {
  return notImplemented('hmac', alg, key, message)
}
