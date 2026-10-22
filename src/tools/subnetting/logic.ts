/* Subnetting y VLSM sobre IPv4. Las direcciones se manejan como enteros sin signo de 32 bits:
   las operaciones de red son AND/OR con la máscara, y `>>> 0` devuelve el resultado al rango sin signo. */

export interface SubnetInfo {
  /** La IP tal cual se escribió (puede ser un host de la red). */
  ip: string
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
  /** Rango especial al que pertenece la IP (privada, loopback, CGNAT…). */
  type: string
  /** Clase histórica (anterior a CIDR). Solo como referencia. */
  ipClass: 'A' | 'B' | 'C' | 'D' | 'E'
}

/** "192.168.1.10" → 3232235786. Rechaza octetos con ceros a la izquierda: algunos parsers los leen en octal. */
export function ipToInt(ip: string): number {
  const parts = ip.trim().split('.')
  if (parts.length !== 4) throw new Error(`"${ip}" no es una IPv4: deben ser 4 octetos separados por puntos`)
  return (
    parts.reduce((acc, p) => {
      if (!/^\d{1,3}$/.test(p)) throw new Error(`Octeto inválido: "${p}"`)
      if (p.length > 1 && p.startsWith('0')) throw new Error(`Octeto con cero a la izquierda: "${p}" (ambiguo: algunos sistemas lo leen en octal)`)
      const n = Number(p)
      if (n > 255) throw new Error(`Octeto fuera de rango: ${n} (máximo 255)`)
      return acc * 256 + n
    }, 0) >>> 0
  )
}

export function intToIp(n: number): string {
  const u = n >>> 0
  return [u >>> 24, (u >>> 16) & 255, (u >>> 8) & 255, u & 255].join('.')
}

/** Máscara de un prefijo: /24 → 0xffffff00. Ojo: en JS `x << 32` no da 0, por eso el caso /0 va aparte. */
export const prefixToMaskInt = (prefix: number) => (prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0)

/** "255.255.255.0" → 24. Lanza un error si la máscara no es contigua (p. ej. 255.0.255.0). */
export function maskToPrefix(mask: string): number {
  const m = ipToInt(mask)
  for (let p = 0; p <= 32; p++) if (prefixToMaskInt(p) === m) return p
  throw new Error(`"${mask}" no es una máscara válida: los unos deben ser contiguos`)
}

/** "11000000.10101000.00000001.00001010" */
export const toBinary = (n: number) =>
  intToIp(n)
    .split('.')
    .map((o) => Number(o).toString(2).padStart(8, '0'))
    .join('.')

const RANGES: { cidr: string; type: string }[] = [
  { cidr: '0.0.0.0/8', type: '"Esta red" (RFC 1122)' },
  { cidr: '10.0.0.0/8', type: 'Privada (RFC 1918)' },
  { cidr: '100.64.0.0/10', type: 'CGNAT compartida (RFC 6598)' },
  { cidr: '127.0.0.0/8', type: 'Loopback' },
  { cidr: '169.254.0.0/16', type: 'Link-local / APIPA (RFC 3927)' },
  { cidr: '172.16.0.0/12', type: 'Privada (RFC 1918)' },
  { cidr: '192.0.2.0/24', type: 'Documentación TEST-NET-1 (RFC 5737)' },
  { cidr: '192.168.0.0/16', type: 'Privada (RFC 1918)' },
  { cidr: '198.18.0.0/15', type: 'Pruebas de rendimiento (RFC 2544)' },
  { cidr: '198.51.100.0/24', type: 'Documentación TEST-NET-2 (RFC 5737)' },
  { cidr: '203.0.113.0/24', type: 'Documentación TEST-NET-3 (RFC 5737)' },
  { cidr: '224.0.0.0/4', type: 'Multicast' },
  { cidr: '255.255.255.255/32', type: 'Broadcast limitado' },
  { cidr: '240.0.0.0/4', type: 'Reservada (clase E)' },
]

const inRange = (ip: number, cidr: string) => {
  const [net, p] = cidr.split('/')
  const mask = prefixToMaskInt(Number(p))
  return ((ip & mask) >>> 0) === ipToInt(net)
}

/** Tipo de dirección según los rangos especiales de IANA. */
export const addressType = (ip: number) => RANGES.find((r) => inRange(ip, r.cidr))?.type ?? 'Pública'

const isRfc1918 = (ip: number) => ['10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16'].some((c) => inRange(ip, c))

const ipClassOf = (ip: number): SubnetInfo['ipClass'] => {
  const o = ip >>> 24
  return o < 128 ? 'A' : o < 192 ? 'B' : o < 224 ? 'C' : o < 240 ? 'D' : 'E'
}

/**
 * Acepta "192.168.1.10/24", "192.168.1.10/255.255.255.0" o "192.168.1.10 255.255.255.0".
 * Una IP cualquiera de la red sirve: "192.168.1.10/24" describe la red 192.168.1.0/24.
 */
