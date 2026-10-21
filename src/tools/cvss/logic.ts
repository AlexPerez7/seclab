import { notImplemented } from '@/lib/todo'

export interface CvssMetrics {
  AV: 'N' | 'A' | 'L' | 'P'
  AC: 'L' | 'H'
  PR: 'N' | 'L' | 'H'
  UI: 'N' | 'R'
  S: 'U' | 'C'
  C: 'N' | 'L' | 'H'
  I: 'N' | 'L' | 'H'
  A: 'N' | 'L' | 'H'
}

export type Severity = 'Ninguna' | 'Baja' | 'Media' | 'Alta' | 'Crítica'

/** Nombre y pregunta que responde cada métrica, para la UI (spec §2). */
export const METRIC_INFO: Record<keyof CvssMetrics, { name: string; question: string }> = {
  AV: { name: 'Attack Vector', question: '¿Desde dónde puede atacar? Red, red adyacente, local o con acceso físico.' },
  AC: { name: 'Attack Complexity', question: '¿Hacen falta condiciones fuera del control del atacante?' },
  PR: { name: 'Privileges Required', question: '¿Qué privilegios necesita antes de atacar?' },
  UI: { name: 'User Interaction', question: '¿Necesita que una víctima haga algo (un clic, abrir un archivo)?' },
  S: { name: 'Scope', question: '¿El impacto sale del componente vulnerable (p. ej. escapar de un sandbox)?' },
  C: { name: 'Confidentiality', question: '¿Cuánta información puede leer?' },
  I: { name: 'Integrity', question: '¿Cuánto puede modificar?' },
  A: { name: 'Availability', question: '¿Cuánto puede degradar el servicio?' },
}

/** "CVSS:3.1/AV:N/AC:L/…" → métricas. Lanza un error si falta alguna o tiene un valor inválido. */
export function parseVector(vector: string): CvssMetrics {
  return notImplemented('parseVector', vector)
}

export function toVector(m: CvssMetrics): string {
  return notImplemented('toVector', m)
}

/** Función Roundup de la especificación 3.1 (apéndice A): evita errores de coma flotante. */
export function roundUp(x: number): number {
  return notImplemented('roundUp', x)
}

/** Base score según §7.1, con los pesos de §7.4 (ojo: PR pesa distinto si Scope = Changed). */
export function baseScore(m: CvssMetrics): number {
  return notImplemented('baseScore', m)
}

/** Escala cualitativa (§5): 0 Ninguna, 0.1–3.9 Baja, 4.0–6.9 Media, 7.0–8.9 Alta, 9.0–10 Crítica. */
export function severity(score: number): Severity {
  return notImplemented('severity', score)
}
