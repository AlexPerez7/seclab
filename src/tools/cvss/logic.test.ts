import { describe, expect, it } from 'vitest'
import { baseScore, parseVector, roundUp, severity, toVector } from './logic'

/* Puntuaciones comprobables en la calculadora oficial: https://www.first.org/cvss/calculator/3.1 */
const score = (v: string) => baseScore(parseVector(v))

describe('roundUp (apéndice A de la spec)', () => {
  it.skip('ejemplos de la especificación', () => {
    expect(roundUp(4.02)).toBe(4.1)
    expect(roundUp(4.0)).toBe(4.0)
  })
})

describe('baseScore', () => {
  it.skip('RCE de red sin autenticación', () => {
    expect(score('CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H')).toBe(9.8)
  })
  it.skip('con cambio de scope llega a 10', () => {
    expect(score('CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H')).toBe(10.0)
  })
  it.skip('escalada de privilegios local', () => {
    expect(score('CVSS:3.1/AV:L/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H')).toBe(7.8)
  })
  it.skip('XSS reflejado típico', () => {
    expect(score('CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N')).toBe(6.1)
  })
  it.skip('sin impacto → 0', () => {
    expect(score('CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:N')).toBe(0)
  })
})

describe('vector y severidad', () => {
  it.skip('parse/toVector ida y vuelta', () => {
    const v = 'CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N'
    expect(toVector(parseVector(v))).toBe(v)
  })
  it.skip('rechaza vectores incompletos', () => {
    expect(() => parseVector('CVSS:3.1/AV:N/AC:L')).toThrow()
  })
  it.skip('límites de la escala cualitativa', () => {
    expect([0, 0.1, 3.9, 4.0, 6.9, 7.0, 8.9, 9.0, 10].map(severity)).toEqual([
      'Ninguna', 'Baja', 'Baja', 'Media', 'Media', 'Alta', 'Alta', 'Crítica', 'Crítica',
    ])
  })
})
