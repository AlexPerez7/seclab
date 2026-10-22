/* Referencia de puertos con ángulo de pentest y de defensa.
   Números y protocolos contrastados con el registro de IANA; las notas son propias. */

export type PortGroup = 'web' | 'remoto' | 'ad' | 'bbdd' | 'correo' | 'infra' | 'devops' | 'pam'

export const GROUP_LABEL: Record<PortGroup, string> = {
  web: 'Web',
  remoto: 'Acceso remoto',
  ad: 'Windows / AD',
  bbdd: 'Bases de datos',
  correo: 'Correo',
  infra: 'Infraestructura',
  devops: 'Contenedores y DevOps',
  pam: 'PAM y secretos',
}

export interface PortInfo {
  port: number
  proto: 'tcp' | 'udp' | 'tcp/udp'
  service: string
  group: PortGroup
  /** Qué mirar o probar en un pentest. */
  pentest: string
  /** Cómo se protege. */
  defense: string
}

export const PORTS: PortInfo[] = [
  // ── Web ──
  { port: 80, proto: 'tcp', service: 'HTTP', group: 'web', pentest: 'Superficie web completa: directorios, tecnologías, formularios, cabeceras.', defense: 'Redirigir a HTTPS y no servir nada sensible en claro.' },
  { port: 443, proto: 'tcp', service: 'HTTPS', group: 'web', pentest: 'Igual que 80, más el certificado: el SAN suele revelar nombres internos.', defense: 'TLS 1.2+ con cifrados modernos y HSTS.' },
  { port: 8080, proto: 'tcp', service: 'HTTP alternativo', group: 'web', pentest: 'Paneles de administración, proxies y servidores de aplicaciones (Tomcat, Jenkins).', defense: 'No exponer paneles de gestión; autenticación fuerte.' },
  { port: 8443, proto: 'tcp', service: 'HTTPS alternativo', group: 'web', pentest: 'Consolas de gestión (firewalls, hipervisores, appliances).', defense: 'Restringir por red de gestión.' },

  // ── Acceso remoto ──
  { port: 22, proto: 'tcp', service: 'SSH', group: 'remoto', pentest: 'Versión y algoritmos (ssh-audit), fuerza bruta si acepta contraseña, claves reutilizadas.', defense: 'Solo claves, sin root directo, MaxAuthTries bajo (ver SSH Hardening).' },
  { port: 23, proto: 'tcp', service: 'Telnet', group: 'remoto', pentest: 'Todo viaja en claro, credenciales incluidas. Habitual en equipos de red antiguos.', defense: 'Deshabilitar y usar SSH.' },
  { port: 3389, proto: 'tcp', service: 'RDP', group: 'remoto', pentest: 'NLA desactivado, BlueKeep (CVE-2019-0708), fuerza bruta y password spraying.', defense: 'NLA, no exponer a internet, acceso a través de un PAM (PSM) o una VPN.' },
  { port: 5900, proto: 'tcp', service: 'VNC', group: 'remoto', pentest: 'A veces sin contraseña o con contraseña de 8 caracteres como máximo.', defense: 'Tunelizar por SSH o VPN; no exponer.' },
  { port: 5985, proto: 'tcp', service: 'WinRM (HTTP)', group: 'remoto', pentest: 'PowerShell remoto con credenciales o hash (evil-winrm).', defense: 'Limitar a hosts de gestión; preferir 5986 (HTTPS).' },
  { port: 5986, proto: 'tcp', service: 'WinRM (HTTPS)', group: 'remoto', pentest: 'Igual que 5985, cifrado.', defense: 'Limitar a hosts de gestión.' },
  { port: 1194, proto: 'udp', service: 'OpenVPN', group: 'remoto', pentest: 'Identificar el producto; configuraciones con autenticación solo por contraseña.', defense: 'Certificados de cliente y MFA.' },
  { port: 51820, proto: 'udp', service: 'WireGuard', group: 'remoto', pentest: 'No responde a paquetes no autenticados: difícil de detectar con un escaneo.', defense: 'Diseño seguro por defecto; proteger las claves privadas.' },

  // ── Windows / Active Directory ──
  { port: 53, proto: 'tcp/udp', service: 'DNS', group: 'infra', pentest: 'Transferencia de zona (AXFR), enumeración de subdominios, resolvers abiertos. En AD, cada DC suele ser DNS.', defense: 'Restringir AXFR a los secundarios; no ofrecer recursión a internet.' },
  { port: 88, proto: 'tcp/udp', service: 'Kerberos', group: 'ad', pentest: 'Delata un controlador de dominio. Enumeración de usuarios, AS-REP roasting y Kerberoasting.', defense: 'Contraseñas largas en cuentas de servicio (o gMSA), AES en lugar de RC4.' },
  { port: 135, proto: 'tcp', service: 'MS-RPC (Endpoint Mapper)', group: 'ad', pentest: 'Enumeración RPC con rpcclient o impacket; da paso a los puertos RPC dinámicos (49152–65535).', defense: 'Filtrar entre segmentos; solo desde redes de gestión.' },
  { port: 137, proto: 'udp', service: 'NetBIOS Name Service', group: 'ad', pentest: 'Nombres de equipo y dominio; envenenamiento NBT-NS con Responder.', defense: 'Deshabilitar NetBIOS sobre TCP/IP.' },
  { port: 139, proto: 'tcp', service: 'NetBIOS Session (SMB antiguo)', group: 'ad', pentest: 'SMB sobre NetBIOS: sesiones nulas, recursos compartidos.', defense: 'Deshabilitar NetBIOS; usar solo 445.' },
  { port: 389, proto: 'tcp/udp', service: 'LDAP', group: 'ad', pentest: 'Bind anónimo, enumeración completa del directorio (BloodHound), relay a LDAP si no hay signing.', defense: 'LDAP signing y channel binding obligatorios.' },
  { port: 445, proto: 'tcp', service: 'SMB', group: 'ad', pentest: 'Recursos compartidos, SMB signing, relay NTLM, vulnerabilidades históricas (MS17-010).', defense: 'SMB signing obligatorio, SMBv1 deshabilitado, no exponer a internet.' },
  { port: 464, proto: 'tcp/udp', service: 'Kerberos kpasswd', group: 'ad', pentest: 'Cambio de contraseñas Kerberos; confirma un DC.', defense: 'Igual que Kerberos.' },
  { port: 593, proto: 'tcp', service: 'RPC sobre HTTP', group: 'ad', pentest: 'Endpoint mapper sobre HTTP; enumeración RPC alternativa.', defense: 'Filtrar si no se usa.' },
  { port: 636, proto: 'tcp', service: 'LDAPS', group: 'ad', pentest: 'LDAP sobre TLS: revisar el certificado y si LDAP plano sigue abierto.', defense: 'Certificado válido; forzar LDAPS o signing.' },
  { port: 3268, proto: 'tcp', service: 'Global Catalog (LDAP)', group: 'ad', pentest: 'Consulta todo el bosque, no solo el dominio.', defense: 'Mismas medidas que LDAP.' },
  { port: 3269, proto: 'tcp', service: 'Global Catalog (LDAPS)', group: 'ad', pentest: 'Global Catalog sobre TLS.', defense: 'Mismas medidas que LDAPS.' },
  { port: 5355, proto: 'udp', service: 'LLMNR', group: 'ad', pentest: 'Envenenamiento con Responder para capturar hashes NetNTLMv2.', defense: 'Deshabilitar LLMNR por GPO.' },
  { port: 9389, proto: 'tcp', service: 'AD Web Services', group: 'ad', pentest: 'Lo usa el módulo ActiveDirectory de PowerShell; enumeración del dominio.', defense: 'Solo desde redes de administración.' },

  // ── Bases de datos ──
  { port: 1433, proto: 'tcp', service: 'Microsoft SQL Server', group: 'bbdd', pentest: 'Cuenta sa, xp_cmdshell, enlaces entre servidores, autenticación Windows.', defense: 'Deshabilitar sa y xp_cmdshell; cuentas con mínimo privilegio.' },
  { port: 1434, proto: 'udp', service: 'SQL Server Browser', group: 'bbdd', pentest: 'Lista las instancias de SQL Server y sus puertos.', defense: 'Deshabilitar si no se necesita.' },
  { port: 1521, proto: 'tcp', service: 'Oracle TNS Listener', group: 'bbdd', pentest: 'Enumeración de SIDs, cuentas por defecto.', defense: 'Contraseña en el listener; eliminar cuentas por defecto.' },
  { port: 3306, proto: 'tcp', service: 'MySQL / MariaDB', group: 'bbdd', pentest: 'root sin contraseña, exposición a internet, UDF para ejecutar comandos.', defense: 'bind-address local; usuarios con mínimo privilegio.' },
  { port: 5432, proto: 'tcp', service: 'PostgreSQL', group: 'bbdd', pentest: 'Credenciales por defecto; COPY … FROM PROGRAM ejecuta comandos como superusuario.', defense: 'pg_hba.conf restrictivo; nada de superusuario para la aplicación.' },
  { port: 6379, proto: 'tcp', service: 'Redis', group: 'bbdd', pentest: 'Sin autenticación por defecto en versiones antiguas: escritura de ficheros y RCE.', defense: 'requirepass o ACL, protected-mode, no exponer.' },
  { port: 9200, proto: 'tcp', service: 'Elasticsearch', group: 'bbdd', pentest: 'API HTTP; versiones antiguas sin autenticación y con datos expuestos.', defense: 'Seguridad activada (usuarios y TLS); no exponer.' },
  { port: 11211, proto: 'tcp/udp', service: 'Memcached', group: 'bbdd', pentest: 'Sin autenticación; en UDP se usó para ataques DDoS de amplificación.', defense: 'Escuchar solo en local; deshabilitar UDP.' },
  { port: 27017, proto: 'tcp', service: 'MongoDB', group: 'bbdd', pentest: 'Instancias sin autenticación, causa de muchas filtraciones masivas.', defense: 'Autenticación habilitada; bindIp local.' },

  // ── Correo ──
  { port: 25, proto: 'tcp', service: 'SMTP', group: 'correo', pentest: 'Open relay; enumeración de usuarios con VRFY, EXPN y RCPT TO.', defense: 'Sin relay abierto; SPF, DKIM y DMARC.' },
  { port: 110, proto: 'tcp', service: 'POP3', group: 'correo', pentest: 'Credenciales en claro sin STARTTLS.', defense: 'Usar 995 (TLS).' },
  { port: 143, proto: 'tcp', service: 'IMAP', group: 'correo', pentest: 'Credenciales en claro sin STARTTLS.', defense: 'Usar 993 (TLS).' },
  { port: 465, proto: 'tcp', service: 'SMTPS', group: 'correo', pentest: 'Envío autenticado sobre TLS: password spraying.', defense: 'MFA o contraseñas de aplicación; bloqueo por intentos.' },
  { port: 587, proto: 'tcp', service: 'SMTP Submission', group: 'correo', pentest: 'Envío autenticado con STARTTLS: password spraying.', defense: 'Exigir STARTTLS y autenticación.' },
  { port: 993, proto: 'tcp', service: 'IMAPS', group: 'correo', pentest: 'Password spraying contra buzones.', defense: 'MFA o autenticación moderna (OAuth).' },
  { port: 995, proto: 'tcp', service: 'POP3S', group: 'correo', pentest: 'Password spraying contra buzones.', defense: 'MFA o autenticación moderna (OAuth).' },

  // ── Infraestructura ──
  { port: 21, proto: 'tcp', service: 'FTP', group: 'infra', pentest: 'Login anónimo, credenciales en claro, versiones vulnerables (vsftpd 2.3.4).', defense: 'SFTP en su lugar; si no, FTPS y sin anónimo.' },
  { port: 67, proto: 'udp', service: 'DHCP (servidor)', group: 'infra', pentest: 'Servidor DHCP falso (rogue) para hacer MITM.', defense: 'DHCP snooping en los switches.' },
  { port: 69, proto: 'udp', service: 'TFTP', group: 'infra', pentest: 'Sin autenticación: descargar configuraciones de equipos de red o imágenes PXE.', defense: 'Limitar a la red de gestión.' },
  { port: 111, proto: 'tcp/udp', service: 'rpcbind / portmapper', group: 'infra', pentest: 'Lista los servicios RPC de Unix, entre ellos NFS.', defense: 'Filtrar si no se usa NFS.' },
  { port: 123, proto: 'udp', service: 'NTP', group: 'infra', pentest: 'monlist en servidores antiguos (amplificación DDoS). La hora importa: Kerberos falla con más de 5 min de desfase.', defense: 'Deshabilitar monlist; fuentes de hora autenticadas.' },
  { port: 161, proto: 'udp', service: 'SNMP', group: 'infra', pentest: 'Comunidades por defecto (public/private): inventario completo y a veces escritura de la configuración.', defense: 'SNMPv3 con autenticación y cifrado; nada de "public".' },
  { port: 162, proto: 'udp', service: 'SNMP Trap', group: 'infra', pentest: 'Recepción de alertas; revela el sistema de monitorización.', defense: 'SNMPv3.' },
  { port: 500, proto: 'udp', service: 'IKE (VPN IPsec)', group: 'infra', pentest: 'Identificar el fabricante; modo agresivo con PSK permite crackear la clave offline.', defense: 'Sin modo agresivo; IKEv2 con certificados.' },
  { port: 514, proto: 'udp', service: 'Syslog', group: 'infra', pentest: 'Sin autenticación: se pueden inyectar logs falsos.', defense: 'Syslog sobre TLS (6514) y limitar emisores.' },
  { port: 623, proto: 'udp', service: 'IPMI', group: 'infra', pentest: 'Gestión fuera de banda (iLO, iDRAC): el protocolo filtra el hash de la contraseña (RAKP).', defense: 'Red de gestión aislada; cambiar credenciales por defecto.' },
  { port: 873, proto: 'tcp', service: 'rsync', group: 'infra', pentest: 'Módulos sin autenticación: lectura o escritura de ficheros.', defense: 'Autenticación por módulo o rsync sobre SSH.' },
  { port: 2049, proto: 'tcp/udp', service: 'NFS', group: 'infra', pentest: 'Exports a todo el mundo; no_root_squash permite escalar privilegios.', defense: 'Exports por host y root_squash.' },
  { port: 5353, proto: 'udp', service: 'mDNS', group: 'infra', pentest: 'Descubre equipos y servicios de la red local; envenenamiento como LLMNR.', defense: 'Deshabilitar en servidores.' },
  { port: 9100, proto: 'tcp', service: 'Impresión RAW (JetDirect)', group: 'infra', pentest: 'Impresoras: lectura de trabajos y ficheros con PJL.', defense: 'Aislar impresoras en su propia VLAN.' },

  // ── Contenedores y DevOps ──
  { port: 2375, proto: 'tcp', service: 'Docker API (sin TLS)', group: 'devops', pentest: 'Acceso sin autenticación = root en el host (montar / en un contenedor).', defense: 'No exponer nunca; usar el socket local o 2376 con TLS mutuo.' },
  { port: 2376, proto: 'tcp', service: 'Docker API (TLS)', group: 'devops', pentest: 'Comprobar si exige certificado de cliente.', defense: 'TLS mutuo obligatorio.' },
  { port: 6443, proto: 'tcp', service: 'Kubernetes API server', group: 'devops', pentest: 'Acceso anónimo, tokens de service account filtrados, RBAC laxo.', defense: 'Sin acceso anónimo; RBAC mínimo; no exponer a internet.' },
  { port: 10250, proto: 'tcp', service: 'Kubelet API', group: 'devops', pentest: 'Si permite acceso anónimo, ejecuta comandos en cualquier pod del nodo.', defense: 'anonymous-auth=false y autorización Webhook.' },
  { port: 5672, proto: 'tcp', service: 'AMQP (RabbitMQ)', group: 'devops', pentest: 'Credenciales por defecto guest/guest; mensajes con datos sensibles.', defense: 'Eliminar guest; TLS.' },

  // ── PAM y secretos ──
  { port: 1858, proto: 'tcp', service: 'CyberArk Vault', group: 'pam', pentest: 'Protocolo propietario del Vault. Si lo alcanza la red de usuarios, la segmentación falla.', defense: 'Solo los componentes (PVWA, CPM, PSM) y la réplica de DR deben llegar a él.' },
  { port: 8200, proto: 'tcp', service: 'HashiCorp Vault', group: 'pam', pentest: 'API y UI; tokens filtrados, políticas demasiado amplias, estado sellado o no.', defense: 'TLS, políticas mínimas, auditoría activada.' },
]

