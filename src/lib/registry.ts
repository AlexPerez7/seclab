import type { LucideIcon } from 'lucide-react'
import {
  Hash, ScanSearch, ArrowLeftRight, KeyRound, Network, Server, Activity,
  FolderInput, TerminalSquare, Send, Gauge, Crosshair, ShieldCheck,
} from 'lucide-react'

/* Las herramientas se agrupan por ruta de estudio, no por tipo técnico:
   la idea es avanzar Fundamentos → Redes → Web → Defensa. */
export type Track = 'Fundamentos' | 'Redes' | 'Web' | 'Defensa'

export const TRACKS: Track[] = ['Fundamentos', 'Redes', 'Web', 'Defensa']

export type ToolStatus = 'pendiente' | 'en-progreso' | 'listo'

export interface Reference {
  label: string
  url: string
}

export interface ToolDef {
  /** Debe coincidir con el nombre de la carpeta en src/tools/. */
  id: string
  name: string
  desc: string
  track: Track
  status: ToolStatus
  icon: LucideIcon
  /** id de la herramienta equivalente en HackNexus (src/tools/<Nombre>.tsx), para consultar al portar. */
  origin?: string
  /** Fuentes primarias: contra estas se valida la lógica, no contra el código portado. */
  refs: Reference[]
}

