import { useMemo, useState } from 'react'
import clsx from 'clsx'
import { Card, CopyButton, Field, ToolHeader } from '@/components/ui'
import { findTool } from '@/lib/registry'
import { CODECS, decode, encode, type Codec } from './logic'

const tool = findTool('encoders')!

export default function Encoders() {
  const [codec, setCodec] = useState<Codec>('base64')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [input, setInput] = useState('Hola, SecLab')

  const result = useMemo(() => {
    try {
      return { ok: true as const, value: mode === 'encode' ? encode(codec, input) : decode(codec, input) }
    } catch (e) {
      return { ok: false as const, value: (e as Error).message }
    }
  }, [codec, mode, input])

  const swap = () => {
    if (!result.ok) return
    setInput(result.value)
    setMode(mode === 'encode' ? 'decode' : 'encode')
  }

  return (
    <div>
      <ToolHeader icon={tool.icon} title={tool.name} desc={tool.desc} />
      <Card>
        <div className="mb-4 flex flex-wrap gap-1.5">
          {CODECS.map((c) => (
            <button key={c.id} type="button" className={clsx('btn', codec === c.id && 'btn-active')} onClick={() => setCodec(c.id)}>
              {c.label}
            </button>
          ))}
          <span className="mx-1 w-px bg-edge" />
          {(['encode', 'decode'] as const).map((m) => (
            <button key={m} type="button" className={clsx('btn', mode === m && 'btn-active')} onClick={() => setMode(m)}>
              {m === 'encode' ? 'codificar' : 'decodificar'}
            </button>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="entrada">
            <textarea className="input h-40 resize-y" value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} />
          </Field>
          <Field label="salida">
            <textarea
              readOnly
              className={clsx('input h-40 resize-y', !result.ok && 'text-bad')}
              value={result.value}
              spellCheck={false}
            />
          </Field>
        </div>
        <div className="mt-3 flex gap-2">
          <CopyButton text={result.ok ? result.value : ''} />
          <button type="button" className="btn" onClick={swap} disabled={!result.ok}>usar salida como entrada</button>
        </div>
      </Card>
    </div>
  )
}
