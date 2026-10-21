import { useMemo, useState } from 'react'
import clsx from 'clsx'
import { Card, CopyButton, Field, ToolHeader } from '@/components/ui'
import { findTool } from '@/lib/registry'
import { analyzeMany, hashcatCommand, johnCommand, type Confidence, type HashAnalysis } from './logic'

const tool = findTool('hashid')!

const EXAMPLES: { label: string; value: string }[] = [
  { label: 'MD5 / NTLM', value: '8743b52063cd84097a65d1633f5c74f5' },
  { label: '/etc/shadow', value: '$6$saltsalt$qFmFH.bQmmtXzyBY0s9v7Oicd2z4XSIecDzlB5KiA2/jctKu9YterLp8wwnSq.qc.eoxqOmSuNp2xS0ktL3nh/' },
  { label: 'bcrypt', value: '$2a$05$LhayLxezLhK1LhWvKxCyLOj0j1u.Kj0jZ0pEmm134uzrQlFvQJLF6' },
  { label: 'pwdump', value: 'Administrador:500:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::' },
  { label: 'Kerberoasting', value: '$krb5tgs$23$*svc_sql$LAB.LOCAL$MSSQLSvc/sql01*$' + '3f'.repeat(16) + '$' + 'a1'.repeat(48) },
  { label: 'SHA-256', value: '127e6fbfe24a750e72930c220a8e138275656b8e5d8f48a98c3c92df2caba935' },
]

const CONF_STYLE: Record<Confidence, string> = {
  alta: 'border-acento/40 text-acento',
  media: 'border-warn/40 text-warn',
  baja: 'border-edge text-muted',
}

function Command({ cmd }: { cmd: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-edge bg-black/30 px-3 py-1.5">
      <code className="min-w-0 flex-1 break-all font-mono text-[12.5px] text-slate-200">{cmd}</code>
      <CopyButton text={cmd} />
    </div>
  )
}

function Result({ a }: { a: HashAnalysis }) {
  const top = a.candidates[0]
  return (
    <Card>
      <code className="mb-3 block break-all font-mono text-[13px] text-slate-200">{a.input}</code>

      {a.known && (
        <p className="mb-3 rounded-lg border border-info/40 bg-info/5 px-3 py-2 text-sm text-info">💡 {a.known}</p>
      )}
      {a.extracted && (
        <p className="mb-3 text-sm text-slate-300">
          Hash NT extraído: <code className="break-all font-mono text-acento">{a.extracted}</code>
        </p>
      )}

      {a.candidates.length === 0 ? (
        <p className="text-sm text-bad">No coincide con ningún formato conocido. Revisa que no le falten o sobren caracteres.</p>
      ) : (
        <ul className="divide-y divide-edge rounded-lg border border-edge">
          {a.candidates.map((c) => (
            <li key={c.name} className="px-3 py-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className={clsx('rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase', CONF_STYLE[c.confidence])}>{c.confidence}</span>
                <span className="text-sm text-white">{c.name}</span>
                <span className="ml-auto flex gap-3 font-mono text-xs text-muted">
                  <span>hashcat <span className="text-slate-200">{c.hashcat ?? '—'}</span></span>
                  <span>john <span className="text-slate-200">{c.john ?? '—'}</span></span>
                </span>
              </div>
              {c.note && <p className="mt-1 text-xs text-muted">{c.note}</p>}
            </li>
          ))}
        </ul>
      )}

      {a.crypt && (
        <div className="mt-4">
          <h3 className="mb-2 font-mono text-xs uppercase tracking-wider text-muted">desglose crypt</h3>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 font-mono text-[13px]">
            <dt className="text-muted">id</dt><dd className="text-slate-200">${a.crypt.id}$ · {a.crypt.algorithm}</dd>
            {a.crypt.cost && (<><dt className="text-muted">coste</dt><dd className="text-slate-200">{a.crypt.cost}</dd></>)}
            <dt className="text-muted">sal</dt><dd className="break-all text-warn">{a.crypt.salt || '(vacía)'}</dd>
            <dt className="text-muted">hash</dt><dd className="break-all text-slate-200">{a.crypt.hash}</dd>
          </dl>
        </div>
      )}

      {top && (top.hashcat !== undefined || top.john) && (
        <div className="mt-4 space-y-2">
          <h3 className="font-mono text-xs uppercase tracking-wider text-muted">probar con el candidato más probable ({top.name})</h3>
          {top.hashcat !== undefined && <Command cmd={hashcatCommand(top.hashcat)} />}
          {top.john && <Command cmd={johnCommand(top.john)} />}
        </div>
      )}
    </Card>
  )
}

export default function HashId() {
  const [text, setText] = useState(EXAMPLES[0].value)
  const results = useMemo(() => analyzeMany(text), [text])

  return (
    <div>
      <ToolHeader icon={tool.icon} title={tool.name} desc={tool.desc} />
      <Card>
        <Field label="hashes (uno por línea)">
          <textarea className="input h-32 resize-y" value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} />
        </Field>
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="mr-1 font-mono text-[11px] text-muted">ejemplos:</span>
          {EXAMPLES.map((ex) => (
            <button key={ex.label} type="button" className="btn" onClick={() => setText(ex.value)}>{ex.label}</button>
          ))}
        </div>
      </Card>
      {results.map((a, i) => <Result key={`${i}-${a.input}`} a={a} />)}
    </div>
  )
}
