# HashID — apuntes

**Estado:** listo (2026-10-21). Reescrita desde cero: la de HackNexus tenía modos de hashcat incorrectos (p. ej. 17400 como "SHA-512/256", cuando es SHA3-256) y no cubría Kerberos, NetNTLM ni DCC2.

## Objetivos de aprendizaje
- Reconocer a simple vista los formatos más comunes: hex crudo, crypt (`$id$`), LM/NTLM, bcrypt y Kerberos (`$krb5tgs$`).
- Entender el formato Modular Crypt: `$id$params$salt$hash`.
- Saber elegir el modo de hashcat y el formato de John.

## Preguntas de repaso
1. ¿Qué significa el `10` en `$2y$10$…`? ¿Cuánto más lento es `12`?
2. ¿Por qué no se puede distinguir un MD5 de un NTLM solo por el hash?
3. ¿Qué formato tiene un hash obtenido por Kerberoasting y qué modo de hashcat usa?

## Práctica
- Sacar los hashes de `/etc/shadow` de una VM propia e identificarlos.
- Relacionarlo con PAM: ¿qué hashes guarda un dominio AD y por qué rotarlos con CyberArk reduce el riesgo de pass-the-hash?
