import { ToolStub } from '@/components/ToolStub'

export default function HttpHeader() {
  return (
    <ToolStub
      id="httpheader"
      features={[
        'Formulario: método, URL, headers (añadir/quitar) y body',
        'Presets de autenticación: Basic (con su Base64 visible), Bearer y cookie',
        'Salida en petición cruda (para Burp Repeater o nc) y en curl',
        'Explicación de cada header común y de las cabeceras de seguridad de la respuesta',
      ]}
    />
  )
}
