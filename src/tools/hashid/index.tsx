import { ToolStub } from '@/components/ToolStub'

export default function HashId() {
  return (
    <ToolStub
      id="hashid"
      features={[
        'Pegar uno o varios hashes (uno por línea) y listar los candidatos de cada uno',
        'Modo hashcat (-m) y formato John por candidato, con el comando listo para copiar',
        'Explicación de por qué es ambiguo (p. ej. MD5 frente a NTLM)',
        'Desglose de los hashes crypt: algoritmo, coste/rondas, sal y hash',
      ]}
    />
  )
}
