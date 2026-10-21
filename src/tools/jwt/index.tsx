import { ToolStub } from '@/components/ToolStub'

export default function Jwt() {
  return (
    <ToolStub
      id="jwt"
      features={[
        'Pegar un token y ver header, payload y firma coloreados, con exp/iat/nbf en fecha legible',
        'Verificar HS256 con un secret y firmar tokens propios',
        'Auditoría según RFC 8725: alg none, falta de exp, claims sensibles…',
        'Laboratorio de ataques: alg=none y prueba de secrets débiles con una lista corta',
      ]}
    />
  )
}
