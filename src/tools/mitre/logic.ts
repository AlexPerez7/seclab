import { notImplemented } from '@/lib/todo'

export interface Tactic {
  id: string
  name: string
  /** Nombre corto que usa ATT&CK en los datos STIX (kill_chain_phases). */
  shortName: string
}

export interface Technique {
  id: string
  name: string
  tactics: string[]
  /** Idea de detección propia, en español. Completar estudiando cada técnica. */
  detection: string
}

/* Las 14 tácticas de ATT&CK Enterprise, en el orden de la matriz. */
export const TACTICS: Tactic[] = [
  { id: 'TA0043', name: 'Reconnaissance', shortName: 'reconnaissance' },
  { id: 'TA0042', name: 'Resource Development', shortName: 'resource-development' },
  { id: 'TA0001', name: 'Initial Access', shortName: 'initial-access' },
  { id: 'TA0002', name: 'Execution', shortName: 'execution' },
  { id: 'TA0003', name: 'Persistence', shortName: 'persistence' },
  { id: 'TA0004', name: 'Privilege Escalation', shortName: 'privilege-escalation' },
  { id: 'TA0005', name: 'Defense Evasion', shortName: 'defense-evasion' },
  { id: 'TA0006', name: 'Credential Access', shortName: 'credential-access' },
  { id: 'TA0007', name: 'Discovery', shortName: 'discovery' },
  { id: 'TA0008', name: 'Lateral Movement', shortName: 'lateral-movement' },
  { id: 'TA0009', name: 'Collection', shortName: 'collection' },
  { id: 'TA0011', name: 'Command and Control', shortName: 'command-and-control' },
  { id: 'TA0010', name: 'Exfiltration', shortName: 'exfiltration' },
  { id: 'TA0040', name: 'Impact', shortName: 'impact' },
]

/* Semilla con técnicas relevantes para PAM. TODO: cargar el catálogo completo desde attack-stix-data
   (un script que genere un JSON reducido en src/data/, sin pedirlo en tiempo de ejecución). */
export const TECHNIQUES: Technique[] = [
  { id: 'T1078', name: 'Valid Accounts', tactics: ['initial-access', 'persistence', 'privilege-escalation', 'defense-evasion'], detection: 'Logins fuera de horario o de origen inusual; cuentas privilegiadas usadas fuera del PAM.' },
  { id: 'T1110', name: 'Brute Force', tactics: ['credential-access'], detection: 'Ráfagas de 4625 (Windows) o "Failed password" (Linux) desde un mismo origen.' },
  { id: 'T1003', name: 'OS Credential Dumping', tactics: ['credential-access'], detection: 'Acceso a la memoria de lsass.exe (Sysmon evento 10), copias de SAM/NTDS.dit.' },
  { id: 'T1059', name: 'Command and Scripting Interpreter', tactics: ['execution'], detection: 'PowerShell con -enc o descargas, script block logging (4104).' },
  { id: 'T1053.005', name: 'Scheduled Task', tactics: ['execution', 'persistence', 'privilege-escalation'], detection: 'Evento 4698 (tarea creada), schtasks /create desde procesos raros.' },
  { id: 'T1021.001', name: 'Remote Desktop Protocol', tactics: ['lateral-movement'], detection: 'Evento 4624 tipo 10; RDP directo que no pasa por el PSM.' },
  { id: 'T1558.003', name: 'Kerberoasting', tactics: ['credential-access'], detection: 'Evento 4769 con cifrado RC4 (0x17) para cuentas de servicio.' },
  { id: 'T1550.002', name: 'Pass the Hash', tactics: ['defense-evasion', 'lateral-movement'], detection: '4624 tipo 3 con NTLM desde estaciones que normalmente usan Kerberos.' },
]

/** Busca por id ("T1003"), nombre o texto de detección; opcionalmente por shortName de táctica. */
export function searchTechniques(query: string, tactic?: string): Technique[] {
  return notImplemented('searchTechniques', query, tactic)
}

/** Capa JSON importable en el ATT&CK Navigator oficial, con las técnicas marcadas. */
export function toNavigatorLayer(techniqueIds: string[], name: string): object {
  return notImplemented('toNavigatorLayer', techniqueIds, name)
}
