import { ToolStub } from '@/components/ToolStub'

export default function SshHarden() {
  return (
    <ToolStub
      id="sshharden"
      features={[
        'Formulario de opciones con explicación al pasar el ratón por cada una',
        'sshd_config generado en vivo, con o sin comentarios, listo para copiar',
        'Pegar un sshd_config existente y auditarlo contra las recomendaciones',
        'Pasos para aplicarlo sin quedarse fuera: sshd -t, mantener una sesión abierta y reload',
      ]}
    />
  )
}
