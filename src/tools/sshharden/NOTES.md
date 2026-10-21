# SSH Hardening — apuntes

**Estado:** pendiente.

## Objetivos de aprendizaje
- Las directivas que más reducen el riesgo: claves en vez de contraseñas, nada de root directo, menos reenvíos.
- Elegir algoritmos modernos (KEX, cifrados y MACs) y auditarlos con `ssh-audit`.
- Cómo encaja con PAM: en entornos con CyberArk, el acceso SSH privilegiado debería pasar por el PSM for SSH y no ir directo.

## Preguntas de repaso
1. ¿Qué diferencia hay entre `PermitRootLogin no` y `prohibit-password`?
2. ¿Por qué deshabilitar `AllowTcpForwarding` complica el pivoting?
3. ¿Qué hace `sshd -t` y por qué hay que ejecutarlo antes de recargar?

## Práctica
- Endurecer una VM propia, pasar `ssh-audit` antes y después, y guardar ambas salidas.
