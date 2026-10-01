# Corte láser en el IDIT

Sitio para aprender y aplicar el corte láser en el IDIT (IBERO Puebla): las máquinas, cómo corta, kerf, preparación de archivos, operación paso a paso, seguridad, materiales y galería. Incluye herramientas interactivas (calculadoras de kerf y ranura, simulador de ensamble, generador de la tira de prueba en DXF, acomodo en la lámina, orden de corte y quiz de seguridad).

Es la nueva versión de la documentación de Fab Academy 2019, semana 4, de Rafael Pérez Aguirre.

## Requisitos

Node 20 o más reciente.

## Comandos

```bash
npm install
npm run dev       # servidor de desarrollo
npm test          # pruebas de src/lib con Vitest
npm run build     # build de producción en dist/
npm run preview   # sirve dist/ localmente
```

## Despliegue

- **Vercel:** se despliega desde la rama `main`. Vercel detecta Vite solo; no necesita configuración.
- **GitHub Pages:** construir con la ruta del repositorio como base:

  ```bash
  BASE_PATH=/laser-idit/ npm run build
  ```

## Estructura

```
public/img/{2019,daniel,grupo}/   imágenes en webp (máx. 1600 px de ancho)
public/dxf/                       tiras de prueba de kerf descargables
src/data/                         datos editables (ver abajo)
src/sections/                     una sección de contenido por archivo
src/tools/                        componentes interactivos
src/lib/                          lógica pura con pruebas (*.test.js)
scripts/                          utilidades de generación
docs/                             especificaciones del sitio
```

## Dónde se editan los datos

Los valores que cambian con el tiempo viven en `src/data/`, nunca dentro de los componentes:

| Archivo | Contenido |
|---|---|
| `maquinas.json` | Modelos, área de trabajo y foto de cada cortadora |
| `parametros.json` | Potencia y velocidad reportadas, punto de partida y foco |
| `kerf.json` | Valores de kerf reportados |
| `ajuste.json` | Umbrales del simulador de ensamble (floja, justa, a presión, no entra) |
| `quiz.json` | Preguntas del quiz de seguridad |
| `pasos.json` | Fases y pasos de operación de la máquina |
| `materiales.json` | Materiales que se cortan, se graban y están prohibidos; tipos de junta |
| `galeria.json` | Trabajos de la galería |
| `creditos.json` | Autoría, licencia, `alt` y pie de cada imagen |

## Archivos DXF de ejemplo

Las tiras de prueba de `public/dxf/` se generan con la misma lógica que la herramienta del sitio:

```bash
node scripts/generar-dxf.js
```

## Créditos

Las imágenes son de Rafael Pérez Aguirre (Fab Academy 2019), Daniel Peña Cruz (Fab Academy 2026, CC BY-NC) e Itzel Eunice Moreno Rodríguez y equipo (Fab Academy 2026, CC BY-NC). El detalle de cada imagen está en [CREDITS.md](CREDITS.md).
