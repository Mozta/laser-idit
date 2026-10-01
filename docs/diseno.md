# Estándar visual

Basado en la presentación de clase de corte láser, que Rafael fijó como estándar del curso.

## Colores

| Token | Hex | Uso |
|---|---|---|
| `--bg` | `#16161E` | Fondo principal |
| `--bg-2` | `#1D1D27` | Fondo alterno de secciones |
| `--card` | `#23232F` | Tarjetas |
| `--line` | `#33334A` | Bordes y divisores |
| `--text` | `#ECEAE4` | Texto principal (blanco tostado, no `#fff`) |
| `--muted` | `#A9A6B8` | Texto secundario |
| `--teal` | `#3CC8B4` | Acento principal: fabricación, correcto, acciones |
| `--amber` | `#F5B841` | Advertencias, el haz del láser, valores a vigilar |
| `--rose` | `#F0627E` | Errores, prohibido |
| `--orange` | `#F28C38` | Onshape / segunda herramienta |
| `--wood` | `#8A6A48` | MDF en ilustraciones |
| `--wood-light` | `#A9855E` | Piezas cortadas en ilustraciones |

Tema oscuro por defecto. No se requiere tema claro en la etapa 1.

## Tipografía

- Texto: **Carlito** (Google Fonts, métrica de Calibri), respaldo `Arial, sans-serif`.
- Código y fórmulas: `'Courier New', monospace`.
- Escala (escritorio): 72 / 44 / 32 / 20 / 16 px. Bajar proporcionalmente en móvil con `clamp()`.
- Énfasis con peso o color, no con tamaños nuevos.

## Componentes

- **Tarjeta:** fondo `--card`, borde 1 px `--line`, radio 20 px, borde izquierdo de 8 px con el color del acento.
- **Bloque de fórmula:** fondo `#101016`, fuente monoespaciada, nombres de variable en `--teal`.
- **Sección de acento:** fondo `--teal` con texto `--bg`, para preguntas o ideas clave. Una o dos en todo el sitio.
- **Checklist:** filas con ícono de palomita en `--teal`.
- **Ilustraciones:** SVG propios con la paleta. Las fotos reales llevan pie con crédito.

## Portada

Animación de la cortadora vista desde arriba, ya hecha en canvas: `docs/referencia/portada-animacion.html`. Corta tres piezas, primero los huecos y al final el contorno. Convertirla en componente React con `useEffect` y `requestAnimationFrame`, respetando `prefers-reduced-motion` (mostrar el estado final estático).

## Principios

- Material atemporal: sin número de sesión ni fechas de semestre.
- Contenido que llene el espacio: sin huecos vacíos ni marcadores de imagen sin imagen.
- Tono cercano en títulos.
- Móvil primero: los alumnos abren el sitio frente a la máquina.
