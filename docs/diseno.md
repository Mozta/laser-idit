# Estándar visual

Inspirado en el lenguaje visual de [motion.dev](https://motion.dev/): fondo casi negro verdoso, un solo acento amarillo intenso, rejillas de celdas con líneas finas, esquinas rectas y etiquetas monoespaciadas en mayúsculas. Se toma el estilo, no la marca: el logo, los textos y las ilustraciones son del sitio.

> Es el estándar del sitio desde el pull request #1. La versión anterior (paleta de la presentación de clase, Carlito, tarjetas redondeadas) queda en el historial de git, antes de ese pull request.

## Colores

| Token | Hex | Uso |
|---|---|---|
| `--bg` | `#0D1111` | Fondo principal |
| `--bg-2` | `#111616` | Fondo alterno de secciones |
| `--card` | `#131A19` | Celdas, tarjetas, herramientas |
| `--code-bg` | `#0A0D0D` | Campos, fórmulas, diagramas |
| `--line` | `#1E2427` | Líneas de rejilla y bordes |
| `--line-2` | `#2C322D` | Bordes de campos y botones |
| `--text` | `#EDEDEC` | Texto principal |
| `--muted` | `#979D97` | Texto secundario (7:1 sobre el fondo) |
| `--accent` | `#FFDB2A` | Acento: portada, barra superior, botones, números, selección |
| `--ink` | `#0D1111` | Texto sobre el acento |
| `--teal` | `#52CD86` | Correcto, listo, ajuste justo |
| `--amber` | `#FFA23A` | Aviso, valor a vigilar |
| `--rose` | `#FF5F57` | Error, prohibido |
| `--blue` | `#3E98FF` | Información, segunda herramienta |
| `--wood` / `--wood-light` | `#8A6A48` / `#A9855E` | MDF en ilustraciones |

Los nombres `--teal`, `--amber` y `--rose` se conservan por compatibilidad: hoy significan correcto, aviso y error. El amarillo es solo para la interfaz, nunca para un estado.

## Tipografía

- Texto y títulos: **TASA Orbiter** (Google Fonts), respaldo `Arial, sans-serif`. Títulos en peso 700 con interletrado cerrado (−0.04 em).
- Etiquetas, botones, números, fórmulas y código: **Geist Mono** (Google Fonts). Etiquetas y botones en mayúsculas con interletrado abierto (0.1 em). Las etiquetas de campos van en minúsculas para no cambiar las variables (`n`, `t`, `k`).
- Escala: 80 / 44 / 28 / 20 / 16 px, bajando en móvil con `clamp()`.

## Componentes

- **Encabezado de sección:** a la izquierda `01 —— ETIQUETA` en monoespaciada (número en amarillo); a la derecha el título y la idea central. En móvil se apilan.
- **Rejilla de celdas:** celdas pegadas, separadas por líneas de 1 px (`.rejilla`). Cada celda dibuja su borde derecho e inferior para que los huecos al final queden limpios.
- **Tarjeta:** fondo `--card`, borde de 1 px, línea de color de 2 px arriba según el acento.
- **Celda amarilla:** fondo `--accent` con texto `--ink`, para ideas clave. Una o dos en todo el sitio.
- **Herramienta:** contenedor con línea amarilla de 2 px arriba y la etiqueta `■ INTERACTIVO`, cuyo cuadrito parpadea como el indicador de un láser encendido (fijo con `prefers-reduced-motion`). Encabezado separado por una línea, resultados en celdas con número monoespaciado.
- **Diagramas:** fondo `--code-bg` con cuadrícula de 24 px.
- **Botones:** rectos, monoespaciados en mayúsculas. Primario amarillo; sobre amarillo, negro con texto amarillo o contorno negro.
- **Barra superior:** amarilla. Al bajar se despega y flota dentro del ancho del contenido.

## Portada

Banda amarilla a todo lo ancho con el título, botones y la animación de la cortadora en una celda oscura. Abajo, una franja de datos en monoespaciada y una fila de atajos a las secciones. La animación respeta `prefers-reduced-motion` (estado final estático).

## Principios

- Material atemporal: sin número de sesión ni fechas de semestre.
- Contenido que llene el espacio: sin huecos vacíos ni marcadores de imagen sin imagen.
- Móvil primero: los alumnos abren el sitio frente a la máquina.
- El texto ocupa el ancho de su columna: sin límite de caracteres por línea en los párrafos. El ancho lo marcan el contenedor (máx. 1180 px) y las rejillas.
- Contraste AA o mejor en todo texto; Lighthouse de accesibilidad 95 o más.
