# Encoders — apuntes

**Estado:** listo (herramienta de referencia del patrón).

## Objetivos de aprendizaje
- Distinguir codificación, cifrado y hashing.
- Entender cómo Base64 agrupa 3 bytes en 4 caracteres de 6 bits, y para qué sirve el padding.
- Saber por qué el texto se convierte primero a bytes (UTF-8) antes de codificarlo.

## Conceptos clave
- **Base64 / Base64url**: RFC 4648 §4 y §5.
- **Percent-encoding**: RFC 3986 §2.1. `encodeURIComponent` frente a `encodeURI`.
- **Doble encoding**: `%2f` → `%252f`, la base de muchas evasiones de filtros.

## Preguntas de repaso
1. ¿Cuántos caracteres Base64 ocupan 10 bytes? ¿Cuánto padding llevan?
2. ¿Por qué `btoa('ñ')` funciona pero `btoa('🐦')` lanza error?
3. ¿Qué parte de un JWT es Base64url y cuál no lo es?

## Práctica
- Decodifica a mano (sin la herramienta) `U2VjTGFi` y verifica el resultado con la herramienta.
- Laboratorios de PortSwigger sobre path traversal con doble encoding (ver la herramienta Path Traversal).
