# JWT Toolkit

Decodifica, verifica y firma JSON Web Tokens HS256/384/512, audita sus problemas de seguridad y reproduce los dos ataques más comunes: `alg=none` y secreto débil. Todo ocurre en tu navegador: el token y el secreto no salen de tu equipo.

## Cómo se usa

1. **decodificar**: pega un token (con o sin `Bearer `).
   - Se colorea por partes: header en rojo, payload en morado y firma en azul.
   - Abajo ves el header y el payload como JSON, con `exp`, `iat` y `nbf` convertidas a fecha.
   - En **verificar firma**, escribe el secreto: te dice si la firma coincide.
   - **Auditoría** lista los problemas del token por gravedad.
2. **firmar**: elige el algoritmo, edita el payload en JSON y escribe el secreto. El token se genera al instante. **decodificar este token** lo lleva a la primera pestaña.
3. **ataques**: trabaja sobre el token de la pestaña decodificar.
   - **alg = none**: edita el payload (por ejemplo `"role": "admin"`) y copia el token sin firma.
   - **Secreto débil**: prueba la lista integrada de secretos comunes o carga tu propia wordlist en `.txt`.

## Casos de uso

- **Depurar una integración**: ver qué claims manda realmente un proveedor de identidad (Entra ID, Okta, Keycloak) y cuándo caduca el token.
- **Pentest de una API**: comprobar si acepta `alg=none`, tokens expirados o payloads modificados, y si el secreto HS256 es débil.
- **Revisar un diseño**: detectar datos sensibles en el payload, tokens sin `exp` o vidas demasiado largas.
- **Generar tokens de prueba** para tu propia aplicación en desarrollo.
- **Estudiar**: ver en la práctica qué se firma, qué se codifica y qué no se cifra.

## Anatomía de un JWT

Un JWT firmado (JWS, RFC 7515) son tres partes en Base64url separadas por puntos:

```
eyJhbGciOiJIUzI1NiJ9 . eyJzdWIiOiJhbGV4In0 . PWOAVQ1-6trhs_aVGCNbxRC8ObQlFkA647TJmyyn3vU
└─────── header ───┘   └──── payload ────┘   └───────────── firma ─────────────────┘
{"alg":"HS256"}        {"sub":"alex"}        HMAC-SHA256 con el secreto "secret"
```

Pega ese token (sin los espacios) en la pestaña decodificar y verifícalo con `secret`.

- **Header**: metadatos, sobre todo `alg` (algoritmo de firma) y a veces `kid` (qué clave usar).
- **Payload**: los *claims*, es decir, los datos.
- **Firma**: `HMAC-SHA256(secreto, base64url(header) + "." + base64url(payload))` en HS256. Se firma el texto Base64url, no el JSON original.

**El payload no está cifrado.** Cualquiera que tenga el token lo lee, como hace esta herramienta. La firma solo garantiza que nadie lo modificó sin conocer la clave. Si un token tiene **5 partes** es un JWE (RFC 7516): ese sí va cifrado.

## Claims registrados

| Claim | Significado | Qué debe comprobar el servidor |
|---|---|---|
| `iss` | Emisor | Que sea el emisor esperado |
| `sub` | Sujeto (normalmente el id de usuario) | |
| `aud` | Destinatario | Que el token sea para **este** servicio |
| `exp` | Expiración (segundos epoch) | Que no haya pasado |
| `nbf` | No válido antes de | Que ya haya llegado |
| `iat` | Emitido en | Opcional: rechazar tokens demasiado viejos |
| `jti` | Id único del token | Útil para revocar o evitar reutilización |

Las fechas son **segundos** desde 1970, no milisegundos. Un `exp` con 13 dígitos es un error típico de JavaScript (`Date.now()` devuelve milisegundos).

## Algoritmos

| Familia | Clave | Quién puede firmar | Quién puede verificar |
|---|---|---|---|
| HS256/384/512 | Secreto compartido (HMAC) | Cualquiera con el secreto | Cualquiera con el secreto |
| RS256, PS256 | Par RSA | Solo el emisor (clave privada) | Cualquiera (clave pública) |
| ES256 | Par de curva elíptica | Solo el emisor | Cualquiera |
| none | Ninguna | Cualquiera | Nadie: no hay firma |

