import { describe, expect, it } from 'vitest'
import { generateAll, traversal } from './logic'

const unix = (encoding: 'plain' | 'url' | 'double' | 'overlong') =>
  traversal({ os: 'unix', depth: 3, encoding, target: 'etc/passwd' })

describe('traversal', () => {
  it.skip('unix sin codificar', () => {
    expect(unix('plain')).toBe('../../../etc/passwd')
  })
  it.skip('codificaciones', () => {
    expect(unix('url')).toBe('..%2f..%2f..%2fetc%2fpasswd')
    expect(unix('double')).toBe('..%252f..%252f..%252fetc%252fpasswd')
    expect(unix('overlong')).toBe('..%c0%af..%c0%af..%c0%afetc%c0%afpasswd')
  })
  it.skip('windows usa barra invertida', () => {
    expect(traversal({ os: 'windows', depth: 2, encoding: 'plain', target: 'windows/win.ini' })).toBe('..\\..\\windows\\win.ini')
  })
})

describe('generateAll', () => {
  it.skip('una variante por profundidad', () => {
    const all = generateAll('unix', 'plain', 'etc/passwd', 4)
    expect(all).toHaveLength(4)
    expect(all[0]).toBe('../etc/passwd')
    expect(all[3]).toBe('../../../../etc/passwd')
  })
})
