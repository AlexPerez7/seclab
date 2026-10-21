export type HashAlg = 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512'

export const HASH_ALGS: HashAlg[] = ['MD5', 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512']

/** Tamaño del digest en bits. */
export const DIGEST_BITS: Record<HashAlg, number> = {
  MD5: 128,
  'SHA-1': 160,
  'SHA-256': 256,
  'SHA-384': 384,
  'SHA-512': 512,
}

export const toHex = (bytes: Uint8Array): string => [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')

// ── MD5 (RFC 1321) ────────────────────────────────────────────
// WebCrypto no incluye MD5 porque está roto para firmas, así que va implementado a mano.

/** Rotaciones por ronda (§3.4): cada fila de 4 se repite 4 veces dentro de su ronda. */
const S = [
  ...Array(4).fill([7, 12, 17, 22]).flat(),
  ...Array(4).fill([5, 9, 14, 20]).flat(),
  ...Array(4).fill([4, 11, 16, 23]).flat(),
  ...Array(4).fill([6, 10, 15, 21]).flat(),
] as number[]

/** Constantes T[i] = floor(|sin(i + 1)| · 2³²) (§3.4). */
const K = Array.from({ length: 64 }, (_, i) => Math.floor(Math.abs(Math.sin(i + 1)) * 2 ** 32) >>> 0)

const rotl = (x: number, c: number) => (x << c) | (x >>> (32 - c))

export function md5(data: Uint8Array): string {
  // Padding (§3.1–3.2): un bit 1, ceros hasta 56 mod 64 y la longitud en bits como uint64 little-endian.
  const total = Math.ceil((data.length + 9) / 64) * 64
  const buf = new Uint8Array(total)
  buf.set(data)
  buf[data.length] = 0x80
  const view = new DataView(buf.buffer)
  const bitLen = data.length * 8
  view.setUint32(total - 8, bitLen >>> 0, true)
  view.setUint32(total - 4, Math.floor(bitLen / 2 ** 32), true)

  // Estado inicial (§3.3).
  let a0 = 0x67452301
  let b0 = 0xefcdab89
  let c0 = 0x98badcfe
  let d0 = 0x10325476

  const M = new Uint32Array(16)
  for (let off = 0; off < total; off += 64) {
    for (let i = 0; i < 16; i++) M[i] = view.getUint32(off + i * 4, true)
    let A = a0
    let B = b0
    let C = c0
    let D = d0
    for (let i = 0; i < 64; i++) {
      let F: number
      let g: number
      if (i < 16) {
        F = (B & C) | (~B & D)
        g = i
      } else if (i < 32) {
        F = (D & B) | (~D & C)
        g = (5 * i + 1) % 16
      } else if (i < 48) {
        F = B ^ C ^ D
        g = (3 * i + 5) % 16
      } else {
        F = C ^ (B | ~D)
        g = (7 * i) % 16
      }
      F = (F + A + K[i] + M[g]) >>> 0
      A = D
      D = C
      C = B
      B = (B + rotl(F, S[i])) >>> 0
    }
    a0 = (a0 + A) >>> 0
    b0 = (b0 + B) >>> 0
    c0 = (c0 + C) >>> 0
    d0 = (d0 + D) >>> 0
  }

  // Salida (§3.5): A, B, C, D en little-endian.
  const out = new DataView(new ArrayBuffer(16))
  ;[a0, b0, c0, d0].forEach((w, i) => out.setUint32(i * 4, w, true))
  return toHex(new Uint8Array(out.buffer))
}

// ── API pública ───────────────────────────────────────────────

/** Hash de bytes en hex minúsculas. SHA-* vía crypto.subtle.digest (WebCrypto). */
export async function hashBytes(alg: HashAlg, data: Uint8Array<ArrayBuffer>): Promise<string> {
  if (alg === 'MD5') return md5(data)
  return toHex(new Uint8Array(await crypto.subtle.digest(alg, data)))
}

export const hashText = (alg: HashAlg, text: string) => hashBytes(alg, new TextEncoder().encode(text))

/** Todos los algoritmos a la vez sobre los mismos bytes. */
export async function hashAll(data: Uint8Array<ArrayBuffer>): Promise<Record<HashAlg, string>> {
  const values = await Promise.all(HASH_ALGS.map((a) => hashBytes(a, data)))
  return Object.fromEntries(HASH_ALGS.map((a, i) => [a, values[i]])) as Record<HashAlg, string>
}

export type HmacAlg = Exclude<HashAlg, 'MD5'>

/** Importa una clave HMAC de WebCrypto a partir de texto UTF-8. */
export const importHmacKey = (alg: HmacAlg, key: string, usages: KeyUsage[] = ['sign']) =>
  crypto.subtle.importKey('raw', new TextEncoder().encode(key), { name: 'HMAC', hash: alg }, false, usages)

/** HMAC (RFC 2104) con WebCrypto, en bytes. */
export async function hmacBytes(alg: HmacAlg, key: string, message: string): Promise<Uint8Array> {
  const cryptoKey = await importHmacKey(alg, key)
  return new Uint8Array(await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(message)))
}

/** HMAC en hex. Clave y mensaje como texto UTF-8. */
export const hmac = async (alg: HmacAlg, key: string, message: string): Promise<string> => toHex(await hmacBytes(alg, key, message))

// ── Comparación y efecto avalancha ────────────────────────────

/** Normaliza un hash pegado: sin espacios, minúsculas, sin prefijo "0x". */
export const normalizeHash = (h: string) => h.trim().toLowerCase().replace(/^0x/, '').replace(/\s+/g, '')

export const hashesMatch = (a: string, b: string) => {
  const na = normalizeHash(a)
  return na.length > 0 && na === normalizeHash(b)
}

/** Cuántos bits difieren entre dos hashes hex de la misma longitud. */
export function bitDiff(hexA: string, hexB: string): { diff: number; total: number } {
  if (hexA.length !== hexB.length || !/^[0-9a-f]*$/i.test(hexA + hexB)) {
    throw new Error('Los hashes deben ser hex de la misma longitud')
  }
  let diff = 0
  for (let i = 0; i < hexA.length; i++) {
    let x = parseInt(hexA[i], 16) ^ parseInt(hexB[i], 16)
    while (x) {
      diff += x & 1
      x >>= 1
    }
  }
  return { diff, total: hexA.length * 4 }
}
