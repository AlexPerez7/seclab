import { notImplemented } from '@/lib/todo'

export type PcapFormat =
  | {
      kind: 'pcap'
      /** El magic 0xa1b2c3d4 leído como d4 c3 b2 a1 indica little-endian. */
      littleEndian: boolean
      /** 0xa1b23c4d: timestamps en nanosegundos en vez de microsegundos. */
      nanoseconds: boolean
      versionMajor: number
      versionMinor: number
      snapLen: number
      /** LINKTYPE_*: 1 = Ethernet, 101 = raw IP, 113 = Linux SLL… */
      linkType: number
    }
  | { kind: 'pcapng' }

/** Lee la cabecera global (24 bytes) o detecta pcapng (Section Header Block 0x0a0d0d0a). */
export function detectFormat(buf: ArrayBuffer): PcapFormat {
  return notImplemented('detectFormat', buf)
}

export interface PacketRecord {
  /** Segundos desde epoch, con decimales. */
  ts: number
  capturedLength: number
  originalLength: number
  data: Uint8Array
}

/** Recorre los registros de un pcap clásico. pcapng puede quedar para una segunda fase. */
export function readPackets(buf: ArrayBuffer): PacketRecord[] {
  return notImplemented('readPackets', buf)
}

export interface PcapSummary {
  packets: number
  bytes: number
  durationSeconds: number
  /** Conteo por protocolo: ARP, IPv4, IPv6, TCP, UDP, ICMP, DNS, HTTP… */
  protocols: Record<string, number>
  topTalkers: { ip: string; bytes: number }[]
  dnsQueries: string[]
  alerts: string[]
}

/** Decodifica Ethernet → IP → TCP/UDP y agrega estadísticas. Alertas de ejemplo: escaneo SYN, credenciales HTTP Basic, DNS con nombres muy largos (posible exfiltración). */
export function summarize(packets: PacketRecord[], linkType: number): PcapSummary {
  return notImplemented('summarize', packets, linkType)
}
