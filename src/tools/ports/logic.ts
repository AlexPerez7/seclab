import { notImplemented } from '@/lib/todo'

export type PortGroup = 'web' | 'remoto' | 'ad' | 'bbdd' | 'correo' | 'infra' | 'pam'

export interface PortInfo {
  port: number
  proto: 'tcp' | 'udp' | 'tcp/udp'
  service: string
  group: PortGroup
  /** Qué mirar o probar en un pentest y cómo se defiende. */
  pentest: string
}

/* Semilla inicial. TODO: completar contrastando con el registro de IANA y con lo que de verdad aparece en los labs. */
export const PORTS: PortInfo[] = [
  { port: 21, proto: 'tcp', service: 'FTP', group: 'infra', pentest: 'Login anónimo, credenciales en claro, versiones vulnerables (vsftpd 2.3.4).' },
  { port: 22, proto: 'tcp', service: 'SSH', group: 'remoto', pentest: 'Enumerar versión y algoritmos (ssh-audit), fuerza bruta si hay contraseña, claves reutilizadas.' },
  { port: 23, proto: 'tcp', service: 'Telnet', group: 'remoto', pentest: 'Todo en claro: credenciales capturables. No debería existir.' },
  { port: 25, proto: 'tcp', service: 'SMTP', group: 'correo', pentest: 'Open relay, enumeración de usuarios con VRFY/EXPN/RCPT TO.' },
  { port: 53, proto: 'tcp/udp', service: 'DNS', group: 'infra', pentest: 'Transferencia de zona (AXFR), subdominios, resolvers abiertos.' },
  { port: 80, proto: 'tcp', service: 'HTTP', group: 'web', pentest: 'Superficie web completa: directorios, tecnologías, cabeceras.' },
  { port: 88, proto: 'tcp/udp', service: 'Kerberos', group: 'ad', pentest: 'Indica un controlador de dominio. AS-REP roasting, Kerberoasting, enumeración de usuarios.' },
  { port: 110, proto: 'tcp', service: 'POP3', group: 'correo', pentest: 'Credenciales en claro sin STARTTLS.' },
  { port: 135, proto: 'tcp', service: 'MS-RPC', group: 'ad', pentest: 'Endpoint mapper: enumeración RPC (rpcclient, impacket).' },
  { port: 139, proto: 'tcp', service: 'NetBIOS-SSN', group: 'ad', pentest: 'SMB sobre NetBIOS: sesiones nulas, nombres de equipo.' },
  { port: 143, proto: 'tcp', service: 'IMAP', group: 'correo', pentest: 'Credenciales en claro sin STARTTLS.' },
  { port: 389, proto: 'tcp/udp', service: 'LDAP', group: 'ad', pentest: 'Bind anónimo, enumeración del directorio, LDAP signing desactivado.' },
  { port: 443, proto: 'tcp', service: 'HTTPS', group: 'web', pentest: 'Igual que 80 más el certificado: SAN con nombres internos, cifrados débiles.' },
  { port: 445, proto: 'tcp', service: 'SMB', group: 'ad', pentest: 'Shares, SMB signing, relay NTLM, vulnerabilidades históricas (MS17-010).' },
  { port: 636, proto: 'tcp', service: 'LDAPS', group: 'ad', pentest: 'LDAP sobre TLS: revisar el certificado y si LDAP plano sigue abierto.' },
  { port: 1433, proto: 'tcp', service: 'MS SQL Server', group: 'bbdd', pentest: 'Cuenta sa, xp_cmdshell, enlaces entre servidores.' },
  { port: 1858, proto: 'tcp', service: 'CyberArk Vault', group: 'pam', pentest: 'Protocolo propietario del Vault. Solo deberían alcanzarlo los componentes (PVWA, CPM, PSM), nunca la red de usuarios.' },
  { port: 3306, proto: 'tcp', service: 'MySQL / MariaDB', group: 'bbdd', pentest: 'root sin contraseña, exposición a internet, UDF para ejecutar comandos.' },
  { port: 3389, proto: 'tcp', service: 'RDP', group: 'remoto', pentest: 'NLA desactivado, BlueKeep (CVE-2019-0708), fuerza bruta. En PAM: acceso vía PSM.' },
  { port: 5432, proto: 'tcp', service: 'PostgreSQL', group: 'bbdd', pentest: 'Credenciales por defecto, COPY … FROM PROGRAM para ejecutar comandos.' },
  { port: 5985, proto: 'tcp', service: 'WinRM (HTTP)', group: 'remoto', pentest: 'Gestión remota de PowerShell (evil-winrm) con credenciales o hash.' },
  { port: 6379, proto: 'tcp', service: 'Redis', group: 'bbdd', pentest: 'Sin autenticación por defecto en versiones antiguas: escritura de ficheros, RCE.' },
]

/** Busca por número exacto, servicio o texto libre; opcionalmente filtra por grupo. */
export function searchPorts(query: string, group?: PortGroup): PortInfo[] {
  return notImplemented('searchPorts', query, group)
}