Con HS*, todo servicio que verifica también puede **emitir** tokens válidos. Por eso en arquitecturas con varios servicios se prefiere RS256/ES256: el proveedor de identidad firma y los demás solo verifican con la clave pública, que se publica en un JWKS.

## Ataques

### alg = none

Algunas librerías antiguas leían el `alg` **del propio token** para decidir cómo verificar. Con `"alg": "none"`, la verificación no hace nada y cualquier payload es aceptado. Las variantes `None`, `NONE` o `nOnE` saltan listas negras que comparan solo con `"none"`.

### Secreto débil

Con un único token HS* se pueden probar secretos **offline**: se recalcula el HMAC con cada candidato y se compara con la firma. No hay límite de intentos ni rastro en el servidor. Si el secreto es una palabra (`secret`, `changeme`, el de la documentación), cae en segundos:

```bash
hashcat -m 16500 -a 0 token.txt wordlist.txt
```

Según la RFC 7518 §3.2, la clave de HS256 debe tener **al menos 256 bits**: 32 bytes aleatorios, no una palabra de 32 letras.

### Confusión de algoritmo (RS256 → HS256)

Si el servidor verifica con una función genérica del tipo `verify(token, clave)` y deja que el token elija el algoritmo, un atacante puede:

1. Tomar la **clave pública** RSA del servidor, que es pública por definición.
2. Firmar un token con **HS256** usando esa clave pública como secreto HMAC.
3. El servidor "verifica" HS256 con la misma clave pública… y la firma cuadra.

La defensa es fijar el algoritmo esperado en el servidor y no leerlo del token.

### Header manipulado: kid, jku, x5u y jwk

- **`kid`**: si el servidor lo usa para leer un fichero o hacer una consulta SQL, es inyectable (path traversal o SQLi), y a veces permite forzar una clave conocida.
- **`jku` / `x5u`**: una URL de la que descargar las claves. Si el servidor la sigue, el atacante apunta a su propio JWKS y firma con su propia clave.
- **`jwk`**: la clave pública va incrustada en el header. Si el servidor la usa, el atacante firma con su propia clave y la incluye.

### Tokens que no caducan

Sin `exp`, un token robado (de un log, de un proxy o por XSS) sirve para siempre. Y un JWT **no se puede revocar** de forma nativa: el servidor lo acepta mientras la firma sea válida y no haya caducado. Por eso se usan tokens de acceso de minutos y tokens de refresco que sí se pueden revocar.

## Defensa

- **Fijar el algoritmo** en el servidor con una lista blanca. Nunca aceptar `none`.
- Validar siempre `exp`, `nbf`, `iss` y `aud`, con un margen pequeño de desfase de reloj.
- En HS*, un secreto de al menos tantos bits como el hash, aleatorio, guardado en un gestor de secretos y rotado. Si varios servicios verifican, mejor RS256/ES256.
- Ignorar `jku`, `x5u` y `jwk` del token. Si hay `kid`, buscarlo en una lista fija de claves.
- Nada sensible en el payload.
- Tokens de acceso cortos (5–15 min) y refresh tokens revocables.
- En el navegador, preferir cookies `HttpOnly` + `Secure` + `SameSite` a `localStorage`, que un XSS puede leer.

## Errores comunes

- **Decodificar no es verificar.** Leer el payload no prueba nada. Un servidor que usa los claims de un token sin verificar la firma acepta cualquier cosa.
- **Base64 frente a Base64url.** Los JWT usan Base64url sin padding. Decodificarlos con Base64 estándar falla cuando aparecen `-` o `_`.
- **`exp` en milisegundos.** Un `exp` de 13 dígitos significa que el token caduca dentro de unos 50 000 años.
- **Firmar el JSON en vez del Base64url.** La firma se calcula sobre `header.payload` ya codificados. Un espacio de más en el JSON cambia la firma.
