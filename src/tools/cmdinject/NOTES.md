# Command Injection — apuntes

**Estado:** pendiente.

## Objetivos de aprendizaje
- Entender cuándo la entrada llega a una shell (`system()`, `exec()`, `shell=True`) y cuándo no (`execve` con argumentos).
- Confirmar una inyección ciega por tiempo y por canal fuera de banda (OOB).
- Prevenirla: evitar la shell, usar allowlists y, si no queda otra, un escapado correcto.

## Preguntas de repaso
1. ¿Por qué `ping -n 6` espera unos 5 segundos y no 6?
2. ¿Qué diferencia hay entre `;` y `&&` cuando el primer comando falla?
3. ¿Por qué `subprocess.run(["ping", host])` no es inyectable y `subprocess.run(f"ping {host}", shell=True)` sí?

## Práctica
- Laboratorios "OS command injection" de PortSwigger Web Security Academy.
- **Solo contra laboratorios propios o autorizados.**
