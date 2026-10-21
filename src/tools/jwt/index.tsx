import { useEffect, useMemo, useState } from 'react'
import clsx from 'clsx'
import { Card, CopyButton, Field, ToolHeader } from '@/components/ui'
import { findTool } from '@/lib/registry'
import {
  auditJwt, COMMON_SECRETS, crackSecret, decodeJwt, forgeNone, formatClaimDate, HS_ALGS, isHsAlg,
  NONE_VARIANTS, signHs, verifyHs, type DecodedJwt, type FindingLevel, type JwtHsAlg,
} from './logic'

const tool = findTool('jwt')!

// Token de ejemplo de jwt.io (secret: "your-256-bit-secret").
const SAMPLE =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

type Tab = 'decodificar' | 'firmar' | 'ataques'
const TABS: Tab[] = ['decodificar', 'firmar', 'ataques']

const PART_COLORS = ['text-bad', 'text-[#c084fc]', 'text-info'] as const
const DATE_CLAIMS = ['exp', 'iat', 'nbf']

const LEVEL_STYLE: Record<FindingLevel, string> = {
  crítico: 'border-bad/50 text-bad',
  alto: 'border-bad/30 text-bad',
  medio: 'border-warn/40 text-warn',
  info: 'border-edge text-muted',
}

const pretty = (o: unknown) => JSON.stringify(o, null, 2)

function parseObject(text: string): Record<string, unknown> {
  const v = JSON.parse(text) as unknown
  if (typeof v !== 'object' || v === null || Array.isArray(v)) throw new Error('Debe ser un objeto JSON')
  return v as Record<string, unknown>
}

function ColoredToken({ parts }: { parts: [string, string, string] }) {
  return (
    <code className="block break-all font-mono text-[13px] leading-relaxed">
      {parts.map((p, i) => (
        <span key={i}>
          {i > 0 && <span className="text-slate-500">.</span>}
          <span className={PART_COLORS[i]}>{p}</span>
        </span>
      ))}
    </code>
  )
}