export const TOOLS: ToolDef[] = [
  // ── Fundamentos ─────────────────────────────────────────────
  {
    id: 'hash', name: 'Hash Suite', track: 'Fundamentos', status: 'listo', icon: Hash, origin: 'Hash',
    desc: 'MD5 (implementado a mano), SHA-1, SHA-2 y HMAC de texto y archivos, con demo del efecto avalancha',
    refs: [
      { label: 'FIPS 180-4 (SHA)', url: 'https://csrc.nist.gov/pubs/fips/180-4/upd1/final' },
      { label: 'RFC 1321 (MD5)', url: 'https://www.rfc-editor.org/rfc/rfc1321' },
      { label: 'RFC 2104 (HMAC)', url: 'https://www.rfc-editor.org/rfc/rfc2104' },
    ],
  },
  {
    id: 'hashid', name: 'HashID', track: 'Fundamentos', status: 'listo', icon: ScanSearch, origin: 'Hashid',
    desc: 'Identifica el formato de un hash (crypt, Windows/AD, Kerberos, hex) con su modo de hashcat y formato de John',
    refs: [
      { label: 'hashcat example hashes', url: 'https://hashcat.net/wiki/doku.php?id=example_hashes' },
    ],
  },
  {
    id: 'encoders', name: 'Encoders', track: 'Fundamentos', status: 'listo', icon: ArrowLeftRight, origin: 'Encoders',
    desc: 'Base64, hex, URL y binario en ambos sentidos (herramienta de referencia del patrón)',
    refs: [
      { label: 'RFC 4648 (Base16/32/64)', url: 'https://www.rfc-editor.org/rfc/rfc4648' },
      { label: 'RFC 3986 (URI)', url: 'https://www.rfc-editor.org/rfc/rfc3986' },
    ],
  },
  {
    id: 'jwt', name: 'JWT Toolkit', track: 'Fundamentos', status: 'listo', icon: KeyRound, origin: 'Jwt',
    desc: 'Decodifica, verifica y firma JWT HS256, y muestra los ataques clásicos (alg=none, secret débil)',
    refs: [
      { label: 'RFC 7519 (JWT)', url: 'https://www.rfc-editor.org/rfc/rfc7519' },
      { label: 'RFC 7515 (JWS)', url: 'https://www.rfc-editor.org/rfc/rfc7515' },
      { label: 'RFC 8725 (JWT BCP)', url: 'https://www.rfc-editor.org/rfc/rfc8725' },
    ],
  },

  // ── Redes ───────────────────────────────────────────────────
  {
    id: 'subnetting', name: 'Subnetting & VLSM', track: 'Redes', status: 'listo', icon: Network, origin: 'Subnetting',
    desc: 'Calculadora IPv4/CIDR con vista binaria, reparto VLSM y ejercicios de práctica',
    refs: [
      { label: 'RFC 4632 (CIDR)', url: 'https://www.rfc-editor.org/rfc/rfc4632' },
      { label: 'RFC 1918 (privadas)', url: 'https://www.rfc-editor.org/rfc/rfc1918' },
      { label: 'RFC 3021 (/31)', url: 'https://www.rfc-editor.org/rfc/rfc3021' },
    ],
  },
  {
    id: 'ports', name: 'Puertos & Servicios', track: 'Redes', status: 'listo', icon: Server, origin: 'Ports',
    desc: 'Referencia de ~60 puertos con pentest y defensa, anotador de salida de nmap y flashcards',
    refs: [
      { label: 'IANA Service Name and Port Registry', url: 'https://www.iana.org/assignments/service-names-port-numbers/service-names-port-numbers.xhtml' },
    ],
  },
  {
    id: 'pcap', name: 'PCAP Analyzer', track: 'Redes', status: 'pendiente', icon: Activity, origin: 'Pcap',
    desc: 'Parsea capturas pcap: cabeceras, protocolos, top talkers y DNS',
    refs: [
      { label: 'pcap-savefile(5)', url: 'https://www.tcpdump.org/manpages/pcap-savefile.5.txt' },
      { label: 'Wireshark: libpcap file format', url: 'https://wiki.wireshark.org/Development/LibpcapFileFormat' },
      { label: 'IETF pcapng draft', url: 'https://datatracker.ietf.org/doc/draft-ietf-opsawg-pcapng/' },
    ],
  },

  // ── Web ─────────────────────────────────────────────────────
  {
    id: 'pathtraversal', name: 'Path Traversal', track: 'Web', status: 'pendiente', icon: FolderInput, origin: 'PathTraversal',
    desc: 'Genera traversals por SO, profundidad y codificación, y explica cómo defenderse',
    refs: [
      { label: 'PortSwigger: Path traversal', url: 'https://portswigger.net/web-security/file-path-traversal' },
      { label: 'OWASP: Path Traversal', url: 'https://owasp.org/www-community/attacks/Path_Traversal' },
    ],
  },
  {
    id: 'cmdinject', name: 'Command Injection', track: 'Web', status: 'pendiente', icon: TerminalSquare, origin: 'CommandInjection',
    desc: 'Payloads de inyección de comandos por SO y técnica (visible, ciega por tiempo) con su detección',
    refs: [
      { label: 'PortSwigger: OS command injection', url: 'https://portswigger.net/web-security/os-command-injection' },
      { label: 'OWASP: Command Injection', url: 'https://owasp.org/www-community/attacks/Command_Injection' },
    ],
  },
  {
    id: 'httpheader', name: 'HTTP Request Builder', track: 'Web', status: 'pendiente', icon: Send, origin: 'Httpheader',
    desc: 'Construye peticiones HTTP crudas y su equivalente curl',
    refs: [
      { label: 'RFC 9110 (HTTP Semantics)', url: 'https://www.rfc-editor.org/rfc/rfc9110' },
      { label: 'RFC 9112 (HTTP/1.1)', url: 'https://www.rfc-editor.org/rfc/rfc9112' },
    ],
  },

  // ── Defensa ─────────────────────────────────────────────────
  {
    id: 'cvss', name: 'Calculadora CVSS 3.1', track: 'Defensa', status: 'pendiente', icon: Gauge, origin: 'Cvss',
    desc: 'Puntuación base CVSS 3.1 desde el vector, con la explicación de cada métrica',
    refs: [
      { label: 'FIRST: CVSS v3.1 Specification', url: 'https://www.first.org/cvss/v3.1/specification-document' },
      { label: 'FIRST: calculadora oficial', url: 'https://www.first.org/cvss/calculator/3.1' },
    ],
  },
  {
    id: 'mitre', name: 'MITRE ATT&CK', track: 'Defensa', status: 'pendiente', icon: Crosshair, origin: 'Mitre',
    desc: 'Explorador de tácticas y técnicas ATT&CK Enterprise con búsqueda y notas de detección',
    refs: [
      { label: 'MITRE ATT&CK', url: 'https://attack.mitre.org/' },
      { label: 'attack-stix-data (datos oficiales)', url: 'https://github.com/mitre-attack/attack-stix-data' },
    ],
  },
  {
    id: 'sshharden', name: 'SSH Hardening', track: 'Defensa', status: 'pendiente', icon: ShieldCheck, origin: 'Sshharden',
    desc: 'Genera un sshd_config endurecido con la explicación de cada directiva',
    refs: [
      { label: 'sshd_config(5)', url: 'https://man.openbsd.org/sshd_config' },
      { label: 'ssh-audit hardening guides', url: 'https://www.ssh-audit.com/hardening_guides.html' },
    ],
  },
]

export const findTool = (id: string) => TOOLS.find((t) => t.id === id)
