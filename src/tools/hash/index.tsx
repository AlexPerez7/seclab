import { useEffect, useState, type DragEvent } from 'react'
import clsx from 'clsx'
import { Upload } from 'lucide-react'
import { Card, CopyButton, Field, ToolHeader } from '@/components/ui'
import { findTool } from '@/lib/registry'
import {
  bitDiff, DIGEST_BITS, HASH_ALGS, hashAll, hashesMatch, hashText, hmac, type HashAlg, type HmacAlg,
} from './logic'

const tool = findTool('hash')!

type Tab = 'texto' | 'archivo' | 'hmac' | 'avalancha'
const TABS: Tab[] = ['texto', 'archivo', 'hmac', 'avalancha']

/** Ejecuta una función async cuando cambian sus dependencias, descartando resultados obsoletos. */
function useAsyncValue<T>(fn: () => Promise<T> | null, deps: unknown[]): { value: T | null; error: string | null } {
  const [state, setState] = useState<{ value: T | null; error: string | null }>({ value: null, error: null })
  useEffect(() => {
    let alive = true
    const p = fn()
    if (!p) {
      setState({ value: null, error: null })
      return
    }
    p.then(
      (value) => alive && setState({ value, error: null }),
      (e: Error) => alive && setState({ value: null, error: e.message }),
    )
    return () => {
      alive = false
    }
  }, deps)
  return state
}

function HashTable({ hashes, expected }: { hashes: Record<HashAlg, string> | null; expected: string }) {
  return (
    <div className="divide-y divide-edge rounded-lg border border-edge">
      {HASH_ALGS.map((alg) => {
        const h = hashes?.[alg] ?? ''
        const match = expected.trim() !== '' && hashesMatch(h, expected)
        return (
          <div key={alg} className={clsx('flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2', match && 'bg-acento/10')}>
            <span className={clsx('w-20 shrink-0 font-mono text-xs', match ? 'text-acento' : 'text-muted')}>
              {alg}
              {match && ' ✓'}
            </span>
            <code className="min-w-0 flex-1 break-all font-mono text-[13px] text-slate-200">{h || '…'}</code>
            <CopyButton text={h} />
          </div>
        )
      })}
    </div>
  )
}

function ExpectedInput({ value, onChange, hashes }: { value: string; onChange: (v: string) => void; hashes: Record<HashAlg, string> | null }) {
  const anyMatch = hashes && value.trim() !== '' && HASH_ALGS.some((a) => hashesMatch(hashes[a], value))
  return (
    <div className="mt-4">
      <Field label="comparar con un hash esperado (opcional)">
        <input className="input" value={value} onChange={(e) => onChange(e.target.value)} placeholder="pega aquí el hash publicado" spellCheck={false} />
      </Field>
      {value.trim() !== '' && hashes && (
        <p className={clsx('mt-2 font-mono text-xs', anyMatch ? 'text-acento' : 'text-bad')}>
          {anyMatch ? '✓ coincide' : '✗ no coincide con ninguno de los algoritmos'}
        </p>
      )}
    </div>
  )
}

function TextTab() {
  const [text, setText] = useState('SecLab')
  const [expected, setExpected] = useState('')
  const { value: hashes } = useAsyncValue(() => hashAll(new TextEncoder().encode(text)), [text])
  return (
    <Card>
      <Field label="texto (se hashea como UTF-8)">
        <textarea className="input h-28 resize-y" value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} />
      </Field>
      <div className="mt-4">
        <HashTable hashes={hashes} expected={expected} />
      </div>
      <ExpectedInput value={expected} onChange={setExpected} hashes={hashes} />
    </Card>
  )
}

