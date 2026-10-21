import { ToolStub } from '@/components/ToolStub'

export default function Ports() {
  return (
    <ToolStub
      id="ports"
      features={[
        'Tabla buscable por número, servicio o texto, con filtros por grupo (web, AD, BBDD, PAM…)',
        'Ficha por puerto: qué es, qué probar en un pentest y cómo se defiende',
        'Pegar la salida de nmap y anotar cada puerto abierto con su ficha',
        'Modo flashcards: puerto → servicio para memorizar',
      ]}
    />
  )
}
