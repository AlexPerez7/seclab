import { describe, expect, it } from 'vitest'
import { buildRawRequest, toCurl } from './logic'

describe('buildRawRequest', () => {
  it.skip('GET mínimo con CRLF y línea vacía final', () => {
    expect(buildRawRequest({ method: 'GET', url: 'https://example.com/a?b=1', headers: [] })).toBe(
      'GET /a?b=1 HTTP/1.1\r\nHost: example.com\r\n\r\n',
    )
  })

  it.skip('puerto no estándar en el Host', () => {
    expect(buildRawRequest({ method: 'GET', url: 'http://lab.local:8080/', headers: [] })).toContain('Host: lab.local:8080\r\n')
  })

  it.skip('Content-Length en bytes, no en caracteres', () => {
    const raw = buildRawRequest({ method: 'POST', url: 'https://example.com/', headers: [], body: 'ñ' })
    expect(raw).toContain('Content-Length: 2\r\n')
    expect(raw.endsWith('\r\n\r\nñ')).toBe(true)
  })
})

describe('toCurl', () => {
  it.skip('POST con header y body', () => {
    expect(
      toCurl({
        method: 'POST',
        url: 'https://example.com/login',
        headers: [['Content-Type', 'application/x-www-form-urlencoded']],
        body: 'user=alex',
      }),
    ).toBe("curl -X POST 'https://example.com/login' -H 'Content-Type: application/x-www-form-urlencoded' --data-raw 'user=alex'")
  })

  it.skip('escapa comillas simples', () => {
    expect(toCurl({ method: 'POST', url: 'https://example.com/', headers: [], body: "it's" })).toContain(`--data-raw 'it'\\''s'`)
  })
})
