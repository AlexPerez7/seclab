# Hash Suite

Calcula el hash de un texto o de un archivo con MD5, SHA-1, SHA-256, SHA-384 y SHA-512, genera HMAC y muestra el efecto avalancha. Todo se calcula en tu navegador: ni el texto ni los archivos salen de tu equipo.

## Cómo se usa

1. Elige una pestaña:
   - **texto**: escribe o pega el texto. La tabla se actualiza con cada tecla.
   - **archivo**: arrastra un archivo o haz clic para elegirlo.
   - **hmac**: elige el algoritmo y escribe la clave y el mensaje.
   - **avalancha**: escribe dos entradas casi iguales y compara sus hashes.
2. Copia el resultado con el botón **copiar** de cada fila.
3. Para verificar, pega el hash esperado en **comparar con un hash esperado**. Si coincide, la fila del algoritmo correcto se marca en verde. No hace falta saber qué algoritmo es.

## Casos de uso

- **Verificar una descarga**: comprobar que un ISO o un instalador coincide con el hash que publica el fabricante.
- **Saber si dos archivos son idénticos** sin compararlos byte a byte, por ejemplo una evidencia antes y después de copiarla.
- **Buscar un archivo sospechoso en VirusTotal** por su SHA-256, sin subir el archivo.
- **Depurar firmas HMAC** de webhooks (GitHub, Stripe…), que firman el cuerpo de la petición con un secreto compartido.
- **Estudiar** cómo se comportan las funciones hash y por qué MD5 ya no se usa para seguridad.

## Qué es una función hash

Una función hash criptográfica convierte una entrada de cualquier tamaño en una salida de tamaño fijo, el **digest**. Se le piden tres propiedades:

| Propiedad | Qué significa | Si se rompe… |
|---|---|---|
| Resistencia a preimagen | Dado un hash, no se puede encontrar una entrada que lo produzca | Se podría "revertir" un hash |
| Resistencia a segunda preimagen | Dada una entrada, no se puede encontrar otra distinta con el mismo hash | Se podría sustituir un archivo concreto por otro |
| Resistencia a colisiones | No se pueden encontrar dos entradas cualesquiera con el mismo hash | Se pueden fabricar dos documentos distintos con la misma firma |

Además, es **determinista** (la misma entrada da siempre el mismo hash) y tiene **efecto avalancha**: cambiar un solo bit de la entrada cambia, de media, la mitad de los bits de la salida. La pestaña **avalancha** lo muestra.

Un hash no se "descifra" porque no hay nada cifrado. Lo que hacen herramientas como hashcat es probar entradas (diccionarios, fuerza bruta) hasta encontrar una que dé el mismo hash.

## Algoritmos

| Algoritmo | Bits | Hex | Estado |
|---|---|---|---|
| MD5 | 128 | 32 | Roto: colisiones prácticas desde 2004. Solo vale como checksum contra errores, nunca contra un atacante. |
| SHA-1 | 160 | 40 | Roto: primera colisión pública en 2017 (SHAttered). Retirado de certificados y firmas. |
| SHA-256 | 256 | 64 | Seguro. El estándar de facto actual. |
| SHA-384 | 384 | 96 | Seguro. Es SHA-512 truncado y con otros valores iniciales. |
| SHA-512 | 512 | 128 | Seguro. Suele ser más rápido que SHA-256 en CPUs de 64 bits. |

SHA-256, SHA-384 y SHA-512 forman la familia **SHA-2**. SHA-3 es otra familia con un diseño distinto (esponja Keccak); no está en la herramienta porque WebCrypto no la incluye.

Cada hex representa 4 bits, así que la longitud en caracteres es bits ÷ 4. Es la pista más rápida para adivinar un algoritmo, aunque no es concluyente (ver la herramienta HashID).

## Cómo funciona MD5 por dentro

MD5 está implementado a mano en `src/tools/hash/logic.ts`, porque WebCrypto no lo trae. El código sigue la RFC 1321 paso a paso:

1. **Padding.** Se añade un bit `1`, luego ceros hasta que la longitud sea 448 mod 512 bits, y al final la longitud original en bits como entero de 64 bits little-endian. Así el mensaje queda en bloques exactos de 512 bits (64 bytes).
2. **Estado inicial.** Cuatro palabras de 32 bits, A, B, C y D, con valores fijos.
3. **Compresión.** Cada bloque de 64 bytes pasa por 4 rondas de 16 operaciones. Cada operación mezcla el estado con una palabra del bloque, una constante derivada de la función seno y una rotación de bits.
4. **Encadenado.** El resultado se suma al estado y pasa al bloque siguiente.
5. **Salida.** A, B, C y D concatenados en little-endian forman los 128 bits del hash.

