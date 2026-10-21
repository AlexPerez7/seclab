import { notImplemented } from '@/lib/todo'

export type PtOs = 'unix' | 'windows'
export type PtEncoding = 'plain' | 'url' | 'double' | 'overlong'

export const ENCODING_LABEL: Record<PtEncoding, string> = {
  plain: 'sin codificar',
  url: 'URL-encode del separador',
  double: 'doble URL-encode',
  overlong: 'UTF-8 overlong (%c0%af)',
}

/** Ficheros que vale la pena leer, con el porqué. */
export const TARGETS: Record<PtOs, { path: string; why: string }[]> = {
  unix: [
    { path: 'etc/passwd', why: 'Legible por todos: confirma la vulnerabilidad y enumera usuarios.' },
    { path: 'etc/hosts', why: 'Nombres internos de la red.' },
    { path: 'proc/self/environ', why: 'Variables de entorno del proceso: a veces secrets o claves.' },
    { path: 'proc/self/cmdline', why: 'Cómo se lanzó la aplicación: rutas y ficheros de configuración.' },
  ],
  windows: [
    { path: 'windows/win.ini', why: 'Existe en casi cualquier Windows: confirma la vulnerabilidad.' },
    { path: 'windows/system32/drivers/etc/hosts', why: 'Nombres internos de la red.' },
    { path: 'inetpub/wwwroot/web.config', why: 'Configuración de IIS: cadenas de conexión y claves.' },
  ],
}

export interface PtOptions {
  os: PtOs
  /** Cuántos `../` anteponer. */
  depth: number
  encoding: PtEncoding
  /** Ruta relativa a la raíz, sin barra inicial: "etc/passwd". */
  target: string
}

/**
 * Construye el payload. Convención:
 * - el separador es `/` en unix y `\` en windows;
 * - `url` codifica solo los separadores (`..%2f`), `double` codifica también el `%` (`..%252f`);
 * - `overlong` usa la secuencia UTF-8 inválida de "/" (`..%c0%af`), histórica en IIS.
 */
export function traversal(opts: PtOptions): string {
  return notImplemented('traversal', opts)
}

/** Todas las combinaciones de profundidad 1..maxDepth para un objetivo. */
export function generateAll(os: PtOs, encoding: PtEncoding, target: string, maxDepth = 8): string[] {
  return notImplemented('generateAll', os, encoding, target, maxDepth)
}
