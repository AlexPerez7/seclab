# HTTP Request Builder — apuntes

**Estado:** pendiente.

## Objetivos de aprendizaje
- La anatomía de una petición HTTP/1.1: request-line, headers, CRLF, línea vacía y body.
- Por qué `Host` es obligatorio en HTTP/1.1 y qué ataques nacen de confiar en él (host header injection, envenenamiento del reset de contraseña).
- La relación entre `Content-Length`, `Transfer-Encoding` y el request smuggling (backlog: `smuggler`).

## Preguntas de repaso
1. ¿Qué pasa si el `Content-Length` no coincide con el body real?
2. ¿Basic Auth cifra la contraseña?
3. ¿Qué diferencia hay entre `--data` y `--data-raw` en curl?

## Práctica
- Mandar la petición cruda con `ncat --ssl example.com 443` y comparar con lo que muestra Burp.
