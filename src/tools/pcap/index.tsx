import { ToolStub } from '@/components/ToolStub'

export default function Pcap() {
  return (
    <ToolStub
      id="pcap"
      features={[
        'Arrastrar un .pcap y analizarlo en local (nada se sube)',
        'Resumen: paquetes, duración, protocolos y top talkers',
        'Lista de paquetes con el desglose capa por capa (Ethernet → IP → TCP/UDP) en hex',
        'Consultas DNS y peticiones HTTP extraídas',
        'Alertas didácticas: escaneo SYN, credenciales en claro, DNS sospechoso',
      ]}
    />
  )
}