const fmtSize = (n: number) =>
  n < 1024 ? `${n} B` : n < 1024 ** 2 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1024 ** 2).toFixed(1)} MB`

function FileTab() {
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [expected, setExpected] = useState('')
  const { value: hashes, error } = useAsyncValue(
    () => (file ? file.arrayBuffer().then((b) => hashAll(new Uint8Array(b))) : null),
    [file],
  )

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0])
  }

  return (
    <Card>
      <label
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={clsx(
          'flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-8 text-center text-sm transition-colors',
          dragging ? 'border-acento bg-acento/5 text-acento' : 'border-edge text-muted hover:border-acento/50',
        )}
      >
        <Upload size={22} />
        {file ? (
          <span className="break-all font-mono text-slate-200">{file.name} · {fmtSize(file.size)}</span>
        ) : (
          <span>Arrastra un archivo o haz clic para elegirlo</span>
        )}
        <span className="text-xs">Se lee en tu navegador: el archivo no se sube a ningún sitio.</span>
        <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      </label>
      {error && <p className="mt-3 font-mono text-xs text-bad">{error}</p>}
      {file && (
        <>
          <div className="mt-4">
            <HashTable hashes={hashes} expected={expected} />
          </div>
          <ExpectedInput value={expected} onChange={setExpected} hashes={hashes} />
        </>
      )}
    </Card>
  )
}

const HMAC_ALGS = HASH_ALGS.filter((a): a is HmacAlg => a !== 'MD5')

function HmacTab() {
  const [alg, setAlg] = useState<HmacAlg>('SHA-256')
  const [key, setKey] = useState('clave-secreta')
  const [msg, setMsg] = useState('mensaje a autenticar')
  const { value, error } = useAsyncValue(() => hmac(alg, key, msg), [alg, key, msg])
  return (
    <Card>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {HMAC_ALGS.map((a) => (
          <button key={a} type="button" className={clsx('btn', alg === a && 'btn-active')} onClick={() => setAlg(a)}>
            HMAC-{a}
          </button>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="clave">
          <input className="input" value={key} onChange={(e) => setKey(e.target.value)} spellCheck={false} />
        </Field>
        <Field label="mensaje">
          <input className="input" value={msg} onChange={(e) => setMsg(e.target.value)} spellCheck={false} />
        </Field>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-edge px-3 py-2">
        <code className="min-w-0 flex-1 break-all font-mono text-[13px]">{error ?? value ?? '…'}</code>
        <CopyButton text={value ?? ''} />
      </div>
      <p className="mt-3 text-xs text-muted">
        HMAC mezcla la clave dos veces (ipad y opad) en vez de concatenarla al mensaje. Por eso no es vulnerable al
        ataque de extensión de longitud que sí sufre <code>SHA256(clave + mensaje)</code>.
      </p>
    </Card>
  )
}

/** Hex con los nibbles que difieren del otro hash resaltados. */
function DiffHex({ hex, other }: { hex: string; other: string }) {
  return (
    <code className="break-all font-mono text-[13px] leading-relaxed">
      {[...hex].map((c, i) => (
        <span key={i} className={c === other[i] ? 'text-muted' : 'text-warn'}>{c}</span>
      ))}
    </code>
  )
}

function AvalancheTab() {
  const [alg, setAlg] = useState<HashAlg>('SHA-256')
  const [a, setA] = useState('SecLab')
  const [b, setB] = useState('Seclab')
  const { value } = useAsyncValue(() => Promise.all([hashText(alg, a), hashText(alg, b)]), [alg, a, b])
  const diff = value ? bitDiff(value[0], value[1]) : null
  const pct = diff ? (diff.diff / diff.total) * 100 : 0

  return (
    <Card>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {HASH_ALGS.map((x) => (
          <button key={x} type="button" className={clsx('btn', alg === x && 'btn-active')} onClick={() => setAlg(x)}>
            {x}
          </button>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="entrada A">
          <input className="input" value={a} onChange={(e) => setA(e.target.value)} spellCheck={false} />
        </Field>
        <Field label="entrada B">
          <input className="input" value={b} onChange={(e) => setB(e.target.value)} spellCheck={false} />
        </Field>
      </div>
      {value && diff && (
        <>
          <div className="mt-4 space-y-2 rounded-lg border border-edge p-3">
            <div><span className="mr-2 font-mono text-xs text-muted">A</span><DiffHex hex={value[0]} other={value[1]} /></div>
            <div><span className="mr-2 font-mono text-xs text-muted">B</span><DiffHex hex={value[1]} other={value[0]} /></div>
          </div>
          <div className="mt-4">
            <div className="mb-1 flex justify-between font-mono text-xs">
              <span className="text-muted">bits distintos</span>
              <span className="text-slate-200">{diff.diff} / {DIGEST_BITS[alg]} ({pct.toFixed(1)} %)</span>
            </div>
            <div className="h-2 overflow-hidden rounded bg-black/40">
              <div className="h-full bg-warn transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </>
      )}
      <p className="mt-3 text-xs text-muted">
        Una buena función hash cambia de media el 50 % de los bits ante cualquier cambio en la entrada, por pequeño que
        sea. Si cambiara poco, se podría deducir información de la entrada comparando hashes.
      </p>
    </Card>
  )
}

export default function Hash() {
  const [tab, setTab] = useState<Tab>('texto')
  return (
    <div>
      <ToolHeader icon={tool.icon} title={tool.name} desc={tool.desc} />
      <div className="mb-4 flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <button key={t} type="button" className={clsx('btn', tab === t && 'btn-active')} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>
      {tab === 'texto' && <TextTab />}
      {tab === 'archivo' && <FileTab />}
      {tab === 'hmac' && <HmacTab />}
      {tab === 'avalancha' && <AvalancheTab />}
    </div>
  )
}
