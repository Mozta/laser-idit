# Validador de DXF

Revisa en el navegador el archivo que el alumno va a cortar. Se presenta como un revisor que avisa: el alumno siempre confirma en SmartCarve con Go Scale.

Lógica en `src/lib/dxf/`, una función por revisión, cada una con pruebas. Interfaz en `src/tools/ValidadorDxf/`.

## Flujo

1. El alumno arrastra un `.dxf` o lo elige (máx. 10 MB).
2. Opcional: escribe su espesor real y su kerf (para la revisión de ranuras) y elige el material (por defecto 600 × 600).
3. Ve la vista previa del dibujo en SVG y la lista de hallazgos agrupados en **Error**, **Aviso** e **Info**. Al tocar un hallazgo se resalta en la vista previa.
4. Un resumen arriba: "Listo para cortar", "Revisa los avisos" o "Corrige los errores antes de cortar".

Nada se sube a ningún servidor; decirlo en la interfaz.

## Normalización

Convertir todas las entidades a una lista de trayectos (polilíneas de puntos) en mm:
- `LINE`, `ARC`, `CIRCLE`, `LWPOLYLINE` y `POLYLINE` (con bulges convertidos a arcos), `ELLIPSE`, `SPLINE` (aproximada, tolerancia de cuerda 0.01 mm).
- `INSERT` (bloques): expandir con su transformación. Si no se puede, aviso.
- Guardar para cada trayecto: entidad de origen, capa, color, si es cerrado.

## Revisiones

Tolerancia de unión por defecto: 0.01 mm (configurable hasta 0.05).

| # | Revisión | Nivel | Mensaje (resumido) |
|---|---|---|---|
| 1 | DXF binario o ilegible | Error | "No pude leer el archivo. Exporta como DXF ASCII." |
| 2 | Unidades: `$INSUNITS` = 4 | Info | "Unidades: milímetros." |
| 2a | `$INSUNITS` = 1 (pulgadas) | Error | "Está en pulgadas. Exporta en mm o escala × 25.4." |
| 2b | `$INSUNITS` ausente o 0 | Aviso | Deducir por tamaño. Si la caja mide menos de 20 en ambos ejes, sugerir que puede estar en pulgadas o cm. |
| 3 | Tamaño vs. material elegido | Error si no cabe | "Tu dibujo mide A × B y tu material C × D." |
| 3a | Tamaño vs. camas de las tres máquinas | Info | Indicar en cuáles cabe. |
| 4 | Contornos abiertos | Error | "Hay N contornos abiertos: esa pieza no se va a separar." Marcar los extremos sueltos. |
| 5 | Entidades duplicadas (misma geometría dentro de la tolerancia, incluso invertida) | Error | "N líneas repetidas: se cortan dos veces y queman el borde." |
| 5a | Segmentos colineales que se enciman parcialmente | Aviso | Mismo mensaje, indicando que es parcial. |
| 6 | `DIMENSION`, `TEXT`, `MTEXT`, `LEADER` | Error | "Tu archivo trae cotas o texto: la máquina intentará cortarlos." Si el texto es para grabar, pedir convertirlo a curvas. |
| 6a | `HATCH`, `POINT`, imágenes | Aviso | "Elementos que la máquina no usa; bórralos." |
| 7 | `SPLINE` presentes | Aviso | "Curvas spline: SmartCarve las aproxima. Revisa la vista previa allá." |
| 8 | Más de 50 segmentos menores a 0.05 mm | Aviso | "Muchos segmentos diminutos: el corte puede salir con tirones." |
| 9 | Contornos dentro de otros | Info | "N piezas, M huecos." Contención por punto en polígono. |
| 10 | Distancia mínima entre piezas (contornos exteriores distintos) | Aviso < 3 mm, Error < 0.5 mm | "Dos piezas a X mm: déjales al menos 3." |
| 11 | Ranuras (si el alumno dio espesor y kerf) | Info | Detectar huecos o muescas rectangulares con un lado entre `t − 1` y `t + 1`. Reportar el ancho medido contra `t − k`. Heurística: decirlo así. |
| 12 | Capas y colores | Info | Listar. Aviso si existen capas llamadas como cotas o anotaciones (`DIM`, `COTAS`, `ANNOTATION`, `DEFPOINTS`) con entidades. |
| 13 | Longitud total y tiempo estimado | Info | Longitud de corte / 25 mm/s (velocidad editable). Aclarar que no incluye desplazamientos. |

