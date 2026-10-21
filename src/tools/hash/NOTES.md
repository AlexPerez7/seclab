# Hash Suite — apuntes

**Estado:** listo (2026-10-21). MD5 implementado a mano en `logic.ts` (función `md5`), comentado por secciones de la RFC 1321: es la parte para leer con calma.

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
- Leer la función `md5` junto a la RFC 1321 sección por sección: padding (§3.1–3.2), estado inicial (§3.3), las 4 rondas (§3.4) y la salida (§3.5).
- Ejercicio: implementar SHA-1 a mano (FIPS 180-4 §6.1) y compararlo con WebCrypto en un test.
- Comparar el hash de un ISO descargado con el publicado por su fabricante.
