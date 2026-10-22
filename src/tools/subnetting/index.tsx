import { useMemo, useState } from 'react'
import clsx from 'clsx'
import { Plus, Trash2 } from 'lucide-react'
import { Card, CopyButton, Field, ToolHeader } from '@/components/ui'
import { findTool } from '@/lib/registry'
import {
  checkExercise, EXERCISE_FIELDS, ipToInt, parseCidr, randomExercise, toBinary, vlsm,
  type ExerciseField, type SubnetInfo, type VlsmRequest,
} from './logic'

const tool = findTool('subnetting')!

type Tab = 'calculadora' | 'vlsm' | 'práctica'
const TABS: Tab[] = ['calculadora', 'vlsm', 'práctica']

/** Resultado de parseCidr o el mensaje de error. */
function useSubnet(input: string): { s: SubnetInfo | null; error: string | null } {
  return useMemo(() => {
    try {
      return { s: parseCidr(input), error: null }
    } catch (e) {
      return { s: null, error: (e as Error).message }
    }
  }, [input])
}

/** 32 bits en 4 octetos, con los bits de red en verde y los de host en ámbar. */
function Bits({ value, prefix }: { value: string; prefix: number }) {
  const bits = toBinary(ipToInt(value)).replace(/\./g, '')
  return (
    <code className="font-mono text-[12.5px] tracking-wide">
      {[...bits].map((b, i) => (
        <span key={i}>
          {i > 0 && i % 8 === 0 && <span className="text-slate-600">.</span>}
          <span className={i < prefix ? 'text-acento' : 'text-warn'}>{b}</span>
        </span>
      ))}
    </code>
  )
}

