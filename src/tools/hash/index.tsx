import { ToolStub } from '@/components/ToolStub'

export default function Hash() {
  return (
    <ToolStub
      id="hash"
      features={[
        'Hash de texto con todos los algoritmos a la vez y botón de copiar por fila',
        'Hash de archivos arrastrados (lectura con FileReader, nada sale del navegador)',
        'HMAC con clave',
        'Comparador: pegar un hash esperado y marcar en verde/rojo si coincide',
        'Demo del efecto avalancha: cambiar un carácter y ver cuántos bits cambian',
      ]}
    />
  )
}
