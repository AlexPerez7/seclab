import { ToolStub } from '@/components/ToolStub'

export default function Cvss() {
  return (
    <ToolStub
      id="cvss"
      features={[
        'Botonera por métrica con la pregunta que responde cada una',
        'Score y severidad en vivo, y vector copiable',
        'Pegar un vector existente (de un CVE o un informe) y cargarlo',
        'Desglose del cálculo: ISS, Impact y Exploitability paso a paso',
      ]}
    />
  )
}