## Límites conocidos (decirlos en la interfaz)

- No detecta cruces de líneas dentro de un mismo contorno (autointersecciones) en la primera versión; agregar si los fixtures lo muestran como problema real.
- La detección de ranuras es heurística.
- No sustituye la revisión en SmartCarve.

## Conjunto de prueba

**Sintéticos** en `fixtures/dxf/` (generarlos con un script en `scripts/` y versionarlos), con lo esperado en `fixtures/esperado.json`:

| Archivo | Esperado |
|---|---|
| `perfecto.dxf` | 0 errores, 0 avisos; 1 pieza, 2 huecos |
| `abierto.dxf` | Error 4 (1 contorno abierto) |
| `duplicado.dxf` | Error 5 |
| `con-cotas.dxf` | Error 6 |
| `pulgadas.dxf` | Error 2a |
| `sin-unidades.dxf` | Aviso 2b |
| `spline.dxf` | Aviso 7 |
| `piezas-juntas.dxf` | Aviso o error 10 |
| `grande.dxf` (700 × 300) | Error 3 con material 600 × 600; info 3a: cabe en CMA1200, 1080K y 1309T |
| la tira de prueba del generador | 0 errores |

**Reales** de los alumnos: los DXF de la carpeta `cad/` de sus repositorios públicos en GitHub. Rafael pasa la lista de repositorios; descargar con `raw.githubusercontent.com`.
- Guardarlos en `fixtures/alumnos/` con nombres anónimos (`alumno-01.dxf`, …) y **agregar esa carpeta a `.gitignore`**: el repo del sitio es público.
- Probar que ninguno rompe el validador (sin excepciones) y revisar a mano con Rafael si los hallazgos tienen sentido. Ajustar tolerancias con base en eso.
- Registrar qué herramienta generó cada uno (Fusion, Onshape, SolidWorks, AutoCAD…) leyendo el encabezado; sirve para detectar diferencias por programa.

## Implementación (etapa 2)

- **Lectura:** `dxf-parser` 1.1.2 (MIT). Cubre `LWPOLYLINE` y `POLYLINE` con bulges, `ELLIPSE`, `SPLINE` (puntos de control con nudos y pesos, o solo puntos de ajuste), bloques con escala, rotación y arreglos, capas con color y extrusión invertida. No reporta los tipos que no conoce (`HATCH`, `IMAGE`…), así que `src/lib/dxf/leer.js` cuenta los tipos de la sección `ENTITIES` con un escaneo propio. Los binarios se reconocen por su encabezado.
- **Unidades:** las medidas se convierten a mm según `$INSUNITS` (pulgadas, pies, cm, m) antes de revisar. Sin unidades se toma como mm, igual que SmartCarve.
- **Contornos:** los trayectos abiertos se unen por sus extremos. Un extremo que cae sobre otra línea cuenta como unión en T (así la tira de prueba, con aristas compartidas, no marca contornos abiertos). Una red de líneas compartidas cuenta sus piezas por caras (fórmula de Euler) y usa su envolvente convexa como silueta.
- **Duplicados:** los trayectos repetidos se reportan en la revisión 5 y no cuentan como piezas aparte (evita un "dos piezas a 0 mm" falso). Dos piezas que comparten un lado completo sí reportan error 5 y error 10.
- **Revisiones extra:** `1a` (sin dibujo), `1b` (bloques que no se pudieron expandir) y `12a` (capas de anotación con elementos, aviso).
- **Interfaz:** `src/tools/ValidadorDxf/`, dentro de la sección 4. Corre en un Web Worker; si no hay Worker, carga el validador aparte en el hilo principal. Ejemplos descargables en `public/dxf/ejemplos/`.
- **Fixtures:** `node scripts/generar-fixtures.js` regenera `fixtures/dxf/` (17 archivos, incluidos `bloques`, `bulge`, `lado-compartido`, `encimado-parcial`, `muescas` y `binario` además de los de la tabla) y los ejemplos públicos. Lo esperado vive en `fixtures/esperado.json` y lo comprueba `src/lib/dxf/fixtures.test.js`.

**Pendiente:** fixtures reales de alumnos. Falta la lista de repositorios.
