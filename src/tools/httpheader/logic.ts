import { notImplemented } from '@/lib/todo'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'

export interface HttpRequestSpec {
  method: HttpMethod
  /** URL absoluta: de ella salen el Host y el request-target. */
  url: string
  headers: [name: string, value: string][]
  body?: string
}

/**
 * Petición HTTP/1.1 cruda (RFC 9112): líneas terminadas en CRLF, `Host` primero,
 * `Content-Length` calculado en bytes UTF-8 si hay body y no viene ya en los headers.
 */
export function buildRawRequest(spec: HttpRequestSpec): string {
  return notImplemented('buildRawRequest', spec)
}

/** Comando curl equivalente, con comillas simples escapadas para bash. */
export function toCurl(spec: HttpRequestSpec): string {
  return notImplemented('toCurl', spec)
}
