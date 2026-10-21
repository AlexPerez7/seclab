# Encoders

Convierte texto a Base64, Base64url, hexadecimal, URL-encoding y binario, y de vuelta. Todo el texto se trata como UTF-8.

## Cómo se usa

1. Elige el formato: **Base64**, **Base64url**, **Hex**, **URL** o **Binario**.
2. Elige la dirección: **codificar** o **decodificar**.
3. Escribe o pega en **entrada**. La **salida** se actualiza al instante.
4. Si la entrada no es válida para ese formato, la salida muestra el error en rojo.
5. **usar salida como entrada** invierte la operación. Sirve para encadenar pasos, por ejemplo decodificar un Base64 que contenía otro Base64.

## Casos de uso

- **Leer un JWT**: el header y el payload son Base64url. Decodificar cada parte muestra el JSON.
- **Entender una petición HTTP**: la cabecera `Authorization: Basic …` es `usuario:contraseña` en Base64.
- **Preparar un payload para una URL**: URL-encode de un parámetro con espacios, `&` o `/`.
- **Analizar contenido ofuscado**: cadenas en hex o Base64 dentro de scripts, correos de phishing o logs.
- **Estudiar**: ver los bytes reales (hex, binario) de un texto con acentos o emoji.

## Codificar no es cifrar

Codificar cambia la **representación** de los datos, sin ninguna clave. Cualquiera puede revertirlo. Cifrar los transforma con una clave y sin ella no se recuperan. Hashear los resume en un valor de tamaño fijo y no tiene vuelta atrás.

| | ¿Necesita clave? | ¿Reversible? | Ejemplo |
|---|---|---|---|
| Codificación | No | Sí, por cualquiera | Base64, hex, URL |
| Cifrado | Sí | Sí, con la clave | AES, RSA |
| Hash | No | No | SHA-256 |

Una contraseña "protegida" con Base64 está en claro.

## Base64 por dentro

Base64 (RFC 4648) toma los bytes de 3 en 3 (24 bits) y los parte en 4 grupos de 6 bits. Cada grupo (0–63) se traduce con el alfabeto `A–Z a–z 0–9 + /`.

Ejemplo con `Man`:

```
M        a        n
01001101 01100001 01101110      ← 3 bytes
010011 010110 000101 101110     ← 4 grupos de 6 bits
19     22     5      46
T      W      F      u          ← "TWFu"
```

Si el último grupo tiene 1 o 2 bytes, se completa con ceros y se añade `=` por cada byte que faltaba: `Ma` → `TWE=`, `M` → `TQ==`.

Consecuencias prácticas:
- Base64 ocupa un **33 % más** que el original (3 bytes → 4 caracteres).
- La longitud siempre es múltiplo de 4 si lleva padding.
- Un texto que termina en `=` o `==` y solo usa ese alfabeto es casi seguro Base64.

## Base64url

Variante de la RFC 4648 §5 para URLs y nombres de archivo: cambia `+` por `-` y `/` por `_`, que en una URL tienen significado propio, y normalmente quita el padding `=`. Es el formato de las tres partes de un JWT.

## Hexadecimal

Cada byte se escribe como dos dígitos hex (`00`–`ff`). Es la representación habitual de hashes, volcados de memoria y paquetes de red. La herramienta acepta espacios y el prefijo `0x` al decodificar.

## URL-encoding

En una URL algunos caracteres tienen significado (`?`, `&`, `=`, `/`, `#`). Para usarlos como dato se escriben como `%` seguido del byte en hex: el espacio es `%20` y `&` es `%26`. Los caracteres fuera de ASCII se codifican byte a byte en UTF-8: `ñ` → `%C3%B1`.

- La herramienta usa `encodeURIComponent`, que codifica también `/`, `?` y `&`. Es lo correcto para el **valor** de un parámetro.
- En formularios (`application/x-www-form-urlencoded`) el espacio se escribe `+`. Al decodificar, la herramienta acepta las dos formas.

## Binario

Cada byte como 8 bits, separados por espacios. Útil para ver por qué un carácter como `ñ` ocupa 2 bytes en UTF-8: `11000011 10110001`.

## Codificación y evasión de filtros

Muchas vulnerabilidades web aparecen cuando una capa valida la entrada **antes** de decodificarla y otra la usa **después**:

- Un filtro que bloquea `../` no ve `..%2f`, pero el servidor lo decodifica a `../` (ver Path Traversal).
- Si la aplicación decodifica dos veces, `%252f` pasa el filtro como `%2f` y termina siendo `/`. Es el **doble encoding**.

La defensa es **normalizar primero y validar después**, sobre el valor final que se va a usar.

## Errores comunes

- **"El resultado no es texto UTF-8 válido"**: los bytes decodificados son binarios (una imagen, un ejecutable) o están en otra codificación. Que la decodificación falle como texto no significa que el Base64 esté mal.
- **PowerShell `-EncodedCommand`** usa Base64 de texto **UTF-16LE**, no UTF-8. Al decodificarlo aquí, entre cada letra aparece un byte nulo invisible. Es una limitación conocida de la herramienta.
- **Contiene `-` o `_`**: no es Base64 estándar sino Base64url. Cambia de formato.
