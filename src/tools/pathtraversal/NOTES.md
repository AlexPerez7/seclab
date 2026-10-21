# Path Traversal — apuntes

**Estado:** pendiente.

## Objetivos de aprendizaje
- Entender por qué ocurre: la aplicación concatena entrada del usuario a una ruta del sistema de archivos.
- Saber qué capa decodifica qué (proxy, servidor web, framework, aplicación) y por qué funciona el doble encoding.
- Aplicar la defensa correcta: canonicalizar, comprobar que la ruta sigue dentro del directorio base y usar una allowlist.

## Preguntas de repaso
1. ¿Por qué filtrar `../` con un replace no recursivo se salta con `....//`?
2. ¿En qué se diferencia un path traversal de un LFI en PHP?
3. ¿Qué es un Zip Slip?

## Práctica
- Laboratorios "Path traversal" de PortSwigger Web Security Academy (son 6, de apprentice a practitioner).
- **Solo contra laboratorios propios o autorizados.**
