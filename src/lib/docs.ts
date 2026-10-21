/* Documentación propia de cada herramienta: src/tools/<id>/docs.md.
   Convención del archivo:
     # Título
     párrafo de introducción
     ## Cómo se usa        ← se muestra en la página de la herramienta
     ## Casos de uso       ← se muestra en la página de la herramienta
     ## …                  ← resto: solo en la página de documentación (/docs/<id>) */

export const USAGE_TITLE = 'Cómo se usa'
export const USE_CASES_TITLE = 'Casos de uso'

export interface DocSection {
  slug: string
  title: string
  /** Markdown del cuerpo, sin la línea del título. */
  body: string
}

export interface ToolDoc {
  title: string
  intro: string
  usage?: DocSection
  useCases?: DocSection
  /** Todas las secciones `##`, en orden (incluidas las dos anteriores). */
  sections: DocSection[]
  markdown: string
}

/** "Cómo se usa" → "como-se-usa". Mismo algoritmo que los ids que pone el renderizador. */
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

/** Divide el markdown por títulos `## ` (ignorando los que estén dentro de bloques de código). */
export function parseDoc(markdown: string): ToolDoc {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  let title = ''
  const intro: string[] = []
  const sections: DocSection[] = []
  let current: { title: string; lines: string[] } | null = null
  let inFence = false

  const flush = () => {
    if (current) sections.push({ slug: slugify(current.title), title: current.title, body: current.lines.join('\n').trim() })
  }

  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence
    if (!inFence && !title && /^# /.test(line)) {
      title = line.slice(2).trim()
      continue
    }
    if (!inFence && /^## /.test(line)) {
      flush()
      current = { title: line.slice(3).trim(), lines: [] }
      continue
    }
    ;(current ? current.lines : intro).push(line)
  }
  flush()

  return {
    title,
    intro: intro.join('\n').trim(),
    usage: sections.find((s) => s.title === USAGE_TITLE),
    useCases: sections.find((s) => s.title === USE_CASES_TITLE),
    sections,
    markdown,
  }
}

const raw = import.meta.glob<string>('../tools/*/docs.md', { query: '?raw', import: 'default', eager: true })

const DOCS: Record<string, ToolDoc> = Object.fromEntries(
  Object.entries(raw).map(([path, md]) => [path.split('/').at(-2)!, parseDoc(md)]),
)

export const getDoc = (toolId: string): ToolDoc | undefined => DOCS[toolId]
