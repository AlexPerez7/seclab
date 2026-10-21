# SecLab — plan del proyecto

> Laboratorio personal de ciberseguridad para **estudiar y practicar**, 100 % en el navegador.
> Se inspira en [HackNexus](https://github.com/D1se0/hacknexus) (MIT), pero con menos alcance, tests y validación contra fuentes primarias.

_Creado el 2026-10-21._

---

## 1. Objetivo

Cada herramienta tiene que servir para **entender** algo, no solo para usarlo. El criterio para añadir una es:
"¿aprendo algo implementándola, y la voy a usar al estudiar o en el trabajo?".

**Qué no es:** una navaja suiza ofensiva. No se portan kits de phishing, generadores de documentos falsos ni arsenales de shells listos para usar (ver §7).

## 2. Diferencias con HackNexus

| | HackNexus | SecLab |
|---|---|---|
| Alcance | 172 herramientas | 13 en el núcleo y crecimiento gradual desde el backlog |
| Tests | ninguno | cada `logic.ts` tiene vectores de referencia de RFC, NIST o FIRST |
| Organización | por tipo técnico | por ruta de estudio: Fundamentos → Redes → Web → Defensa |
| Contenido | generado rápido (3 semanas) | validado contra fuentes primarias antes de darlo por bueno |
| Apuntes | integrados en la UI | `NOTES.md` por herramienta: objetivos, preguntas de repaso y práctica |

## 3. Stack

- **React 18 + Vite 5 + TypeScript strict**: igual que HackNexus, para que portar sea directo.
- **Tailwind 3** para estilos.
- **react-router-dom 6** con `HashRouter`: despliegue en GitHub Pages sin configurar el servidor.
- **Vitest** solo para la lógica pura (`logic.ts`), no para la UI.
- **lucide-react** para iconos y **clsx** para clases condicionales.
- Sin backend. Las herramientas que necesiten red (DNS, CVE…) se marcarán explícitamente en la UI.

## 4. Estructura

```
seclab/
├── PLAN.md                  ← este archivo
├── README.md
├── THIRD_PARTY_NOTICES.md   ← licencia MIT de HackNexus (obligatoria al portar código)
├── docs/
│   └── BACKLOG.md           ← las 159 herramientas que no entran en el núcleo, con etiquetas
├── src/
│   ├── App.tsx              ← rutas; carga cada herramienta con import.meta.glob
│   ├── lib/
│   │   ├── registry.ts      ← catálogo del núcleo: id, ruta de estudio, estado, fuentes
│   │   ├── docs.ts          ← carga y divide los docs.md de cada herramienta
│   │   └── todo.ts          ← notImplemented() para los stubs
│   ├── data/backlog.ts      ← el backlog como datos (página /backlog de la app)
│   ├── components/          ← Layout, ui (Card, Field, CopyButton…), ToolStub, ToolGuide, Markdown
│   ├── pages/               ← Home, Docs, Backlog
│   └── tools/<id>/
│       ├── index.tsx        ← UI (default export)
│       ├── logic.ts         ← funciones puras, sin React
│       ├── logic.test.ts    ← vectores de referencia
│       ├── docs.md          ← documentación propia (se ve en la app)
│       └── NOTES.md         ← apuntes de estudio personales (no se ven en la app)
```

### Documentación de cada herramienta (`docs.md`)

Cada herramienta lleva su documentación propia, escrita en Markdown, con esta estructura:

```markdown
# Nombre de la herramienta

Párrafo de introducción: qué hace en una o dos frases.

## Cómo se usa
Pasos numerados para usar la herramienta.

## Casos de uso
Situaciones reales en las que sirve.

## …resto de secciones…
La teoría de fondo: cómo funciona, ataques, defensas, comandos equivalentes, errores comunes, glosario.
```

- **Cómo se usa** y **Casos de uso** se muestran en la propia página de la herramienta, debajo de ella.
- Debajo aparece el enlace **leer completa** a `/docs/<id>`, con el índice de las demás secciones enlazado.
- `/docs` lista la documentación de todas las herramientas.
- No se enlaza a documentación externa desde aquí. Las fuentes primarias van aparte, en `refs` del registry.

**`docs.md` frente a `NOTES.md`:** `docs.md` es la documentación de la herramienta, escrita para quien la usa. `NOTES.md` son tus apuntes de estudio: objetivos, preguntas de repaso y ejercicios.

**Convención:** el `id` del registry es el nombre de la carpeta. Para añadir una herramienta basta con crear la carpeta y su entrada en el registry; App.tsx la encuentra sola.

`src/tools/encoders/` es la **herramienta de referencia**: está completa y es el modelo a copiar.

## 5. Núcleo inicial (13 herramientas)

| Ruta | Herramienta | id | Origen en HackNexus | Estado |
|---|---|---|---|---|
| Fundamentos | Hash Suite | `hash` | `Hash.tsx` | ✅ listo |
| Fundamentos | HashID | `hashid` | `Hashid.tsx` | pendiente |
| Fundamentos | Encoders | `encoders` | `Encoders.tsx` | ✅ listo |
| Fundamentos | JWT Toolkit | `jwt` | `Jwt.tsx` | pendiente |
| Redes | Subnetting & VLSM | `subnetting` | `Subnetting.tsx` + `Vlsm.tsx` | pendiente |
| Redes | Puertos & Servicios | `ports` | `Ports.tsx` | pendiente (datos semilla listos) |
| Redes | PCAP Analyzer | `pcap` | `Pcap.tsx` | pendiente |
| Web | Path Traversal | `pathtraversal` | `PathTraversal.tsx` | pendiente |
| Web | Command Injection | `cmdinject` | `CommandInjection.tsx` | pendiente |
| Web | HTTP Request Builder | `httpheader` | `Httpheader.tsx` | pendiente |
| Defensa | Calculadora CVSS 3.1 | `cvss` | `Cvss.tsx` | pendiente |
| Defensa | MITRE ATT&CK | `mitre` | `Mitre.tsx` | pendiente (tácticas y semilla listas) |
| Defensa | SSH Hardening | `sshharden` | `Sshharden.tsx` | pendiente |

## 6. Fases

### Fase 0 — Esqueleto ✅ (2026-10-21)
- [x] Proyecto Vite + React + TS + Tailwind + Vitest
- [x] Layout con navegación por ruta de estudio, Home y página de Backlog
- [x] Registry con las 13 herramientas, sus fuentes primarias y estado
- [x] `encoders` completa como referencia (UI, lógica y tests en verde)
- [x] Las otras 12: firmas en `logic.ts`, tests con vectores reales en `.skip`, UI provisional y `NOTES.md`
- [x] Backlog completo de las 159 herramientas restantes (`docs/BACKLOG.md` y `/backlog`)

### Fase 1 — Fundamentos
- [x] `hash` (2026-10-21): MD5 a mano según RFC 1321, SHA-* y HMAC con WebCrypto, pestañas de texto, archivo, HMAC y avalancha. 17 tests.
- [ ] `hashid`
- [ ] `jwt`

`hash` → `hashid` → `jwt`. Este orden reutiliza lo anterior: JWT usa Base64url (encoders) y HMAC (hash).

### Fase 2 — Redes
`subnetting` → `ports` → `pcap`. PCAP es la más larga: dejar pcapng para el final.

### Fase 3 — Web
`httpheader` → `pathtraversal` → `cmdinject`. Combinarlas con los laboratorios de PortSwigger de cada tema.

### Fase 4 — Defensa
`cvss` → `mitre` → `sshharden`. Para MITRE: un script que genere un JSON reducido desde `attack-stix-data`.

### Fase 5 — Crecer desde el backlog
Elegir de las 35 marcadas como ⭐ candidata en `docs/BACKLOG.md`. Primeras sugerencias, por continuidad con el núcleo:
- **Fundamentos:** `aes`, `totp`, `classics`, `x509`
- **Redes:** `ipv6`, `netcalc`, `wifilter`
- **Web:** `xsgen`, `nosql`, `oauth`, `jwks`
- **Defensa:** `winlog`, `sysmonbuilder`, `iocextract`, `gtfobins`, `winharden`, `logparser`

### Fase 6 — Ruta PAM (ideas propias, no están en HackNexus)
Herramientas ligadas al trabajo con CyberArk:
- **Simulador de política de rotación:** dada una política de contraseñas de la plataforma, generar ejemplos válidos y explicar los rechazos.
- **Mapa de puertos de CyberArk:** qué componente habla con cuál (Vault 1858, PVWA, CPM, PSM, PSM for SSH) y qué abrir en el firewall.
- **Kerberos/NTLM visual:** el flujo AS/TGS paso a paso y dónde encajan Kerberoasting, pass-the-hash y pass-the-ticket. Por qué un PAM los mitiga.
- **Checklist de hardening de servidores Windows con el componente PSM:** a modo de estudio, contrastado con la documentación oficial.

## 7. Reglas

1. **Fuente primaria antes que código portado.** El código de HackNexus es una guía, no la verdad. Cada resultado se valida contra la RFC, la especificación o la calculadora oficial.
2. **Lógica pura y testeada.** Nada de lógica en los componentes: todo en `logic.ts`, con tests.
3. **Nada sale del navegador** salvo en herramientas marcadas 🌐, que avisan en la UI.
4. **Herramientas ofensivas solo contra laboratorios propios o autorizados.** Las marcadas ⚠️ en el backlog no se portan sin decidirlo de forma explícita.
5. **Antivirus:** los payloads de shells (p. ej. el one-liner de Perl) los detecta Defender como `Backdoor:Perl/TurtlePerlsh`. Si alguna vez se porta algo así, tener excluida la carpeta y saberlo de antemano.
6. **Licencia:** al portar código de HackNexus, mantener `THIRD_PARTY_NOTICES.md`.

## 8. Definition of done (por herramienta)

- [ ] `logic.ts` implementado, sin `notImplemented`
- [ ] Todos los tests sin `.skip` y en verde (`npm test`)
- [ ] Al menos un vector comprobado contra la fuente primaria enlazada en el registry
- [ ] UI real en `index.tsx` (fuera `ToolStub`), usable en móvil
- [ ] Casos de error visibles en la UI (entrada inválida → mensaje, no pantalla rota)
- [ ] `docs.md` con "Cómo se usa", "Casos de uso" y la documentación de fondo (lo exige un test de `src/lib/registry.test.ts`)
- [ ] `NOTES.md` con las preguntas de repaso respondidas con tus palabras
- [ ] `status: 'listo'` en `src/lib/registry.ts`
- [ ] `npm run build` sin errores

## 9. Comandos

```bash
npm install
npm run dev          # http://localhost:5173
npm test             # tests de lógica (vitest)
npm run test:watch
npm run typecheck
npm run build        # dist/ listo para GitHub Pages
```