function JsonBlock({ title, value, color, dates }: { title: string; value: Record<string, unknown>; color: string; dates?: boolean }) {
  return (
    <div className="min-w-0">
      <h3 className={clsx('mb-1.5 font-mono text-xs uppercase tracking-wider', color)}>{title}</h3>
      <pre className="overflow-x-auto rounded-lg border border-edge bg-black/40 p-3 font-mono text-[12.5px] text-slate-200">{pretty(value)}</pre>
      {dates && (
        <dl className="mt-2 space-y-0.5 font-mono text-xs">
          {DATE_CLAIMS.filter((k) => typeof value[k] === 'number').map((k) => (
            <div key={k} className="flex gap-2">
              <dt className="w-8 text-muted">{k}</dt>
              <dd className="text-slate-300">{formatClaimDate(value[k] as number)}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  )
}

function DecodeTab({ token, setToken, decoded, error }: { token: string; setToken: (t: string) => void; decoded: DecodedJwt | null; error: string | null }) {
  const [secret, setSecret] = useState('your-256-bit-secret')
  const [verified, setVerified] = useState<boolean | null>(null)
  const hs = decoded && isHsAlg(decoded.header.alg)

  useEffect(() => {
    let alive = true
    setVerified(null)
    if (!hs) return
    verifyHs(token, secret).then((ok) => alive && setVerified(ok), () => alive && setVerified(false))
    return () => {
      alive = false
    }
  }, [token, secret, hs])

  const findings = useMemo(() => (decoded ? auditJwt(decoded) : []), [decoded])

  return (
    <>
      <Card>
        <Field label="token (acepta el prefijo Bearer)">
          <textarea className="input h-28 resize-y" value={token} onChange={(e) => setToken(e.target.value)} spellCheck={false} />
        </Field>
        {error && <p className="mt-2 font-mono text-xs text-bad">{error}</p>}
        {decoded && (
          <div className="mt-3 rounded-lg border border-edge p-3">
            <ColoredToken parts={decoded.parts} />
          </div>
        )}
      </Card>

      {decoded && (
        <>
          <Card>
            <div className="grid gap-4 md:grid-cols-2">
              <JsonBlock title="header" value={decoded.header} color={PART_COLORS[0]} />
              <JsonBlock title="payload" value={decoded.payload} color={PART_COLORS[1]} dates />
            </div>
          </Card>

          <Card title="Verificar firma">
            {hs ? (
              <>
                <Field label={`secreto ${String(decoded.header.alg)}`}>
                  <input className="input" value={secret} onChange={(e) => setSecret(e.target.value)} spellCheck={false} />
                </Field>
                <p className={clsx('mt-2 font-mono text-sm', verified ? 'text-acento' : 'text-bad')}>
                  {verified === null ? '…' : verified ? '✓ firma válida con este secreto' : '✗ la firma no coincide'}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted">
                El token usa <code className="text-slate-200">{String(decoded.header.alg)}</code>. La herramienta solo verifica HS256/384/512
                (secreto compartido). RS*/ES* necesitan la clave pública del emisor.
              </p>
            )}
          </Card>

          <Card title="Auditoría">
            {findings.length === 0 ? (
              <p className="text-sm text-acento">Sin avisos.</p>
            ) : (
              <ul className="space-y-2">
                {findings.map((f) => (
                  <li key={f.message} className="flex gap-2 text-sm">
                    <span className={clsx('h-fit shrink-0 rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase', LEVEL_STYLE[f.level])}>{f.level}</span>
                    <span className="text-slate-300">{f.message}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      )}
    </>
  )
}

function SignTab({ decoded, onUse }: { decoded: DecodedJwt | null; onUse: (t: string) => void }) {
  const [alg, setAlg] = useState<JwtHsAlg>('HS256')
  const [payload, setPayload] = useState(() =>
    pretty(decoded?.payload ?? { sub: 'alex', role: 'user', iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 900 }),
  )
  const [secret, setSecret] = useState('una-clave-larga-y-aleatoria')
  const [out, setOut] = useState<{ token?: string; error?: string }>({})

  useEffect(() => {
    let alive = true
    let obj: Record<string, unknown>
    try {
      obj = parseObject(payload)
    } catch (e) {
      setOut({ error: `Payload: ${(e as Error).message}` })
      return
    }
    signHs(alg, obj, secret).then((token) => alive && setOut({ token }))
    return () => {
      alive = false
    }
  }, [alg, payload, secret])

  return (
    <Card>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {HS_ALGS.map((a) => (
          <button key={a} type="button" className={clsx('btn', alg === a && 'btn-active')} onClick={() => setAlg(a)}>{a}</button>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="payload (JSON)">
          <textarea className="input h-44 resize-y" value={payload} onChange={(e) => setPayload(e.target.value)} spellCheck={false} />
        </Field>
        <div>
          <Field label="secreto">
            <input className="input" value={secret} onChange={(e) => setSecret(e.target.value)} spellCheck={false} />
          </Field>
          <p className="mt-2 text-xs text-muted">
            Para {alg} el secreto debería tener al menos {Number(alg.slice(2)) / 8} bytes aleatorios (RFC 7518 §3.2). Una palabra no lo es.
          </p>
        </div>
      </div>
      <div className="mt-4">
        {out.error ? (
          <p className="font-mono text-xs text-bad">{out.error}</p>
        ) : (
          out.token && (
            <>
              <div className="rounded-lg border border-edge p-3"><ColoredToken parts={out.token.split('.') as [string, string, string]} /></div>
              <div className="mt-3 flex flex-wrap gap-2">
                <CopyButton text={out.token} />
                <button type="button" className="btn" onClick={() => onUse(out.token!)}>decodificar este token</button>
              </div>
            </>
          )
        )}
      </div>
    </Card>
  )
}

function AttacksTab({ token, decoded }: { token: string; decoded: DecodedJwt | null }) {
  const [payload, setPayload] = useState(() => pretty({ ...(decoded?.payload ?? {}), role: 'admin' }))
  const [variant, setVariant] = useState<(typeof NONE_VARIANTS)[number]>('none')
  const [list, setList] = useState<string[]>(COMMON_SECRETS)
  const [listName, setListName] = useState(`lista integrada (${COMMON_SECRETS.length})`)
  const [crack, setCrack] = useState<{ running: boolean; tried: number; found?: string | null; error?: string }>({ running: false, tried: 0 })

  const forged = useMemo(() => {
    if (!decoded) return { error: 'Primero decodifica un token válido' }
    try {
      return { token: forgeNone(token, parseObject(payload), variant) }
    } catch (e) {
      return { error: `Payload: ${(e as Error).message}` }
    }
  }, [token, decoded, payload, variant])

  const loadWordlist = async (file: File) => {
    const words = (await file.text()).split(/\r?\n/).filter(Boolean)
    setList(words)
    setListName(`${file.name} (${words.length.toLocaleString('es')})`)
  }

  const runCrack = async () => {
    setCrack({ running: true, tried: 0 })
    try {
      const found = await crackSecret(token, list, (tried) => setCrack((c) => ({ ...c, tried })))
      setCrack((c) => ({ ...c, running: false, found }))
    } catch (e) {
      setCrack({ running: false, tried: 0, error: (e as Error).message })
    }
  }

  return (
    <>
      <p className="mb-4 rounded-lg border border-warn/30 bg-warn/5 px-3 py-2 text-sm text-warn">
        Solo contra aplicaciones propias o con autorización. Los ataques usan el token de la pestaña decodificar.
      </p>

      <Card title="alg = none">
        <p className="mb-3 text-sm text-slate-300">
          Cambia el header a <code>"alg":"none"</code> y deja la firma vacía. Si el servidor acepta tokens sin firma, el payload se puede modificar a voluntad.
          Las variantes de mayúsculas saltan listas negras que comparan con <code>"none"</code> exacto.
        </p>
        <div className="mb-3 flex flex-wrap gap-1.5">
          {NONE_VARIANTS.map((v) => (
            <button key={v} type="button" className={clsx('btn', variant === v && 'btn-active')} onClick={() => setVariant(v)}>{v}</button>
          ))}
        </div>
        <Field label="payload a enviar">
          <textarea className="input h-32 resize-y" value={payload} onChange={(e) => setPayload(e.target.value)} spellCheck={false} />
        </Field>
        <div className="mt-3">
          {forged.error ? (
            <p className="font-mono text-xs text-bad">{forged.error}</p>
          ) : (
            <div className="flex items-start gap-2 rounded-lg border border-edge p-3">
              <code className="min-w-0 flex-1 break-all font-mono text-[12.5px] text-slate-200">{forged.token}</code>
              <CopyButton text={forged.token ?? ''} />
            </div>
          )}
        </div>
      </Card>

      <Card title="Secreto débil">
        <p className="mb-3 text-sm text-slate-300">
          Con un solo token HS* se puede probar secretos offline, sin tocar el servidor. Aquí se prueba una lista corta en el navegador;
          para listas grandes usa <code>hashcat -m 16500</code>.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-muted">{listName}</span>
          <label className="btn cursor-pointer">
            cargar wordlist (.txt)
            <input type="file" accept=".txt,text/plain" className="hidden" onChange={(e) => e.target.files?.[0] && loadWordlist(e.target.files[0])} />
          </label>
          <button type="button" className="btn" disabled={crack.running || !decoded} onClick={runCrack}>
            {crack.running ? 'probando…' : 'probar'}
          </button>
        </div>
        {(crack.running || crack.found !== undefined || crack.error) && (
          <div className="mt-3 font-mono text-sm">
            {crack.error && <p className="text-bad">{crack.error}</p>}
            {!crack.error && <p className="text-muted">probados: {crack.tried.toLocaleString('es')} / {list.length.toLocaleString('es')}</p>}
            {crack.found && <p className="text-acento">✓ secreto encontrado: <span className="text-white">{crack.found}</span></p>}
            {crack.found === null && <p className="text-slate-300">No está en la lista.</p>}
          </div>
        )}
      </Card>
    </>
  )
}

export default function Jwt() {
  const [tab, setTab] = useState<Tab>('decodificar')
  const [token, setToken] = useState(SAMPLE)

  const { decoded, error } = useMemo(() => {
    try {
      return { decoded: decodeJwt(token), error: null }
    } catch (e) {
      return { decoded: null, error: (e as Error).message }
    }
  }, [token])

  const openToken = (t: string) => {
    setToken(t)
    setTab('decodificar')
  }

  return (
    <div>
      <ToolHeader icon={tool.icon} title={tool.name} desc={tool.desc} />
      <div className="mb-4 flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <button key={t} type="button" className={clsx('btn', tab === t && 'btn-active')} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>
      {tab === 'decodificar' && <DecodeTab token={token} setToken={setToken} decoded={decoded} error={error} />}
      {tab === 'firmar' && <SignTab decoded={decoded} onUse={openToken} />}
      {tab === 'ataques' && <AttacksTab token={token} decoded={decoded} />}
    </div>
  )
}
