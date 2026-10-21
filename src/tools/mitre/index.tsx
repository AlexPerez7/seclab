import { ToolStub } from '@/components/ToolStub'

export default function Mitre() {
  return (
    <ToolStub
      id="mitre"
      features={[
        'Matriz por tácticas con las técnicas de cada columna',
        'Búsqueda por id, nombre o idea de detección',
        'Ficha por técnica con tus apuntes de detección y el enlace a attack.mitre.org',
        'Marcar técnicas (estudiadas, cubiertas…) y exportar la capa al ATT&CK Navigator',
      ]}
    />
  )
}
