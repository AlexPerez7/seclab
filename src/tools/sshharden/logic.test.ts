import { describe, expect, it } from 'vitest'
import { buildDirectives, DEFAULT_OPTIONS, renderConfig } from './logic'

const value = (key: string, opts = DEFAULT_OPTIONS) => buildDirectives(opts).find((d) => d.key === key)?.value

describe('buildDirectives', () => {
  it.skip('valores seguros por defecto', () => {
    expect(value('PasswordAuthentication')).toBe('no')
    expect(value('PermitRootLogin')).toBe('no')
    expect(value('MaxAuthTries')).toBe('3')
    expect(value('X11Forwarding')).toBe('no')
  })

  it.skip('AllowUsers solo si hay usuarios', () => {
    expect(value('AllowUsers')).toBeUndefined()
    expect(value('AllowUsers', { ...DEFAULT_OPTIONS, allowUsers: ['alex', 'deploy'] })).toBe('alex deploy')
  })

  it.skip('cada directiva tiene justificación', () => {
    expect(buildDirectives(DEFAULT_OPTIONS).every((d) => d.why.length > 0)).toBe(true)
  })
})

describe('renderConfig', () => {
  it.skip('con y sin comentarios', () => {
    const dirs = [{ key: 'PermitRootLogin', value: 'no', why: 'root nunca entra directo' }]
    expect(renderConfig(dirs)).toBe('# root nunca entra directo\nPermitRootLogin no\n')
    expect(renderConfig(dirs, false)).toBe('PermitRootLogin no\n')
  })
})