Este esquema (procesar bloques y encadenar el estado) se llama **construcción Merkle–Damgård**. SHA-1 y SHA-2 la usan también.

## El ataque de extensión de longitud

En Merkle–Damgård, el hash final **es** el estado interno tras el último bloque. Si alguien conoce `H(secreto ‖ mensaje)` y la longitud del secreto, puede seguir procesando bloques desde ese estado y calcular `H(secreto ‖ mensaje ‖ padding ‖ extra)` **sin conocer el secreto**.

Por eso `SHA256(clave + mensaje)` no sirve para autenticar mensajes. Lo correcto es usar HMAC. SHA-384 y SHA-3 no son vulnerables: el primero porque trunca la salida y no expone el estado completo, el segundo por su diseño de esponja.

## HMAC

HMAC (RFC 2104) autentica un mensaje con una clave secreta compartida:

```
HMAC(K, m) = H( (K' ⊕ opad) ‖ H( (K' ⊕ ipad) ‖ m ) )
```

- `K'` es la clave rellenada con ceros hasta el tamaño de bloque (o hasheada antes, si es más larga).
- `ipad` es el byte `0x36` repetido y `opad` el byte `0x5c` repetido.

El hash anidado es lo que lo hace inmune a la extensión de longitud. Quien recibe el mensaje recalcula el HMAC con la misma clave y lo compara. Esa comparación debe hacerse **en tiempo constante**: si se compara carácter a carácter y se para en la primera diferencia, el tiempo de respuesta filtra cuántos caracteres acertó un atacante.

## Hashes y contraseñas

Esta herramienta **no** sirve para guardar contraseñas. MD5 y SHA-2 son rápidos a propósito, y eso es justo lo que no se quiere: una GPU actual prueba miles de millones de SHA-256 por segundo.

Para contraseñas se usan **funciones de derivación de claves (KDF)** lentas y con sal:

- **Sal**: un valor aleatorio distinto por usuario que se guarda junto al hash. Impide las tablas precalculadas y que dos usuarios con la misma contraseña tengan el mismo hash.
- **Coste**: el KDF repite el trabajo miles de veces (bcrypt, PBKDF2) o exige mucha memoria (scrypt, Argon2) para encarecer cada intento.

Un caso relevante para PAM: el hash **NTLM** de Windows es `MD4(contraseña en UTF-16LE)`, sin sal y rapidísimo. Quien lo roba puede autenticarse con él directamente (**pass-the-hash**), sin conocer la contraseña. Rotar las contraseñas de las cuentas privilegiadas tras cada uso, como hace un PAM, deja inservibles los hashes robados.

## Verificar un archivo desde la terminal

```powershell
# Windows (PowerShell): la salida viene en mayúsculas, es el mismo hash
Get-FileHash .\archivo.iso -Algorithm SHA256
certutil -hashfile archivo.iso SHA256
```

```bash
# Linux / macOS
sha256sum archivo.iso
sha256sum -c SHA256SUMS      # comprueba todos los archivos listados
```

Un hash publicado en el mismo servidor que el archivo solo protege contra descargas corruptas. Si un atacante controla el servidor, cambia los dos. Para la **autenticidad** hace falta una firma (GPG, Authenticode) que dependa de una clave que el atacante no tenga.

## Errores comunes

- **El salto de línea final.** `echo hola | sha256sum` hashea `hola\n`, no `hola`. Usa `echo -n` o `printf`.
- **La codificación del texto.** La herramienta usa UTF-8. "ñ" en UTF-8 son 2 bytes y en Latin-1 es 1, así que los hashes no coinciden.
- **Mayúsculas y minúsculas.** `ABC123` y `abc123` en hex son el mismo valor. El comparador lo ignora.
- **Confundir hash con cifrado.** Si necesitas recuperar el dato original, lo que buscas es cifrado (AES), no un hash.

## Glosario

- **Digest**: la salida de la función hash.
- **Colisión**: dos entradas distintas con el mismo hash.
- **Sal (salt)**: valor aleatorio por usuario que se añade antes de hashear una contraseña.
- **Pepper**: secreto global que se añade a todas las contraseñas y se guarda fuera de la base de datos.
- **KDF**: función de derivación de claves; lenta a propósito (bcrypt, scrypt, Argon2, PBKDF2).
- **HMAC**: código de autenticación de mensajes basado en un hash y una clave.
