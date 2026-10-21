import { notImplemented } from '@/lib/todo'

export interface HashCandidate {
  name: string
  /** Modo de hashcat (-m). */
  hashcat?: number
  /** Formato de John the Ripper (--format=). */
  john?: string
  note?: string
}

/**
 * Devuelve los formatos posibles de un hash, del más al menos probable.
 * Ideas: primero los prefijos inequívocos ($2y$, $6$, $1$…), después la longitud y el alfabeto
 * (32 hex puede ser MD5, NTLM o MD4: un hash crudo no dice de dónde salió).
 */
export function identifyHash(input: string): HashCandidate[] {
  return notImplemented('identifyHash', input)
}
