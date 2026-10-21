# >_ SecLab

Laboratorio personal de ciberseguridad para estudiar y practicar. Todo corre en el navegador.

- **Núcleo:** 13 herramientas en cuatro rutas de estudio (Fundamentos, Redes, Web y Defensa).
- **Backlog:** 159 herramientas candidatas, anotadas en [`docs/BACKLOG.md`](docs/BACKLOG.md).
- **Plan, fases y reglas:** [`PLAN.md`](PLAN.md).

## Uso

```bash
npm install
npm run dev     # http://localhost:5173
npm test
```

## Añadir una herramienta

1. Crear `src/tools/<id>/` copiando la estructura de `src/tools/encoders/`.
2. Añadir la entrada en `src/lib/registry.ts` con su ruta de estudio y sus fuentes primarias.
3. Escribir su `docs.md` con "Cómo se usa", "Casos de uso" y la documentación de fondo (formato en `PLAN.md`).
4. Cumplir la "Definition of done" de `PLAN.md`.

## Créditos

Inspirado en [HackNexus](https://github.com/D1se0/hacknexus) (MIT). Ver [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).
