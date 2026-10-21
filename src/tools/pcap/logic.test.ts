import { describe, expect, it } from 'vitest'
import { detectFormat, readPackets } from './logic'

/** Cabecera global pcap little-endian (formato en pcap-savefile(5)). */
function pcapHeader({ nanoseconds = false, linkType = 1 } = {}): ArrayBuffer {
  const buf = new ArrayBuffer(24)
  const v = new DataView(buf)
  v.setUint32(0, nanoseconds ? 0xa1b23c4d : 0xa1b2c3d4, true)
  v.setUint16(4, 2, true) // version major
  v.setUint16(6, 4, true) // version minor
  v.setUint32(16, 65535, true) // snaplen
  v.setUint32(20, linkType, true)
  return buf
}

/** Cabecera + un paquete de 4 bytes con ts = 1.5 s. */
function pcapWithOnePacket(): ArrayBuffer {
  const head = new Uint8Array(pcapHeader())
  const rec = new ArrayBuffer(16 + 4)
  const v = new DataView(rec)
  v.setUint32(0, 1, true) // ts_sec
  v.setUint32(4, 500000, true) // ts_usec
  v.setUint32(8, 4, true) // incl_len
  v.setUint32(12, 4, true) // orig_len
  new Uint8Array(rec).set([0xde, 0xad, 0xbe, 0xef], 16)
  const out = new Uint8Array(head.length + rec.byteLength)
  out.set(head)
  out.set(new Uint8Array(rec), head.length)
  return out.buffer
}

describe('detectFormat', () => {
  it.skip('pcap little-endian en microsegundos', () => {
    expect(detectFormat(pcapHeader())).toEqual({
      kind: 'pcap', littleEndian: true, nanoseconds: false, versionMajor: 2, versionMinor: 4, snapLen: 65535, linkType: 1,
    })
  })
  it.skip('pcap en nanosegundos', () => {
    expect(detectFormat(pcapHeader({ nanoseconds: true }))).toMatchObject({ kind: 'pcap', nanoseconds: true })
  })
  it.skip('pcapng', () => {
    expect(detectFormat(new Uint8Array([0x0a, 0x0d, 0x0d, 0x0a, 0, 0, 0, 0]).buffer)).toEqual({ kind: 'pcapng' })
  })
  it.skip('rechaza un archivo que no es una captura', () => {
    expect(() => detectFormat(new TextEncoder().encode('hola mundo, no soy un pcap').buffer)).toThrow()
  })
})

describe('readPackets', () => {
  it.skip('lee timestamp, longitudes y datos', () => {
    const [p] = readPackets(pcapWithOnePacket())
    expect(p.ts).toBeCloseTo(1.5)
    expect(p.capturedLength).toBe(4)
    expect([...p.data]).toEqual([0xde, 0xad, 0xbe, 0xef])
  })
})
