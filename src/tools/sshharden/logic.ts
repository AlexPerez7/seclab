import { notImplemented } from '@/lib/todo'

export interface SshOptions {
  port: number
  /** Vacío = sin restricción por usuario. */
  allowUsers: string[]
  passwordAuth: boolean
  rootLogin: 'no' | 'prohibit-password'
  x11Forwarding: boolean
  tcpForwarding: boolean
  maxAuthTries: number
  /** Solo algoritmos modernos (curve25519, chacha20-poly1305, AES-GCM, ETM MACs). */
  modernCryptoOnly: boolean
}

export const DEFAULT_OPTIONS: SshOptions = {
  port: 22,
  allowUsers: [],
  passwordAuth: false,
  rootLogin: 'no',
  x11Forwarding: false,
  tcpForwarding: false,
  maxAuthTries: 3,
  modernCryptoOnly: true,
}

export interface Directive {
  key: string
  value: string
  /** Por qué se pone, en una frase. Aparece como comentario en el fichero. */
  why: string
}

/** Opciones → lista de directivas de sshd_config(5) con su justificación. */
export function buildDirectives(opts: SshOptions): Directive[] {
  return notImplemented('buildDirectives', opts)
}

/** Texto final del fichero. Con `withComments`, cada directiva va precedida de "# <why>". */
export function renderConfig(directives: Directive[], withComments = true): string {
  return notImplemented('renderConfig', directives, withComments)
}
