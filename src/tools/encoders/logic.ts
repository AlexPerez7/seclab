/* Encoders — herramienta de referencia: así debe quedar cada logic.ts.
   Funciones puras, sin React, todo el texto se trata como UTF-8. */

export type Codec = 'base64' | 'base64url' | 'hex' | 'url' | 'binary'

export const CODECS: { id: Codec; label: string }[] = [
  { id: 'base64', label: 'Base64' },
  { id: 'base64url', label: 'Base64url' },
  { id: 'hex', label: 'Hex' },
  { id: 'url', label: 'URL' },
  { id: 'binary', label: 'Binario' },
]

const utf8 = new TextEncoder()
const utf8Strict = new TextDecoder('utf-8', { fatal: true })

const toUtf8 = (bytes: Uint8Array): string => {
  try {
    return utf8Strict.decode(bytes)
  } catch {
    throw new Error('El resultado no es texto UTF-8 válido')
  }
}

function bytesToBase64(bytes: Uint8Array): string {
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin)
}

function base64ToBytes(input: string): Uint8Array {
  const clean = input.replace(/\s+/g, '')
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(clean) || clean.length % 4 === 1) {
    throw new Error('Base64 inválido')
  }
  const bin = atob(clean)
  return Uint8Array.from(bin, (c) => c.charCodeAt(0))
}

export function encode(codec: Codec, text: string): string {
  const bytes = utf8.encode(text)
  switch (codec) {
    case 'base64':
      return bytesToBase64(bytes)
    case 'base64url':
      // RFC 4648 §5: alfabeto URL-safe y sin padding (como en JWT).
      return bytesToBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    case 'hex':
      return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')
    case 'url':
      return encodeURIComponent(text)
    case 'binary':
      return [...bytes].map((b) => b.toString(2).padStart(8, '0')).join(' ')
  }
}

export function decode(codec: Codec, input: string): string {
  switch (codec) {
    case 'base64':
      return toUtf8(base64ToBytes(input))
    case 'base64url': {
      const b64 = input.replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/')
      return toUtf8(base64ToBytes(b64.padEnd(Math.ceil(b64.length / 4) * 4, '=')))
    }
    case 'hex': {
      const clean = input.replace(/\s+|0x/gi, '')
      if (!/^([0-9a-f]{2})*$/i.test(clean)) throw new Error('Hex inválido: deben ser pares de dígitos 0-9a-f')
      return toUtf8(Uint8Array.from(clean.match(/../g) ?? [], (h) => parseInt(h, 16)))
    }
    case 'url':
      try {
        return decodeURIComponent(input.replace(/\+/g, ' '))
      } catch {
        throw new Error('Secuencia %XX inválida')
      }
    case 'binary': {
      const groups = input.trim().split(/\s+/).filter(Boolean)
      if (groups.some((g) => !/^[01]{8}$/.test(g))) throw new Error('Binario inválido: grupos de 8 bits separados por espacio')
      return toUtf8(Uint8Array.from(groups, (g) => parseInt(g, 2)))
    }
  }
}
