# HashID

Identifica el formato de un hash a partir de su aspecto: longitud, alfabeto, prefijos y estructura. Para cada candidato muestra el modo de hashcat, el formato de John the Ripper y el comando para empezar a probar.

## Cómo se usa

1. Pega uno o varios hashes en el cuadro, **uno por línea**. Las líneas vacías y las que empiezan por `#` se ignoran.
2. Cada hash muestra su lista de candidatos ordenada por confianza:
   - **alta**: el formato tiene una marca inequívoca (un prefijo como `$6$` o una estructura fija).
   - **media**: el candidato más habitual para esa longitud de hex.
   - **baja**: posible, pero menos común.
3. Si es un hash conocido (por ejemplo, el de una contraseña vacía), aparece un aviso azul.
4. Para formatos crypt (`$1$`, `$5$`, `$6$`, `$2b$`, `$y$`) se muestra el **desglose**: algoritmo, coste, sal y hash.
5. Abajo tienes los comandos de hashcat y John para el candidato más probable, listos para copiar.
6. Los botones de **ejemplos** cargan hashes típicos para practicar.

## Casos de uso

- **Pentest o CTF**: encontraste hashes en una base de datos, un fichero de configuración o un volcado, y necesitas saber qué modo de hashcat usar.
- **Active Directory**: distinguir un NTLM de un NetNTLMv2 capturado, de un ticket de Kerberoasting o de un DCC2. Cada uno se ataca (o no) de forma distinta.
- **Auditoría de Linux**: ver en `/etc/shadow` qué algoritmo y cuántas rondas usa cada cuenta.
- **Revisar una aplicación**: comprobar si guarda contraseñas con un KDF (bcrypt, Argon2) o con un hash rápido (MD5, SHA-1).

## Por qué identificar un hash es ambiguo

Un hash crudo no dice de dónde viene. 32 caracteres hex pueden ser MD5, NTLM, MD4 o LM: todos producen 128 bits. La herramienta ordena los candidatos por probabilidad, pero **el contexto decide**:

- Si salió de un volcado de Windows (SAM, NTDS.dit, mimikatz, secretsdump), es NTLM.
- Si salió de una base de datos de una aplicación web, probablemente es MD5 (y es un mal diseño).

Con hashcat puedes confirmar el formato antes de lanzar un ataque largo:

```bash
hashcat --identify hashes.txt          # hashcat sugiere los modos posibles
hashcat --example-hashes -m 1000       # muestra un hash de ejemplo de ese modo
```

## Las pistas, de más a menos fiables

1. **Prefijo**: `$6$`, `$2b$`, `$krb5tgs$`, `{SSHA}`… identifican el formato sin duda.
2. **Estructura**: separadores `:` o `$` en posiciones fijas, como `usuario::dominio:…` en NetNTLMv2 o `usuario:RID:LM:NT:::` en pwdump.
3. **Alfabeto**: hex (`0-9a-f`), Base64 (`A-Za-z0-9+/=`) o el Base64 de crypt (`./0-9A-Za-z`).
4. **Longitud**: la longitud en hex es bits ÷ 4. 32 → 128 bits, 40 → 160, 64 → 256, 128 → 512.

## Modular Crypt Format

Es el formato de `/etc/shadow` y de muchas librerías de contraseñas: `$id$parámetros$sal$hash`.

| id | Algoritmo | Coste | Notas |
|---|---|---|---|
| `1` | md5crypt | 1000 rondas fijas | Obsoleto |
| `apr1` | md5crypt de Apache | 1000 rondas fijas | Ficheros `.htpasswd` |
| `5` | sha256crypt | `rounds=` (5000 por defecto) | |
| `6` | sha512crypt | `rounds=` (5000 por defecto) | Muy común en Linux |
| `2a`, `2b`, `2y` | bcrypt | 2^coste iteraciones | `$2b$12$` = 4096 iteraciones |
| `y` | yescrypt | parámetros codificados | Por defecto en Debian 11+, Ubuntu 22.04+ y Fedora 35+ |

La **sal** va en claro dentro del hash. No es un secreto: su función es que dos usuarios con la misma contraseña tengan hashes distintos e impedir las tablas precalculadas.

## Formatos de Windows y Active Directory

Son los que más aparecen en entornos corporativos y en PAM. Conviene distinguirlos bien, porque no todos se atacan igual:

| Formato | hashcat | De dónde sale | ¿Pass-the-hash? |
|---|---|---|---|
| NTLM (NT) | 1000 | SAM local, NTDS.dit, memoria de LSASS | **Sí**: se usa directamente para autenticarse |
| LM | 3000 | Sistemas muy antiguos | Obsoleto |
| NetNTLMv1 | 5500 | Capturado en la red (Responder) | No, pero es débil |
| NetNTLMv2 | 5600 | Capturado en la red (Responder, relay) | No: hay que crackearlo o retransmitirlo |
| DCC2 / mscash2 | 2100 | Credenciales de dominio cacheadas en el equipo | No, y es lento de crackear |
| Kerberos TGS-REP (RC4) | 13100 | Kerberoasting: pedir un ticket para una cuenta con SPN | No |
| Kerberos AS-REP | 18200 | Cuentas sin preautenticación Kerberos | No |

Dos valores que conviene reconocer de memoria:

- `aad3b435b51404eeaad3b435b51404ee` en el campo LM significa que LM está deshabilitado (lo normal hoy).
- `31d6cfe0d16ae931b73c59d7e0c089c0` es el NTLM de una **contraseña vacía**.

**Relación con PAM:** NTLM permite pass-the-hash, y Kerberoasting ataca contraseñas de cuentas de servicio que casi nunca se cambian. Un PAM mitiga los dos casos con contraseñas largas y aleatorias que rotan automáticamente: un hash robado deja de servir tras la rotación, y una contraseña aleatoria de 30 caracteres no se crackea.

## Del hash al ataque

Una vez identificado, el ataque básico es un diccionario:

```bash
hashcat -m 1800 -a 0 hashes.txt rockyou.txt
john --format=sha512crypt --wordlist=rockyou.txt hashes.txt
```

El modo cambia radicalmente la velocidad. En la misma GPU, NTLM (1000) se prueba miles de veces más rápido que bcrypt (3200) o sha512crypt (1800). Esa diferencia es la razón de usar KDF lentos para guardar contraseñas.

**Usa esto solo con hashes propios o de un trabajo autorizado.**

## Defensa

- Guardar contraseñas con **Argon2id, bcrypt o yescrypt**, nunca con MD5/SHA-x sin sal.
- En Linux, comprobar que `/etc/shadow` usa `$y$` o `$6$` con suficientes rondas.
- En AD: deshabilitar LM y NTLMv1, dar a las cuentas de servicio contraseñas largas (o usar gMSA), y forzar AES en Kerberos para que no se emitan tickets RC4.
- Las cuentas privilegiadas, en un PAM con rotación.

## Errores comunes

- **Espacios o saltos de línea pegados**: la herramienta recorta los extremos de cada línea, pero un espacio en medio rompe el formato.
- **Copiar solo una parte**: los tickets de Kerberos y los NetNTLMv2 son largos. Si falta un trozo, no se reconocen o hashcat los rechaza.
- **pwdump completo en hashcat**: hashcat espera solo el hash NT. Extrae el 4.º campo (la herramienta lo muestra) o usa `--username` con el formato `usuario:hash`.
- **Fiarse del primer candidato** de un hex crudo sin mirar el contexto.
