import { notImplemented } from '@/lib/todo'

export interface SubnetInfo {
  /** Notación CIDR normalizada a la red, p. ej. "192.168.1.0/24". */
  cidr: string
  prefix: number
  network: string
  broadcast: string
  firstHost: string
  lastHost: string
  mask: string
  wildcard: string
  totalAddresses: number
  /** Hosts utilizables: total − 2, salvo /31 (RFC 3021, enlaces punto a punto) y /32. */
  usableHosts: number
  /** RFC 1918. */
  isPrivate: boolean
}

/** "192.168.1.10" → 3232235786. Usar `>>> 0` para que el resultado quede sin signo. */
export function ipToInt(ip: string): number {
  return notImplemented('ipToInt', ip)
}

export function intToIp(n: number): string {
  return notImplemented('intToIp', n)
}

/** Acepta una IP cualquiera de la red: "192.168.1.10/24" describe la red 192.168.1.0/24. */
export function parseCidr(cidr: string): SubnetInfo {
  return notImplemented('parseCidr', cidr)
}

export interface VlsmRequest {
  name: string
  hosts: number
}

export interface VlsmAllocation extends VlsmRequest {
  subnet: SubnetInfo
}

/**
 * VLSM clásico: ordenar de mayor a menor necesidad de hosts y asignar en orden, cada una con el
 * prefijo más pequeño que alcance. Lanza un error si no cabe en la red base.
 */
export function vlsm(base: string, requests: VlsmRequest[]): VlsmAllocation[] {
  return notImplemented('vlsm', base, requests)
}