function CalculatorTab() {
  const [input, setInput] = useState('192.168.1.10/24')
  const { s, error } = useSubnet(input)

  const setPrefix = (p: number) => s && setInput(`${s.ip}/${p}`)

  const rows: [string, string][] = s
    ? [
        ['red', s.network],
        ['broadcast', s.broadcast],
        ['primer host', s.firstHost],
        ['último host', s.lastHost],
        ['máscara', `${s.mask} (/${s.prefix})`],
        ['wildcard', s.wildcard],
        ['direcciones', s.totalAddresses.toLocaleString('es')],
        ['hosts útiles', s.usableHosts.toLocaleString('es')],
        ['tipo', s.type],
        ['clase histórica', s.ipClass],
      ]
    : []

  return (
    <>
      <Card>
        <Field label="IP/prefijo o IP y máscara">
          <input className="input" value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} />
        </Field>
        {error && <p className="mt-2 font-mono text-xs text-bad">{error}</p>}
        {s && (
          <div className="mt-4">
            <div className="mb-1 flex justify-between font-mono text-xs text-muted">
              <span>prefijo /{s.prefix}</span>
              <span>{32 - s.prefix} bits de host</span>
            </div>
            <input type="range" min={0} max={32} value={s.prefix} onChange={(e) => setPrefix(Number(e.target.value))} className="w-full accent-[#2ee88a]" />
          </div>
        )}
      </Card>

      {s && (
        <>
          <Card>
            <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
              {rows.map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-3 border-b border-edge/60 pb-1.5">
                  <dt className="font-mono text-xs text-muted">{k}</dt>
                  <dd className="text-right font-mono text-sm text-slate-100">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4"><CopyButton text={rows.map(([k, v]) => `${k}: ${v}`).join('\n')} /></div>
          </Card>

          <Card title="En binario">
            <div className="space-y-1.5 overflow-x-auto">
              {([['ip', s.ip], ['máscara', s.mask], ['red', s.network], ['broadcast', s.broadcast]] as const).map(([k, v]) => (
                <div key={k} className="flex items-center gap-3 whitespace-nowrap">
                  <span className="w-20 shrink-0 font-mono text-xs text-muted">{k}</span>
                  <Bits value={v} prefix={s.prefix} />
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted">
              <span className="text-acento">Verde</span>: bits de red, fijos en toda la subred. <span className="text-warn">Ámbar</span>: bits de host.
              La red es la IP con los bits de host a 0, y el broadcast la misma IP con los bits de host a 1.
            </p>
          </Card>
        </>
      )}
    </>
  )
}

function VlsmTab() {
  const [base, setBase] = useState('192.168.10.0/24')
  const [rows, setRows] = useState<VlsmRequest[]>([
    { name: 'Usuarios', hosts: 100 },
    { name: 'Servidores', hosts: 50 },
    { name: 'Gestión', hosts: 10 },
    { name: 'Enlace WAN', hosts: 2 },
  ])

  const result = useMemo(() => {
    try {
      const valid = rows.filter((r) => r.hosts > 0)
      const alloc = vlsm(base, valid)
      const baseNet = parseCidr(base)
      const used = alloc.reduce((acc, a) => acc + a.subnet.totalAddresses, 0)
      return { alloc, used, total: baseNet.totalAddresses }
    } catch (e) {
      return { error: (e as Error).message }
    }
  }, [base, rows])

  const update = (i: number, patch: Partial<VlsmRequest>) => setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)))

  return (
    <>
      <Card>
        <Field label="red base">
          <input className="input" value={base} onChange={(e) => setBase(e.target.value)} spellCheck={false} />
        </Field>
        <h3 className="mb-2 mt-4 font-mono text-[11px] uppercase tracking-wider text-muted">segmentos</h3>
        <div className="space-y-2">
          {rows.map((r, i) => (
            <div key={i} className="flex gap-2">
              <input className="input flex-1" value={r.name} onChange={(e) => update(i, { name: e.target.value })} placeholder="nombre" />
              <input
                className="input w-28"
                type="number"
                min={1}
                value={r.hosts || ''}
                onChange={(e) => update(i, { hosts: Number(e.target.value) })}
                placeholder="hosts"
              />
              <button type="button" className="btn" onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))} aria-label="quitar">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
        <button type="button" className="btn mt-3" onClick={() => setRows((rs) => [...rs, { name: `Segmento ${rs.length + 1}`, hosts: 10 }])}>
          <Plus size={13} /> añadir segmento
        </button>
      </Card>

      <Card title="Asignación">
        {'error' in result ? (
          <p className="font-mono text-xs text-bad">{result.error}</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-[12.5px]">
                <thead className="text-xs text-muted">
                  <tr className="border-b border-edge">
                    {['segmento', 'pide', 'subred', 'máscara', 'rango de hosts', 'broadcast', 'sobran'].map((h) => (
                      <th key={h} className="whitespace-nowrap px-2 py-1.5 font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.alloc.map((a) => (
                    <tr key={a.name + a.subnet.cidr} className="border-b border-edge/60">
                      <td className="whitespace-nowrap px-2 py-1.5 font-sans text-white">{a.name}</td>
                      <td className="px-2 py-1.5">{a.hosts}</td>
                      <td className="whitespace-nowrap px-2 py-1.5 text-acento">{a.subnet.cidr}</td>
                      <td className="whitespace-nowrap px-2 py-1.5">{a.subnet.mask}</td>
                      <td className="whitespace-nowrap px-2 py-1.5">{a.subnet.firstHost} – {a.subnet.lastHost}</td>
                      <td className="whitespace-nowrap px-2 py-1.5">{a.subnet.broadcast}</td>
                      <td className={clsx('px-2 py-1.5', a.wasted > a.hosts && 'text-warn')}>{a.wasted}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4">
              <div className="mb-1 flex justify-between font-mono text-xs">
                <span className="text-muted">ocupado</span>
                <span className="text-slate-200">
                  {result.used.toLocaleString('es')} / {result.total.toLocaleString('es')} direcciones ({((result.used / result.total) * 100).toFixed(1)} %)
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded bg-black/40">
                <div className="h-full bg-acento" style={{ width: `${(result.used / result.total) * 100}%` }} />
              </div>
            </div>
          </>
        )}
      </Card>
    </>
  )
}

const emptyAnswers = (): Record<ExerciseField, string> => ({ network: '', broadcast: '', firstHost: '', lastHost: '', usableHosts: '' })

function PracticeTab() {
  const [cidr, setCidr] = useState(() => randomExercise())
  const [answers, setAnswers] = useState(emptyAnswers)
  const [checked, setChecked] = useState<Record<ExerciseField, boolean> | null>(null)
  const [reveal, setReveal] = useState(false)
  const [score, setScore] = useState({ ok: 0, total: 0 })
  const solution = useMemo(() => parseCidr(cidr), [cidr])

  const check = () => {
    const res = checkExercise(cidr, answers)
    setChecked(res)
    // Solo puntúa el primer intento de cada ejercicio y si no se miró la solución antes.
    if (!checked && !reveal) setScore((s) => ({ ok: s.ok + (Object.values(res).every(Boolean) ? 1 : 0), total: s.total + 1 }))
  }

  const next = () => {
    setCidr(randomExercise())
    setAnswers(emptyAnswers())
    setChecked(null)
    setReveal(false)
  }

  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm text-slate-300">
          Calcula a mano para <code className="font-mono text-base text-acento">{cidr}</code>
        </p>
        <span className="font-mono text-xs text-muted">aciertos: {score.ok} / {score.total}</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {EXERCISE_FIELDS.map(({ key, label }) => (
          <Field key={key} label={label}>
            <input
              className={clsx('input', checked && (checked[key] ? 'border-acento/60' : 'border-bad/60'))}
              value={answers[key]}
              onChange={(e) => setAnswers((a) => ({ ...a, [key]: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && check()}
              spellCheck={false}
            />
            {reveal && <span className="mt-1 block font-mono text-xs text-muted">{String(solution[key])}</span>}
          </Field>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className="btn" onClick={check}>comprobar</button>
        <button type="button" className="btn" onClick={() => setReveal(true)}>ver solución</button>
        <button type="button" className="btn" onClick={next}>otro ejercicio</button>
      </div>
      {checked && Object.values(checked).every(Boolean) && <p className="mt-3 font-mono text-sm text-acento">✓ todo correcto</p>}
    </Card>
  )
}

export default function Subnetting() {
  const [tab, setTab] = useState<Tab>('calculadora')
  return (
    <div>
      <ToolHeader icon={tool.icon} title={tool.name} desc={tool.desc} />
      <div className="mb-4 flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <button key={t} type="button" className={clsx('btn', tab === t && 'btn-active')} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>
      {tab === 'calculadora' && <CalculatorTab />}
      {tab === 'vlsm' && <VlsmTab />}
      {tab === 'práctica' && <PracticeTab />}
    </div>
  )
}
