import { describe, expect, it } from 'vitest'
import { findPort, GROUP_LABEL, parseNmap, pickCard, PORTS, searchPorts } from './logic'

describe('datos', () => {
  it('no hay puertos duplicados', () => {
    const keys = PORTS.map((p) => `${p.port}/${p.proto}`)
    expect(new Set(keys).size).toBe(keys.length)
  })
  it('cada puerto tiene notas de pentest y de defensa, y un grupo válido', () => {
    for (const p of PORTS) {
      expect(p.pentest.length, `${p.port}`).toBeGreaterThan(10)
      expect(p.defense.length, `${p.port}`).toBeGreaterThan(5)
      expect(GROUP_LABEL[p.group], `${p.port}`).toBeDefined()
    }
  })
  it('puertos conocidos con su protocolo correcto', () => {
    expect(findPort(161)?.proto).toBe('udp')
    expect(findPort(53)?.proto).toBe('tcp/udp')
    expect(findPort(1858)?.service).toBe('CyberArk Vault')
  })
})

describe('searchPorts', () => {
  it('por número exacto (no por prefijo)', () => {
    expect(searchPorts('445').map((p) => p.service)).toEqual(['SMB'])
    expect(searchPorts('44').map((p) => p.port)).toEqual([])
  })
  it('por nombre, sin distinguir mayúsculas, y también en las notas', () => {
    expect(searchPorts('kerberos').map((p) => p.port)).toEqual(expect.arrayContaining([88, 464]))
    expect(searchPorts('RESPONDER').map((p) => p.port)).toEqual(expect.arrayContaining([137, 5355]))
  })
  it('filtrando por grupo y ordenado por puerto', () => {
    const ad = searchPorts('', 'ad')
    expect(ad.every((p) => p.group === 'ad')).toBe(true)
    expect(ad.map((p) => p.port)).toEqual([...ad.map((p) => p.port)].sort((a, b) => a - b))
  })
})

describe('parseNmap', () => {
  it('salida normal: solo abiertos y anotados', () => {
    const out = `
Nmap scan report for dc01.lab.local (10.0.0.10)
PORT     STATE    SERVICE       VERSION
53/tcp   open     domain        Simple DNS Plus
88/tcp   open     kerberos-sec  Microsoft Windows Kerberos
135/tcp  open     msrpc         Microsoft Windows RPC
139/tcp  filtered netbios-ssn
445/tcp  open     microsoft-ds?
3389/tcp closed   ms-wbt-server
161/udp  open|filtered snmp
`
    const r = parseNmap(out)
    expect(r.map((p) => `${p.port}/${p.proto}`)).toEqual(['53/tcp', '88/tcp', '135/tcp', '445/tcp', '161/udp'])
    expect(r[1]).toMatchObject({ service: 'kerberos-sec', version: 'Microsoft Windows Kerberos' })
    expect(r[1].info?.service).toBe('Kerberos')
    expect(r[3].version).toBe('')
  })

  it('salida grepable (-oG)', () => {
    const line = 'Host: 10.0.0.5 ()\tPorts: 22/open/tcp//ssh//OpenSSH 8.9p1 Ubuntu/, 80/open/tcp//http//nginx 1.18.0/, 8081/closed/tcp//blackice-icecap///\tIgnored State: closed (997)'
    const r = parseNmap(line)
    expect(r.map((p) => p.port)).toEqual([22, 80])
    expect(r[0]).toMatchObject({ service: 'ssh', version: 'OpenSSH 8.9p1 Ubuntu' })
  })

  it('un puerto sin ficha se devuelve igual, sin info', () => {
    const [p] = parseNmap('31337/tcp open  Elite')
    expect(p.port).toBe(31337)
    expect(p.info).toBeUndefined()
  })
})

describe('flashcards', () => {
  it('no repite el puerto anterior', () => {
    for (let i = 0; i < 50; i++) expect(pickCard(22).port).not.toBe(22)
  })
  it('es determinista con un random inyectado', () => {
    expect(pickCard(undefined, () => 0)).toBe(PORTS[0])
  })
})
