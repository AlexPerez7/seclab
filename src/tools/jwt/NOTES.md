# JWT Toolkit — apuntes

**Estado:** listo (2026-10-21). Reutiliza Base64url de `encoders` y HMAC de `hash`. El test que reproduce byte a byte el token de ejemplo de jwt.io valida toda la cadena.

## Objetivos de aprendizaje
- La estructura JWS compacta: `header.payload.signature`, todo en Base64url.
- La diferencia entre HS256 (secreto compartido) y RS256/ES256 (par de claves).
- Los ataques clásicos: alg=none, confusión de algoritmo RS→HS, secret débil, `kid`/`jku` inyectables y tokens sin expiración.

## Preguntas de repaso
1. ¿Un JWT cifra el payload? ¿Qué es entonces un JWE?
2. ¿Por qué la confusión RS256→HS256 permite firmar con la clave **pública**?
3. ¿Qué claims recomienda validar siempre la RFC 8725?

## Práctica
- Laboratorios "JWT attacks" de PortSwigger Web Security Academy.
- Decodificar un token real de una app propia o del trabajo (sin compartirlo) y auditarlo.
