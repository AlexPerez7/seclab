# Puertos & Servicios — apuntes

**Estado:** listo (2026-10-21). 63 puertos en `logic.ts` con notas de pentest y defensa, incluido el 1858 del Vault de CyberArk.

## Objetivos de aprendizaje
- Memorizar los ~30 puertos que aparecen en casi cualquier pentest o certificación.
- Reconocer un controlador de dominio solo por sus puertos (53, 88, 135, 389, 445, 636, 3268).
- Saber qué superficie de ataque abre cada servicio y cómo se cierra.

## Preguntas de repaso
1. ¿Qué diferencia hay entre 389, 636 y 3268?
2. ¿Por qué SMB signing desactivado habilita el relay NTLM?
3. En una arquitectura CyberArk, ¿qué componentes necesitan llegar al 1858 y cuáles no?

## Práctica
- Escanear una VM propia con `nmap -sV` y pegar el resultado en la herramienta.
