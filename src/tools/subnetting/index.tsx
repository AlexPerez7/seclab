import { ToolStub } from '@/components/ToolStub'

export default function Subnetting() {
  return (
    <ToolStub
      id="subnetting"
      features={[
        'Calculadora CIDR: red, broadcast, rango de hosts, máscara y wildcard',
        'Vista binaria con la frontera red/host resaltada (lo que de verdad enseña el subnetting)',
        'VLSM: lista de segmentos con sus hosts y tabla de asignación resultante',
        'Modo práctica: genera un ejercicio aleatorio y corrige tu respuesta',
      ]}
    />
  )
}
