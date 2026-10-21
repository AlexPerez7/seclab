# Hash Suite — apuntes

**Estado:** pendiente.

## Objetivos de aprendizaje
- Las propiedades de una función hash criptográfica: preimagen, segunda preimagen y colisiones.
- Por qué MD5 y SHA-1 están rotos para firmas pero siguen apareciendo (checksums, NTLM, legado).
- La diferencia entre un hash, un HMAC y un KDF (PBKDF2, bcrypt, Argon2).

## Conceptos clave
- Construcción Merkle–Damgård y el ataque de extensión de longitud. Es la razón de que exista HMAC.
- NTLM = MD4(UTF-16LE(password)): por qué un hash sin sal es vulnerable a pass-the-hash y a tablas precalculadas.

## Preguntas de repaso
1. ¿Por qué `SHA256(secret + mensaje)` no es un MAC seguro?
2. ¿Qué aporta la sal? ¿Y el "pepper"?
3. ¿Cuánto mide en bits un SHA-384? ¿Y en caracteres hex?

## Práctica
- Implementar MD5 a mano (RFC 1321) y validarlo con los vectores del apéndice A.5.
- Comparar el hash de un ISO descargado con el publicado por su fabricante.