export function parseCidr(input: string): SubnetInfo {
  const m = /^\s*([\d.]+)\s*(?:\/\s*|\s+)([\d.]+)\s*$/.exec(input)
  if (!m) throw new Error('Formato esperado: IP/prefijo (192.168.1.10/24) o IP y máscara (192.168.1.10 255.255.255.0)')
  const [, ipStr, maskStr] = m
  const ip = ipToInt(ipStr)
  let prefix: number
  if (maskStr.includes('.')) prefix = maskToPrefix(maskStr)
  else {
    prefix = Number(maskStr)
    if (!Number.isInteger(prefix) || prefix < 0 || prefix > 32) throw new Error(`Prefijo fuera de rango: /${maskStr} (0 a 32)`)
  }

  const mask = prefixToMaskInt(prefix)
  const network = (ip & mask) >>> 0
  const broadcast = (network | ~mask) >>> 0
  const total = 2 ** (32 - prefix)
  const [first, last, usable] =
    prefix === 32 ? [network, network, 1] : prefix === 31 ? [network, broadcast, 2] : [network + 1, broadcast - 1, total - 2]

  return {
    ip: intToIp(ip),
    cidr: `${intToIp(network)}/${prefix}`,
    prefix,
    network: intToIp(network),
    broadcast: intToIp(broadcast),
    firstHost: intToIp(first),
    lastHost: intToIp(last),
    mask: intToIp(mask),
    wildcard: intToIp(~mask),
    totalAddresses: total,
    usableHosts: usable,
    isPrivate: isRfc1918(ip),
    type: addressType(ip),
    ipClass: ipClassOf(ip),
  }
}

export interface VlsmRequest {
  name: string
  hosts: number
}

export interface VlsmAllocation extends VlsmRequest {
  subnet: SubnetInfo
  /** Direcciones utilizables que sobran en la subred asignada. */
  wasted: number
}

/** El prefijo más pequeño (red más ajustada) con al menos `hosts` direcciones utilizables. Mínimo /30. */
export function prefixForHosts(hosts: number): number {
  if (!Number.isInteger(hosts) || hosts < 1) throw new Error(`Número de hosts inválido: ${hosts}`)
  for (let p = 30; p >= 0; p--) if (2 ** (32 - p) - 2 >= hosts) return p
  throw new Error(`${hosts} hosts no caben en IPv4`)
}

/**
 * VLSM clásico: ordenar de mayor a menor necesidad de hosts y asignar en orden, cada una con el
 * prefijo más pequeño que alcance. Al ir de mayor a menor, cada bloque queda alineado a su tamaño.
 * Lanza un error si no cabe en la red base.
 */
export function vlsm(base: string, requests: VlsmRequest[]): VlsmAllocation[] {
  const baseNet = parseCidr(base)
  const start = ipToInt(baseNet.network)
  const end = start + baseNet.totalAddresses
  const sorted = [...requests].sort((a, b) => b.hosts - a.hosts)

  let cursor = start
  return sorted.map((r) => {
    const prefix = prefixForHosts(r.hosts)
    const size = 2 ** (32 - prefix)
    cursor = Math.ceil(cursor / size) * size
    if (cursor + size > end) {
      throw new Error(`"${r.name}" (${r.hosts} hosts, /${prefix}) no cabe: la red ${baseNet.cidr} se queda sin espacio`)
    }
    const subnet = parseCidr(`${intToIp(cursor)}/${prefix}`)
    cursor += size
    return { ...r, subnet, wasted: subnet.usableHosts - r.hosts }
  })
}

// ── Modo práctica ─────────────────────────────────────────────

export type ExerciseField = 'network' | 'broadcast' | 'firstHost' | 'lastHost' | 'usableHosts'

export const EXERCISE_FIELDS: { key: ExerciseField; label: string }[] = [
  { key: 'network', label: 'red' },
  { key: 'broadcast', label: 'broadcast' },
  { key: 'firstHost', label: 'primer host' },
  { key: 'lastHost', label: 'último host' },
  { key: 'usableHosts', label: 'hosts útiles' },
]

/** Un ejercicio aleatorio: un host de una red privada con prefijo entre /16 y /30. `random` es inyectable para los tests. */
export function randomExercise(random: () => number = Math.random): string {
  const r = (n: number) => Math.floor(random() * n)
  const bases = [() => [10, r(256), r(256), r(256)], () => [172, 16 + r(16), r(256), r(256)], () => [192, 168, r(256), r(256)]]
  const ip = bases[r(bases.length)]().join('.')
  return `${ip}/${16 + r(15)}`
}

/** Compara la respuesta del usuario con la correcta, campo a campo. */
export function checkExercise(cidr: string, answers: Partial<Record<ExerciseField, string>>): Record<ExerciseField, boolean> {
  const s = parseCidr(cidr)
  const norm = (v: string | undefined) => (v ?? '').trim().replace(/\s+/g, '')
  return Object.fromEntries(
    EXERCISE_FIELDS.map(({ key }) => [key, norm(answers[key]) === String(s[key])]),
  ) as Record<ExerciseField, boolean>
}
