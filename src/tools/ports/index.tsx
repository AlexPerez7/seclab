import { useMemo, useState } from 'react'
import clsx from 'clsx'
import { Card, Field, ToolHeader } from '@/components/ui'
import { findTool } from '@/lib/registry'
import { GROUP_LABEL, parseNmap, pickCard, searchPorts, type PortGroup, type PortInfo } from './logic'

const tool = findTool('ports')!

type Tab = 'referencia' | 'nmap' | 'flashcards'
const TABS: Tab[] = ['referencia', 'nmap', 'flashcards']

const NMAP_SAMPLE = `Nmap scan report for dc01.lab.local (10.0.0.10)
PORT     STATE SERVICE       VERSION
53/tcp   open  domain        Simple DNS Plus
88/tcp   open  kerberos-sec  Microsoft Windows Kerberos
135/tcp  open  msrpc         Microsoft Windows RPC
389/tcp  open  ldap          Microsoft Windows Active Directory LDAP
445/tcp  open  microsoft-ds?
3389/tcp open  ms-wbt-server Microsoft Terminal Services
5985/tcp open  http          Microsoft HTTPAPI httpd 2.0`

function PortRow({ p, extra }: { p: PortInfo; extra?: string }) {
  return (
    <li className="px-4 py-3">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="w-24 shrink-0 font-mono text-sm text-acento">{p.port}/{p.proto}</span>
        <span className="text-sm font-semibold text-white">{p.service}</span>
        <span className="font-mono text-[11px] text-muted">{GROUP_LABEL[p.group]}</span>
        {extra && <span className="font-mono text-[11px] text-info">{extra}</span>}
      </div>
      <dl className="mt-1.5 grid gap-1 text-[13px] sm:pl-[6.75rem]">
        <div><dt className="inline font-mono text-xs text-warn">pentest · </dt><dd className="inline text-slate-300">{p.pentest}</dd></div>
        <div><dt className="inline font-mono text-xs text-acento">defensa · </dt><dd className="inline text-slate-300">{p.defense}</dd></div>
      </dl>
    </li>
  )
}

function ReferenceTab() {
  const [q, setQ] = useState('')
  const [group, setGroup] = useState<PortGroup | undefined>()
  const results = useMemo(() => searchPorts(q, group), [q, group])

  return (
    <>
      <Card>
        <Field label="buscar por número, servicio o texto (p. ej. 445, kerberos, responder)">
          <input className="input" value={q} onChange={(e) => setQ(e.target.value)} spellCheck={false} />
        </Field>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <button type="button" className={clsx('btn', !group && 'btn-active')} onClick={() => setGroup(undefined)}>todos</button>
          {(Object.keys(GROUP_LABEL) as PortGroup[]).map((g) => (
            <button key={g} type="button" className={clsx('btn', group === g && 'btn-active')} onClick={() => setGroup(group === g ? undefined : g)}>
              {GROUP_LABEL[g]}
            </button>
          ))}
        </div>
        <p className="mt-3 font-mono text-xs text-muted">{results.length} puertos</p>
      </Card>
      {results.length > 0 ? (
        <ul className="card mb-4 divide-y divide-edge">{results.map((p) => <PortRow key={`${p.port}/${p.proto}`} p={p} />)}</ul>
      ) : (
        <p className="mb-4 text-sm text-muted">Sin resultados. Ese puerto aún no tiene ficha.</p>
      )}
    </>
  )
}

function NmapTab() {
  const [text, setText] = useState(NMAP_SAMPLE)
  const ports = useMemo(() => parseNmap(text), [text])
  const unknown = ports.filter((p) => !p.info)

  return (
    <>
      <Card>
        <Field label="salida de nmap (normal o -oG)">
          <textarea className="input h-48 resize-y" value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} />
        </Field>
        <p className="mt-2 font-mono text-xs text-muted">{ports.length} puertos abiertos · {ports.length - unknown.length} con ficha</p>
      </Card>
      {ports.length > 0 && (
        <ul className="card mb-4 divide-y divide-edge">
          {ports.filter((p) => p.info).map((p) => (
            <PortRow key={`${p.port}/${p.proto}`} p={p.info!} extra={[p.service, p.version].filter(Boolean).join(' · ')} />
          ))}
          {unknown.map((p) => (
            <li key={`${p.port}/${p.proto}`} className="flex flex-wrap items-baseline gap-x-3 px-4 py-3">
              <span className="w-24 shrink-0 font-mono text-sm text-muted">{p.port}/{p.proto}</span>
              <span className="text-sm text-slate-300">{p.service || 'desconocido'}</span>
              <span className="font-mono text-[11px] text-info">{p.version}</span>
              <span className="text-xs text-muted">sin ficha: investígalo y añádelo</span>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

function FlashcardsTab() {
  const [mode, setMode] = useState<'puerto' | 'servicio'>('puerto')
  const [card, setCard] = useState(() => pickCard())
  const [shown, setShown] = useState(false)
  const [score, setScore] = useState({ ok: 0, total: 0 })

  const next = (knew?: boolean) => {
    if (knew !== undefined) setScore((s) => ({ ok: s.ok + (knew ? 1 : 0), total: s.total + 1 }))
    setCard((c) => pickCard(c.port))
    setShown(false)
  }

  const question = mode === 'puerto' ? `${card.port}/${card.proto}` : card.service
  const answer = mode === 'puerto' ? card.service : `${card.port}/${card.proto}`

  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1.5">
          {(['puerto', 'servicio'] as const).map((m) => (
            <button key={m} type="button" className={clsx('btn', mode === m && 'btn-active')} onClick={() => setMode(m)}>
              {m === 'puerto' ? 'puerto → servicio' : 'servicio → puerto'}
            </button>
          ))}
        </div>
        <span className="font-mono text-xs text-muted">sabidas: {score.ok} / {score.total}</span>
      </div>
      <div className="flex min-h-[9rem] flex-col items-center justify-center rounded-lg border border-edge bg-black/30 p-6 text-center">
        <span className="font-mono text-3xl font-bold text-white">{question}</span>
        {shown && (
          <>
            <span className="mt-3 font-mono text-lg text-acento">{answer}</span>
            <span className="mt-2 max-w-md text-xs text-muted">{card.pentest}</span>
          </>
        )}
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {!shown ? (
          <button type="button" className="btn" onClick={() => setShown(true)}>mostrar respuesta</button>
        ) : (
          <>
            <button type="button" className="btn border-acento/40 text-acento" onClick={() => next(true)}>la sabía</button>
            <button type="button" className="btn border-bad/40 text-bad" onClick={() => next(false)}>no la sabía</button>
          </>
        )}
        <button type="button" className="btn" onClick={() => next()}>saltar</button>
      </div>
    </Card>
  )
}

export default function Ports() {
  const [tab, setTab] = useState<Tab>('referencia')
  return (
    <div>
      <ToolHeader icon={tool.icon} title={tool.name} desc={tool.desc} />
      <div className="mb-4 flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <button key={t} type="button" className={clsx('btn', tab === t && 'btn-active')} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>
      {tab === 'referencia' && <ReferenceTab />}
      {tab === 'nmap' && <NmapTab />}
      {tab === 'flashcards' && <FlashcardsTab />}
    </div>
  )
}