/** Busca por número exacto, servicio o texto libre (también en las notas); opcionalmente filtra por grupo. */
export function searchPorts(query: string, group?: PortGroup): PortInfo[] {
  const q = query.trim().toLowerCase()
  return PORTS.filter((p) => {
    if (group && p.group !== group) return false
    if (!q) return true
    if (/^\d+$/.test(q)) return p.port === Number(q)
    return [p.service, p.pentest, p.defense, GROUP_LABEL[p.group]].some((s) => s.toLowerCase().includes(q))
  }).sort((a, b) => a.port - b.port)
}

export const findPort = (port: number, proto?: string): PortInfo | undefined =>
  PORTS.find((p) => p.port === port && (!proto || p.proto.includes(proto)))

// ── Salida de nmap ────────────────────────────────────────────

export interface NmapPort {
  port: number
  proto: 'tcp' | 'udp'
  state: string
  service: string
  version: string
  info?: PortInfo
}

/**
 * Lee la salida normal de nmap (`22/tcp open ssh OpenSSH 8.9p1`) o la grepable (-oG, `Ports: 22/open/tcp//ssh//OpenSSH 8.9p1/`).
 * Devuelve solo los puertos abiertos (incluye open|filtered), anotados con su ficha si existe.
 */
export function parseNmap(text: string): NmapPort[] {
  const out: NmapPort[] = []
  const add = (port: number, proto: string, state: string, service: string, version: string) => {
    if (!state.startsWith('open')) return
    out.push({ port, proto: proto as 'tcp' | 'udp', state, service, version: version.trim(), info: findPort(port, proto) })
  }

  for (const line of text.split(/\r?\n/)) {
    const normal = /^\s*(\d+)\/(tcp|udp)\s+(\S+)\s+(\S+)\s*(.*)$/.exec(line)
    if (normal) {
      add(Number(normal[1]), normal[2], normal[3], normal[4], normal[5])
      continue
    }
    const grep = /Ports:\s*(.+?)(?:\t|$)/.exec(line)
    if (grep) {
      for (const entry of grep[1].split(/,\s*/)) {
        const [port, state, proto, , service, , version] = entry.split('/')
        if (port && state && proto) add(Number(port), proto, state, service ?? '', version ?? '')
      }
    }
  }
  return out
}

// ── Flashcards ────────────────────────────────────────────────

/** Un puerto al azar para la siguiente tarjeta, distinto del anterior. `random` es inyectable para los tests. */
export function pickCard(exclude?: number, random: () => number = Math.random): PortInfo {
  const pool = PORTS.filter((p) => p.port !== exclude)
  return pool[Math.floor(random() * pool.length)]
}
