# Backlog — herramientas fuera del núcleo inicial

Las **159** herramientas de [HackNexus](https://github.com/D1se0/hacknexus) que no entran en la primera versión de SecLab.
Están todas anotadas para poder sumarlas más adelante. La misma lista se ve en la app, en la página **Backlog**.

## Etiquetas

| Etiqueta | Significado | Cantidad |
|---|---|---|
| ⭐ candidata | Buena siguiente incorporación para estudiar: lógica verificable y sin dependencias externas | 35 |
| 🌐 red | Llama a APIs o CDNs de terceros, o ejecuta runtimes externos: revisar qué datos salen del navegador | 32 |
| ⚠️ sensible | Ofensiva o delicada (shells, phishing, OSINT de personas, badUSB, cracking): solo contra laboratorios propios, y probablemente la marque el antivirus | 26 |

## Cómo promover una herramienta al núcleo

1. Quitarla de `src/data/backlog.ts` y de este archivo.
2. Añadirla a `src/lib/registry.ts` con su ruta de estudio (`track`), `status: 'pendiente'` y sus fuentes primarias.
3. Crear `src/tools/<id>/` con `index.tsx`, `logic.ts`, `logic.test.ts` y `NOTES.md` (copiar la estructura de `encoders`).
4. Seguir la checklist de "Definition of done" en `PLAN.md`.

El código original de cada una está en `hacknexus/src/tools/<Fichero>.tsx`, y su lógica normalmente en `hacknexus/src/lib/<id>.ts`.

## Análisis (21)

| Herramienta | id / fichero | Etiquetas | Descripción |
|---|---|---|---|
| **CVE Lookup** | `cvelookup` / `Cvelookup.tsx` | 🌐 | Consulta CVEs en la NVD con CVSS, descripción y referencias |
| **Cron Guru** | `cronguru` / `Cronguru.tsx` | ⭐ | Explica expresiones cron y calcula las próximas ejecuciones |
| **Regex Lab** | `regex` / `Regex.tsx` | ⭐ | Prueba expresiones regulares con grupos, matches y flags |
| **Defanger / Refanger** | `defanger` / `Defanger.tsx` | ⭐ | Defangea o refangea IPs, dominios y URLs para reportes |
| **UUID & IDs** | `uuid` / `Uuid.tsx` |  | Genera UUID v4, NanoID y ObjectIds con validación |
| **Windows Event IDs** | `winlog` / `Winlog.tsx` | ⭐ | Significado y detección de los eventos clave del log Security/System para forense y blue team |
| **IOC Extractor** | `iocextract` / `Iocextract.tsx` | ⭐ | Extrae IPs, dominios, hashes, CVEs, wallets y técnicas MITRE de cualquier texto con contexto y enlaces de análisis |
| **Log Anonymizer** | `loganonymize` / `Loganonymize.tsx` |  | Pseudonimiza IPs, usuarios y dominios de forma consistente y reversible para compartir logs sin exponer nada |
| **Username OSINT** | `userosint` / `Userosint.tsx` | 🌐 ⚠️ | Investiga un alias: plataformas donde existe, patrón que sigue, variantes y dorks listos para Google y GitHub |
| **Email OSINT** | `emailosint` / `EmailOsint.tsx` | 🌐 ⚠️ | Huellas de un email: Gravatar (perfil+avatar), filtraciones vía XposedOrNot, commits de GitHub firmados con esa dirección y dorks listos |
| **Phone Validator & OSINT** | `phonevalidator` / `PhoneValidator.tsx` | 🌐 ⚠️ | Valida números contra el plan E.164 de 55 países, comprueba EN VIVO si existe y está registrado (HLR vía Veriphone/numverify + sonda WhatsApp), y valida IMEI |
| **Phone Hunter** | `phonehunter` / `PhoneHunter.tsx` | ⚠️ | Dossier OSINT de identidad detrás de un número: lo que revela, plan de investigación en 10 pasos, 20+ fuentes, marco legal y solicitudes ARCO/RGPD<br>_Nota: OSINT sobre personas: delicado legalmente; solo como lectura._ |
| **Sysmon Config Builder** | `sysmonbuilder` / `Sysmonbuilder.tsx` | ⭐ | Configuración XML de Sysmon con perfiles y guía ofensiva/defensiva de cada evento: el punto de partida de todo SOC |
| **Config Diff** | `confdiff` / `Confdiff.tsx` |  | Diff semántico de ficheros de configuración: ignora comentarios y orden, resalta directivas de seguridad que cambiaron |
| **GTFOBins Explorer** | `gtfobins` / `Gtfobins.tsx` | ⭐ | Base de datos COMPLETA de GTFOBins: 458 binarios UNIX con todos sus comandos de abuso por contexto (sudo, SUID, capabilities) |
| **Usuario Generator** | `usergen` / `Usergen.tsx` | ⚠️ | Variaciones de usernames y emails corporativos con 9 convenciones y service accounts para enumeración y spraying |
| **Diccionario de Acrónimos** | `acronyms` / `Acronyms.tsx` |  | 196 acrónimos de ciberseguridad con definición en español organizados por dominio: de APT a YARA |
| **Team Health Check** | `healthcheck` / `HealthCheck.tsx` |  | Escaneo real de tu equipo (CPU, RAM, batería, red, GPU) con benchmark, desgaste estimado por antigüedad y plan de mantenimiento<br>_Nota: Fuera de alcance: no es una herramienta de seguridad._ |
| **Regex ReDOS Analyzer** | `redos` / `Redos.tsx` |  | Detecta backtracking catastrófico en regex: análisis estructural + medición real del matching en worker con entradas crecientes |
| **Payload Time Machine** | `malwaretime` / `MalwareTime.tsx` |  | Museo interactivo del malware: 35 años de ataques con su impacto, técnicas MITRE que popularizó y la lección de defensa que dejó |
| **Keystroke Biometrics** | `biometrics` / `Biometrics.tsx` |  | Biometría conductual del teclado: dwell y flight time, perfil estadístico de tu escritura y detector de bots por ritmo — el MFA invisible de los bancos, capturado y analizado en local |

## Contraseñas (6)

| Herramienta | id / fichero | Etiquetas | Descripción |
|---|---|---|---|
| **Generador de Contraseñas** | `passgen` / `Passgen.tsx` | ⭐ | Contraseñas, frases y PINs criptográficamente seguros con análisis de fortaleza |
| **Auditor de Contraseñas** | `passaudit` / `Passaudit.tsx` | 🌐 | Fortaleza zxcvbn, tiempo de crackeo y filtraciones vía k-anonymity |
| **Passphrase Forge** | `passforge` / `Passforge.tsx` |  | Passphrases Diceware con WebCrypto, tiempos de crackeo por adversario y lote de candidatas listas para el gestor |
| **Mask Gen** | `maskgen` / `Maskgen.tsx` |  | Máscaras hashcat con keyspace exacto, muestras en vivo y avisos de patrones débiles para dirigir la fuerza bruta |
| **Password Policy Auditor** | `policyaudit` / `Policyaudit.tsx` | ⭐ | Audita tu política contra NIST 800-63B con veredicto puntuado y genera pwquality.conf y la PSO de Windows coherentes |
| **Password Policy Builder** | `pwpolicy` / `Pwpolicy.tsx` | ⭐ | Políticas coherentes Linux/Windows según NIST 800-63B: longitud sobre complejidad, sin rotación suicida, con bloqueo |

## Criptografía (12)

| Herramienta | id / fichero | Etiquetas | Descripción |
|---|---|---|---|
| **Hash Cracker** | `cracker` / `Cracker.tsx` | 🌐 ⚠️ | Cracking de hashes con rockyou.txt y reglas, en un worker con estadísticas en vivo<br>_Nota: Descarga rockyou desde un CDN. Útil para estudiar hashing, pero hay que revisar el origen del diccionario._ |
| **AES & Fernet** | `aes` / `Aes.tsx` | ⭐ | Cifra/descifra con AES-CBC/GCM y deriva claves con PBKDF2 |
| **TOTP Generator** | `totp` / `Totp.tsx` | ⭐ | Códigos 2FA en vivo estilo Google Authenticator con QR |
| **HackingChef** | `hackingchef` / `Hackingchef.tsx` |  | Cadena codificaciones, cifrados y transformaciones en recetas con resultado en vivo |
| **Emoji & ZW Encoder** | `emoji` / `Emoji.tsx` |  | Codifica payloads en emojis y texto invisible zero-width |
| **Cifrados Clásicos** | `classics` / `Classics.tsx` | ⭐ | César/ROT13/ROT47, Vigenère, Atbash, XOR y criptoanálisis automático |
| **Hash Visual Fingerprint** | `hashvisual` / `HashVisual.tsx` |  | Convierte cualquier hash en un identicon determinista y compara dos de un vistazo: certificados, binarios o claves sin leer hex |
| **X.509 Decoder** | `x509` / `X509.tsx` | ⭐ | Pega un PEM y desglosa SAN, EKU, keyUsage, BasicConstraints y flags de sospecha: CA:TRUE inesperada, SHA1, wildcards y auto-firmados |
| **Classical Cipher Breaker** | `classcipher` / `ClassicalCipher.tsx` |  | Criptoanálisis ejecutado: Caesar resuelto por chi-cuadrado, Vigenère por Kasiski e índice de coincidencia, sustitución por hill-climbing con cuadrigramas, XOR por fuerza bruta — ES/EN |
| **Asymmetric Crypto Playground** | `pubkeylab` / `PubkeyLab.tsx` |  | Diffie-Hellman y RSA textbook ejecutándose con BigInt: keygen desde primos, cifrado por bloques, ataque de factorización real sobre n pequeño y modpow paso a paso |
| **BIP39 Seed Lab** | `bip39` / `Bip39Lab.tsx` |  | Mnemonics BIP39 reales: genera con entropía criptográfica, valida checksum y anatomía bit a bit, repara una palabra por fuerza bruta y deriva la seed PBKDF2 — con lecciones de seguridad wallet |
| **Passkeys Lab** | `passkeys` / `PasskeysLab.tsx` |  | Anatomía de WebAuthn: decodificador CBOR de attestationObject, flags del authenticatorData, clave pública COSE, clientDataJSON y ceremonia real de registro — la passkey disseccionada byte a byte |

## Forense (12)

| Herramienta | id / fichero | Etiquetas | Descripción |
|---|---|---|---|
| **File Analyzer** | `fileanalyzer` / `Fileanalyzer.tsx` | ⭐ | Magic bytes, entropía, strings y hashes de cualquier archivo |
| **EXIF & Metadatos** | `exif` / `Exif.tsx` | ⭐ | Extrae metadatos GPS, cámara y software de imágenes, HEIC, PDFs y más |
| **Esteganografía LSB** | `stego` / `Stego.tsx` |  | Oculta y extrae mensajes en el canal LSB de imágenes PNG |
| **Log Forensics** | `logparser` / `Logparser.tsx` | ⭐ | Analiza auth.log/syslog y EVTX-XML: fuerza bruta, logins, sudo, eventos sospechosos y timeline |
| **File Carver** | `filecarver` / `Filecarver.tsx` |  | Recupera imágenes, PDFs y ZIP embebidos en dumps escaneando magic bytes, con preview y SHA-256 |
| **Stego Audio** | `stegoaudio` / `StegoAudio.tsx` |  | Esteganografía LSB sobre WAV/PCM real: incrusta y extrae mensajes, con waveform y espectrograma calculados por FFT propia |
| **Zero-Width Stego** | `zerowidth` / `ZeroWidthStego.tsx` |  | Tinta invisible en texto plano: oculta y extrae mensajes con caracteres de ancho cero (binario, denso, por palabra), sanitizer forense y watermarking de filtraciones |
| **MalDoc Autopsy** | `maldoc` / `MalDocAutopsy.tsx` |  | Autopsia de documentos maliciosos sin ejecutar nada: gatillos PDF (/OpenAction, /Launch, /JS), VBA y relaciones externas de Office, cabeceras .eml de phishing y muestras de laboratorio inertes |
| **Zip Bomb Lab** | `zipbomb` / `ZipBombLab.tsx` |  | La matemática de 42.zip sin armas reales: bombs anidadas capadas con deflate-raw, árbol de amplificación con BigInt, analizador de ZIP sospechosos sin descomprimir y catálogo de bombs históricas |
| **Steganalysis** | `steganalysis` / `Steganalysis.tsx` |  | Radiografía LSB de imágenes: visor de los 8 planos de bits por canal RGB, ataque chi-cuadrado de Westfeld-Pfitzmann con P-values reales y correlación de vecinos — detecta tinta invisible en píxeles |
| **Wayback Time Machine** | `wayback` / `WaybackMachine.tsx` | 🌐 | OSINT pasivo con la CDX API de archive.org: timeline del dominio, subdominios históricos candidatos a takeover, rutas interesantes indexadas y acceso a cada snapshot — sin tocar el target |
| **Forensics Playbook** | `forensicsdoc` / `ForensicsDoc.tsx` |  | Guía completa de análisis forense TESTADA sobre evidencias reales: árbol de decisión «tengo este fichero, ¿qué hago?», Volatility 3 (RAM), The Sleuth Kit (disco), file/binwalk/carving, EVTX Sysmon, Prefetch LZXPRESS-Huffman y registro con regipy — con los 3 retos Atenea resueltos paso a paso |

## Generadores (9)

| Herramienta | id / fichero | Etiquetas | Descripción |
|---|---|---|---|
| **QR Generator** | `qr` / `Qr.tsx` |  | Códigos QR con presets WiFi, vCard, email, SMS y geo; descarga PNG/SVG en local |
| **Lorem Ipsum Generator** | `lipsum` / `Lipsum.tsx` |  | Texto de relleno por párrafos, frases o palabras con modo hacker y salida MD/HTML/JSON<br>_Nota: Utilidad genérica, prioridad mínima._ |
| **Dork Arsenal** | `dorkgen` / `Dorkgen.tsx` |  | Dorks de Google, Bing, GitHub, Shodan y Censys con sustitución de objetivo y enlace directo al motor |
| **Wordlist Builder** | `wordlistgen` / `Wordlistgen.tsx` | ⚠️ | Wordlists dirigidas desde datos del objetivo con las mutaciones que la gente realmente usa: más efectiva que rockyou |
| **Pentest Report Builder** | `pentestreport` / `Pentestreport.tsx` |  | Estructura hallazgos con severidad, evidencia, impacto y remediación y exporta un informe Markdown profesional |
| **Chuleta Generator** | `cheatgen` / `Cheatgen.tsx` |  | Compón chuletas personalizadas de vim, tmux, find/grep, bash, red y git en TXT o Markdown listas para imprimir |
| **Shell Alias Pack** | `aliases` / `Aliases.tsx` |  | Pack de alias y funciones de calidad de vida y seguridad para bash/zsh con la explicación de qué hábito corrige cada uno |
| **Cron Translator** | `crontalk` / `Crontalk.tsx` |  | Explica expresiones cron en cristiano, señala patrones sospechosos y las convierte a systemd OnCalendar |
| **Chronolog** | `chronolog` / `Chronolog.tsx` |  | Timeline de tu engagement con fases, TTE (time-to-exploit), huecos sin documentar y export Markdown/CSV del writeup |

## Ingeniería Inversa (5)

| Herramienta | id / fichero | Etiquetas | Descripción |
|---|---|---|---|
| **Binary Inspector** | `bininspect` / `Bininspect.tsx` |  | Parsea PE/ELF: headers, secciones con entropía, imports/exports y detección de packers sin ejecutar nada |
| **Deobfuscator** | `deobfuscate` / `Deobfuscate.tsx` | ⭐ | Descodifica capas automáticamente (base64/hex/URL/escapes), crackea XOR y mide ofuscación JS |
| **NFC / RFID Lab** | `nfclab` / `NfcLab.tsx` |  | Laboratorio educativo de tarjetas de proximidad: familias de chips, UIDs y dumps simulados, Wiegand 26, modulaciones y ataques con su defensa |
| **Bytecode Inspector** | `bytecode` / `Bytecode.tsx` |  | Descompilador didáctico: parsea .class de Java real (constant pool, fields, methods) y cabecera de .pyc, con strings sospechosos |
| **Firmware Inspector** | `firmware` / `Firmware.tsx` |  | Parsea imágenes ESP8266/ESP32 (header, segmentos, app description) e Intel HEX de Arduino, y extrae strings sospechosos del binario |

## Lenguajes (17)

| Herramienta | id / fichero | Etiquetas | Descripción |
|---|---|---|---|
| **CheatSheet Python 3** | `langpython` / `LangPython.tsx` | 🌐 | Chuleta de Python con playground: ejecuta de verdad (WASM local), 6 secciones de sintaxis, data structures y seguridad<br>_Nota: Ejecuta código con runtimes externos (revisar src/lib/coderun.ts del original)._ |
| **CheatSheet JavaScript** | `langjavascript` / `LangJavascript.tsx` | 🌐 | Chuleta de JS con playground en tu navegador: DOM, fetch, clases, XSS conceptual y moderno ES2023+<br>_Nota: Ejecuta código con runtimes externos (revisar src/lib/coderun.ts del original)._ |
| **CheatSheet TypeScript** | `langtypescript` / `LangTypescript.tsx` | 🌐 | Chuleta de TS con ejecución real: tipos, narrowing, genéricos y utility types compilados de verdad<br>_Nota: Ejecuta código con runtimes externos (revisar src/lib/coderun.ts del original)._ |
| **CheatSheet Java** | `langjava` / `LangJava.tsx` | 🌐 | Chuleta de Java con OpenJDK real: colecciones, streams, excepciones y superficie de ataque (deserialización, JNDI)<br>_Nota: Ejecuta código con runtimes externos (revisar src/lib/coderun.ts del original)._ |
| **CheatSheet C#** | `langcsharp` / `LangCsharp.tsx` | 🌐 | Chuleta de C# con Mono real: LINQ, nullables y por qué el ecosistema .NET domina la post-explotación Windows<br>_Nota: Ejecuta código con runtimes externos (revisar src/lib/coderun.ts del original)._ |
| **CheatSheet C** | `langc` / `LangC.tsx` | 🌐 | Chuleta de C con gcc real: punteros, memoria y las funciones inseguras detrás de cada buffer overflow<br>_Nota: Ejecuta código con runtimes externos (revisar src/lib/coderun.ts del original)._ |
| **CheatSheet C++** | `langcpp` / `LangCpp.tsx` | 🌐 | Chuleta de C++ con g++ real: RAII, smart pointers, STL y templates<br>_Nota: Ejecuta código con runtimes externos (revisar src/lib/coderun.ts del original)._ |
| **CheatSheet PHP** | `langphp` / `LangPhp.tsx` | 🌐 | Chuleta de PHP 8 real: arrays, super globales, LFI/SQLi clásicos y prepared statements<br>_Nota: Ejecuta código con runtimes externos (revisar src/lib/coderun.ts del original)._ |
| **CheatSheet Ruby** | `langruby` / `LangRuby.tsx` | 🌐 | Chuleta de Ruby real: bloques, símbolos, structs y la anatomía de un módulo de Metasploit<br>_Nota: Ejecuta código con runtimes externos (revisar src/lib/coderun.ts del original)._ |
| **CheatSheet Go** | `langgo` / `LangGo.tsx` | 🌐 | Chuleta de Go real: structs, goroutines, channels y por qué las tools ofensivas modernas son Go<br>_Nota: Ejecuta código con runtimes externos (revisar src/lib/coderun.ts del original)._ |
| **CheatSheet Rust** | `langrust` / `LangRust.tsx` | 🌐 | Chuleta de Rust real: ownership, borrowing, match, Result y Option<br>_Nota: Ejecuta código con runtimes externos (revisar src/lib/coderun.ts del original)._ |
| **CheatSheet Lua** | `langlua` / `LangLua.tsx` | 🌐 | Chuleta de Lua real: tables, metatables y scripting NSE de Nmap<br>_Nota: Ejecuta código con runtimes externos (revisar src/lib/coderun.ts del original)._ |
| **CheatSheet Bash** | `langbash` / `LangBash.tsx` | 🌐 | Chuleta de Bash real: variables, pipes, conditions y one-liners de seguridad ejecutándose de verdad<br>_Nota: Ejecuta código con runtimes externos (revisar src/lib/coderun.ts del original)._ |
| **CheatSheet SQL** | `langsql` / `LangSql.tsx` | 🌐 | Chuleta de SQL sobre SQLite real: JOINs, agregación y la inyección SQL explicada ejecutándola<br>_Nota: Ejecuta código con runtimes externos (revisar src/lib/coderun.ts del original)._ |
| **CheatSheet HTML** | `langhtml` / `LangHtml.tsx` | 🌐 | Chuleta de HTML con vista previa en vivo: formularios, semántica y anatomía del phishing<br>_Nota: Ejecuta código con runtimes externos (revisar src/lib/coderun.ts del original)._ |
| **CheatSheet CSS** | `langcss` / `LangCss.tsx` | 🌐 | Chuleta de CSS con vista previa en vivo: flexbox, grid, animaciones y CSS exfiltration<br>_Nota: Ejecuta código con runtimes externos (revisar src/lib/coderun.ts del original)._ |
| **Language Translator** | `langtrans` / `LangTrans.tsx` |  | Traduce código entre Python, JS, TS, Java, C#, Go, Ruby y PHP con análisis del subconjunto común y % de confianza honesto<br>_Nota: Traductor de código: fuera del foco de estudio._ |

## Linux & sistema (19)

| Herramienta | id / fichero | Etiquetas | Descripción |
|---|---|---|---|
| **Calculadora CHMOD** | `chmod` / `Chmod.tsx` | ⭐ | Permisos Linux en octal/simbólico con SUID, SGID y Sticky Bit |
| **Linux/Windows Cheatsheets** | `cheatsheets` / `Cheatsheets.tsx` |  | Comandos de red, sistema y privesc con equivalencias Linux↔Windows<br>_Nota: Su lib (cheats.ts) contiene el mismo one-liner Perl que Defender marca._ |
| **Generador Umask** | `umaskgen` / `Umaskgen.tsx` |  | Calcula los permisos reales que produce cada umask con presets y veredicto de seguridad |
| **Generador Sudoers** | `sudoersgen` / `Sudoersgen.tsx` | ⭐ | Construye reglas de sudoers.d correctas y detecta GTFOBins, wildcards y NOPASSWD peligrosos |
| **Generador systemd** | `systemdgen` / `Systemdgen.tsx` |  | Units de service con hardening, timer con OnCalendar y mount listos para desplegar |
| **Permisos NTFS (icacls)** | `ntfsperm` / `Ntfsperm.tsx` |  | Generador de comandos icacls con ACEs, herencia y equivalencias chmod ↔ icacls |
| **Fstab Builder** | `fstabgen` / `Fstabgen.tsx` |  | Construye /etc/fstab con presets por escenario y avisos de privesc (suid noexec), contraseñas inline y flags rotos |
| **Sysctl Hardening** | `sysctlgen` / `Sysctlgen.tsx` |  | Catálogo explicado de claves del kernel con perfiles servidor/desktop/docker y conf listo para /etc/sysctl.d |
| **NFTables Builder** | `nftgen` / `Nftgen.tsx` |  | Rulesets nft con policy drop, established/related, rate limit SSH y reglas por servicio explicadas |
| **WireGuard Config** | `wgquick` / `Wgquick.tsx` |  | Túnel completo: servidor + peers con claves, AllowedIPs explicado, MTU, NAT y firewall para salida a internet |
| **Firewall Windows** | `winfirewall` / `Winfirewall.tsx` |  | Reglas netsh advfirewall con mínimo privilegio, presets seguros y detección de puertos de administración abiertos |
| **Windows Scheduled Tasks** | `schtasks` / `Schtasks.tsx` |  | Crea tareas programadas con schtasks y PowerShell y aprende a detectarlas como persistencia (MITRE T1053.005) |
| **Windows Hardening** | `winharden` / `Winharden.tsx` | ⭐ | Auditoría de endurecimiento con justificación, comando de aplicación, verificación y reversión al estilo CIS |
| **PowerShell Lab** | `pslab` / `Pslab.tsx` | ⭐ | Recetario de one-liners de administración, red, disco, registro y blue team con la trampa de cada uno explicada |
| **Windows Registry Tweaks** | `regtweaks` / `Regtweaks.tsx` |  | Tweaks de telemetría, privacidad y hardening con ruta exacta, valor, reversión y export a .reg listo para fusionar |
| **Disk & LVM Commander** | `diskcmds` / `Diskcmds.tsx` |  | Formador de comandos de discos paso a paso: LVM (volúmenes físicos y lógicos), RAID mdadm, LUKS, dd y swap con porqués y avisos de peligro |
| **Bash Script Forge** | `bashforge` / `BashForge.tsx` |  | Compón scripts Bash por bloques con modo estricto, argumentos, bucles, checks de red y logging coloreado — cada pieza explicada |
| **PowerShell Forge** | `psforge` / `PsForge.tsx` |  | Compón scripts PowerShell por bloques: strict mode, params, try/catch, transcripción y checks de red — cada pieza explicada |
| **Cron/AT Persistence Lab** | `cronapt` / `CronApt.tsx` | ⚠️ | Simulador de persistencia T1053 para tu lab: genera la tarea, su rollback y las detecciones que la cazan (Sigma, YARA, hunting) |

## Phishing (9)

| Herramienta | id / fichero | Etiquetas | Descripción |
|---|---|---|---|
| **Email Header Analyzer** | `mailheader` / `Mailheader.tsx` | ⭐ | Parsea cabeceras: cadena Received, SPF/DKIM/DMARC, Return-Path vs From y puntuación de spoofing |
| **URL Phishing Inspector** | `urlphish` / `Urlphish.tsx` | ⭐ | Desmonta URLs: punycode/homoglyphs, typosquatting, acortadores, credenciales incrustadas y risk score |
| **Awareness Campaign Builder** | `phishpage` / `Phishpage.tsx` | ⚠️ | Plantillas de email y landings de entrenamiento anti-phishing con QR (quishing) y disclaimers éticos |
| **Quishing Lab** | `quishing` / `Quishing.tsx` | ⚠️ | QR phishing educativo: plantillas de escenarios reales, estilos de QR legítimos y lecciones para entrenar el ojo del equipo |
| **Shortener Audit** | `shorteneraudit` / `Shorteneraudit.tsx` | 🌐 | Expande acortadores en vivo y descompone URLs con detección de credenciales, punycode, typosquatting y redirects abiertos |
| **Phishing MITM Anatomy** | `phishmtm` / `Phishmtm.tsx` | ⚠️ | Anatomía del phishing con proxy inverso (Evilginx-style): por qué roba sesiones con 2FA activo y qué capas lo rompen |
| **Homoglyph Scanner** | `homoglyph` / `HomoglyphScanner.tsx` | ⭐ | Dominios y textos impostores: punycode, confusables cirílicos/griegos, invisibles y bidi con esqueleto comparador, evil twins para testear filtros y catálogo de ataques IDN |
| **CardForge** | `cardforge` / `CardForge.tsx` | ⚠️ | Generador de tarjetas de crédito FICTICIAS con Luhn real (ISO/IEC 7812) y prefijos IIN de 7 redes: preview animada del plástico por red, lote, completar BIN y analizador de números — el formato de pago disseccionado<br>_Nota: Genera tarjetas de pago ficticias: no aporta al estudio, mejor no portar._ |
| **DNI Generator** | `dnigen` / `DniGen.tsx` | ⚠️ | DNI/NIE españoles FICTICIOS con el algoritmo real: letra módulo 23 (tabla TRWAGMYFPDXBNJZSQVHLCKE), NIE con el truco del 0/10/20 millones, MRZ ICAO 9303 del reverso y validador explicado — preview estilo DNI 3.0<br>_Nota: Genera DNI españoles ficticios: no aporta al estudio, mejor no portar._ |

## Red (24)

| Herramienta | id / fichero | Etiquetas | Descripción |
|---|---|---|---|
| **DNS Lookup (DoH)** | `dns` / `Dns.tsx` | 🌐 | Registros A/AAAA/MX/NS/TXT/CAA/SOA vía DNS-over-HTTPS con análisis SPF/DKIM/DMARC |
| **IP Info & GeoIP** | `ipinfo` / `Ipinfo.tsx` | 🌐 | Geolocalización, ASN, ISP y tipo de red de cualquier IP o dominio |
| **HTTP Inspector** | `httpinspector` / `Httpinspector.tsx` | 🌐 | Auditoría de cabeceras HTTP y cabeceras de seguridad de cualquier URL |
| **Ping & Traceroute web** | `pingtool` / `Pingtool.tsx` | 🌐 | Mide latencia HTTP desde el navegador con estadísticas y gráfica |
| **Calculadora VLSM** | `vlsm` / `Vlsm.tsx` | ⭐ | Segmenta una red en subredes por hosts con binarios y clase<br>_Nota: Absorbida en el núcleo: va dentro de "Subnetting & VLSM"._ |
| **IPv4 Generator** | `ipv4` / `Ipv4.tsx` |  | Genera direcciones IPv4 aleatorias criptográficas por tipo con análisis de subred completo |
| **IPv6 Toolkit** | `ipv6` / `Ipv6.tsx` | ⭐ | Expande/comprime, tipo de dirección, prefijos, EUI-64, generador de MACs y reverse DNS |
| **Curl Builder** | `curlbuilder` / `Curlbuilder.tsx` | ⭐ | Construye comandos curl con headers, auth, body y proxy |
| **WiFi Map** | `wifimap` / `Wifimap.tsx` | 🌐 ⚠️ | Mapa con la base de datos real de WiGLE (más de 1.000M de redes observadas por la comunidad): BSSID, canal, cifrado y última vez vista — con tus credenciales guardadas solo en tu navegador<br>_Nota: Requiere credenciales propias de WiGLE._ |
| **Pivoting Map** | `pivotmap` / `Pivotmap.tsx` |  | Mapa interactivo de pivoting: arrastra nodos, enlázalos por protocolo (ssh/chisel/ligolo/socat/plink/sshuttle), valida el grafo y genera los comandos exactos por tramo |
| **Network Admin Calc** | `netcalc` / `Netcalc.tsx` | ⭐ | 7 calculadoras de red: TTL→SO, MTU/MSS, wildcards ACL Cisco, plan de VLANs, ToS/DSCP, transferencias y CIDR |
| **Network Topology Designer** | `netsim` / `NetSim.tsx` |  | Diseña topologías arrastrando nodos, enlázalos por medio (ethernet/fibra/wifi/vpn), analiza huérfanos y BOM, y exporta PNG/JSON |
| **Cable Docs Animadas** | `cabledocs` / `CableDocs.tsx` |  | Pinout RJ45 T568A/B animado, categorías Cat5e–Cat8, tipos de cable con trampas, fibra y conectores LC/SC/ST/MPO explicados |
| **Internet Speed Test** | `speedtest` / `SpeedTest.tsx` | 🌐 | Test de latencia, jitter, descarga y subida con velocímetro animado contra speed.cloudflare.com — interpretación guiada<br>_Nota: Fuera de alcance: no es una herramienta de seguridad._ |
| **Wireshark Display Filters** | `wifilter` / `WiFilter.tsx` | ⭐ | Constructor visual de display filters: catálogo por protocolo, presets de caza (escaneos, exfil DNS, credenciales) y validación en vivo |
| **BLE GATT Explorer** | `blegatt` / `BleGatt.tsx` |  | Servicios y characteristics Bluetooth Low Energy con su riesgo real, conversor UUID 16↔128 y decodificador de advertising |
| **WiFi Attack Lab** | `wifilab` / `WifiLab.tsx` | ⚠️ | Los 7 pasos de una auditoría 802.11 en tu laboratorio: comandos con placeholders personalizables, qué esperar en cada salida, la trampa típica y cómo se detecta cada acción |
| **Decodificador 802.11** | `wifi80211` / `Wifi80211.tsx` |  | Pega un frame en hex y desglosa la cabecera MAC bit a bit: flags, direcciones según toDS/fromDS, seq/frag e Information Elements con el RSN completo (WPA2/WPA3/PMF) |
| **WiFi Channel Planner** | `wifiplanner` / `WifiPlanner.tsx` |  | Planifica canales 2.4/5/6 GHz con el solapamiento real del espectro: mapa de congestión con tus APs vecinos, mejores canales, grupos de 80 MHz con avisos DFS y PSC de 6 GHz |
| **WiFi Security Auditor** | `wifiaudit` / `WifiAudit.tsx` |  | Puntúa tu red sobre 100 (cifrado, PMF, passphrase, WPS, admin) con hardening priorizado por esfuerzo y matriz de amenazas: evil twin, karma, deauth, KRACK, Dragonblood |
| **Anonymity Lab** | `anonymity` / `Anonymity.tsx` | 🌐 ⚠️ | Diagnóstico en vivo de tu exposición (IP, fuga WebRTC real, DNS, huella, coherencia) y recetas exactas para cambiar IP/MAC de verdad: macchanger, Tor NEWNYM, WireGuard con kill switch por plataforma |
| **AudioModem** | `audiomodem` / `AudioModem.tsx` | ⚠️ | Exfiltración por el aire sin red: FSK audible con Web Audio API, receptor Goertzel en vivo por micrófono, corrección Hamming(8,4) y preámbulo sincronizador — el canal de los air-gaps |
| **Flipper Terminal** | `flipperterm` / `FlipperTerm.tsx` | ⚠️ | Terminal para Flipper Zero vía Web Serial API con simulador educativo completo: comandos subghz/ir/nrf/rfid/nfc, parser de capturas de radio y lecciones de fixed-code vs rolling code |
| **WiFilter Academy** | `wifilterdoc` / `WiFilterDoc.tsx` |  | Academia de Wireshark: 60+ display filters verificados con tshark 4.6.2 (cada uno con qué hace el disector por detrás y su trampa), conceptos desde nivel 0, trucos de tshark (export-objects, follow stream, estadísticas -z) y la ruta de aprendizaje hasta DFIR |

## Web & payloads (25)

| Herramienta | id / fichero | Etiquetas | Descripción |
|---|---|---|---|
| **Reverse Shells** | `revshells` / `Revshells.tsx` | ⚠️ | Generador de reverse shells multiplataforma con IP/puerto y listeners<br>_Nota: Defender detecta el one-liner Perl como Backdoor:Perl/TurtlePerlsh: requiere exclusión de carpeta._ |
| **PHP Security Scanner** | `phpdetector` / `Phpdetector.tsx` |  | Detecta funciones PHP peligrosas y analiza disable_functions |
| **SQL & CSV Generator** | `sqlgen` / `Sqlgen.tsx` |  | Genera CREATE/INSERT, CSV de datos fake y diagramas ER en Mermaid |
| **Payload Arsenal** | `payloads` / `Payloads.tsx` | ⚠️ | SQLi por motor, XSS evasión, SSRF, LFI y listas de fuzzing listas para copiar<br>_Nota: Defender detecta el one-liner Perl como Backdoor:Perl/TurtlePerlsh: requiere exclusión de carpeta._ |
| **Web Fuzzer** | `webfuzzer` / `Webfuzzer.tsx` | 🌐 ⚠️ | Fuzzing concurrente de rutas/parámetros con comparación de respuestas |
| **XSS Payload Generator** | `xsgen` / `Xsgen.tsx` | ⭐ | 26 payloads clasificados por vector y contexto (HTML, atributo, JS, URL) con encoding y guía de caza de inyecciones |
| **XML & XXE Arsenal** | `xmlgen` / `Xmlgen.tsx` |  | Plantillas XXE directo, OOB con evil.dtd, vía error, XInclude y XSLT hasta RCE con detección de parsers |
| **PHP Filter Chain** | `phpfilter` / `Phpfilter.tsx` | ⚠️ | LFI a RCE sin subir ficheros: cadenas php://filter con iconv que sintetizan tu código (algoritmo Synacktiv) |
| **Buffer Overflow Calc** | `bofcalc` / `Bofcalc.tsx` | ⚠️ | Patrón cíclico estilo Metasploit, offset desde EIP, badchars y payload con NOP sled + shellcode + retorno |
| **TTY Upgrade** | `ttyupgrade` / `Ttyupgrade.tsx` | ⚠️ | De reverse shell tonta a terminal interactiva: python pty, script, socat, rlwrap con pasos y troubleshooting |
| **File Transfer Arsenal** | `filexfer` / `Filexfer.tsx` | ⚠️ | 14 métodos de transferencia atacante↔víctima con comandos exactos: HTTP, nc, scp, certutil, PowerShell, SMB… |
| **DuckyScript Builder** | `duckyforge` / `DuckyForge.tsx` | ⚠️ | Compón payloads badUSB por bloques para Rubber Ducky y Flipper Zero con presets didácticos, compatibilidad por objetivo y avisos éticos |
| **GraphQL Lab** | `graphql` / `GraphQL.tsx` |  | Builder de operaciones con plantillas de ataque (introspección, IDOR, SQLi/NoSQLi, alias storm, DoS), traductor query ↔ JSON para POST y trucos de batching |
| **NoSQL Injection Forge** | `nosql` / `NoSql.tsx` | ⭐ | Operadores Mongo ($ne, $gt, $regex, $where) y array smuggling urlencoded en JSON y URL listos para lanzar, con el criterio de confirmación de cada uno |
| **Deserialization Arsenal** | `deser` / `Deserialization.tsx` |  | Deserialización insegura por lenguaje (PHP, pickle, Java, .NET ViewState, Node) con gadgets, magic bytes para detectar el formato y sondas OOB |
| **OAuth 2.0 / OIDC Lab** | `oauth` / `OAuth.tsx` | ⭐ | Generador de flujos con PKCE real (WebCrypto), desglose de parámetros, parser del callback con token exchange y 7 ataques: state, redirect_uri, mix-up, scopes |
| **WebSocket Attack Lab** | `websockets` / `WebSockets.tsx` |  | Decodificador de frames RFC 6455 bit a bit con demo de máscara, generador de cliente/CSWSH y matriz de ataques: hijacking, manipulación, DoS |
| **Clickjacking Forge** | `clickjack` / `Clickjacking.tsx` |  | PoC de clickjacking con preview en vivo: iframe invisible alineado por offsets y opacidad, 6 variantes del ataque y cómo auditar la defensa |
| **Cache Poisoning & Deception** | `cachepoison` / `CachePoison.tsx` |  | Envenena la caché (headers sin clave, fat GET, header hiding) y engáñala para que guarde datos autenticados: técnicas con curl, rutas y metodología |
| **Information Disclosure Hunter** | `disclosure` / `Disclosure.tsx` |  | 12 vectores de fuga (.git, .env, actuator, source maps, CORS, buckets) priorizados por impacto con script de reconocimiento automático |
| **Prototype Pollution Lab** | `pp` / `PrototypePollution.tsx` |  | Sondas por vector (query, JSON, constructor) y sinks que convierten la polución en XSS o RCE: NODE_OPTIONS, innerHTML, bypass de filtros |
| **HTTP Request Smuggler** | `smuggler` / `Smuggler.tsx` |  | Peticiones desincronizadas CL.TE/TE.CL/TE.TE byte a byte con quién interpreta qué, loop de detección y objetivos: probe, captura de cabeceras, rutas internas |
| **2FA / OTP Lab** | `twofa` / `TwoFA.tsx` | ⭐ | TOTP vivo con QR para tu laboratorio, recovery codes con entropía real, 8 debilidades del segundo factor con su prueba y brute force single-packet |
| **Business Logic Hunter** | `logic` / `BusinessLogic.tsx` |  | 8 patrones de lógica de negocio con su prueba (precios negativos, races, saltos de flujo, reembolsos) y checklist de hunting por dominio |
| **JWK Set Inspector** | `jwks` / `Jwks.tsx` | ⭐ | Analiza la postura de un JWKS: kty/alg/use, longitud RSA, curvas EC, claves privadas filtradas, RSA1_5 roto, rotación dormida y hunting por kid |
