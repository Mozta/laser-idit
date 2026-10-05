# Herramientas interactivas

Lógica pura en `src/lib/` con pruebas en Vitest; componentes en `src/tools/`. Todas las medidas en mm. Mostrar resultados con 2 decimales salvo que se indique otra cosa (kerf con 3, kerf por lado con 4). Redondear con una función propia que evite errores de punto flotante, no con `toFixed` directo. Cada caso de prueba listado aquí debe existir como prueba automatizada.

> **Pendiente de decidir:** la regla pide kerf con 3 decimales, pero el caso del modo marco espera 0.1591 (4 decimales). Hoy la interfaz muestra 0.159 y la prueba comprueba 0.1591 redondeando a 4. Si se decide mostrar 4 decimales, cambiar `formatear(r.kerf, 3)` en `src/tools/CalculadoraKerf.jsx`.

---

## 1. Calculadora de kerf

Dos modos (ver `contenido.md`, correcciones, punto 1). Un selector arriba explica con un diagrama qué se mide en cada modo.

**Modo "piezas juntas"**
- Entradas: largo dibujado `L` (por defecto 100), número de piezas `n` (por defecto 10), largo medido `M`.
- `kerf = (L − M) / n`, `porLado = kerf / 2`.

**Modo "hueco en el marco"**
- Entradas: número de piezas `n` (por defecto 10), hueco medido `g`.
- `kerf = g / (n + 1)`, `porLado = kerf / 2`.

**Validaciones**
- `M ≥ L` → error: "Tu medida no puede ser igual o mayor que el largo dibujado. Revisa el vernier."
- `kerf > 0.6` → aviso: "Es un kerf muy grande para MDF de 3 mm. Revisa foco, velocidad o la medición."
- Entradas vacías o no numéricas → no calcular.

**Casos de prueba**
| Modo | Entradas | kerf | por lado |
|---|---|---|---|
| piezas | L=100, n=10, M=98.25 | 0.175 | 0.0875 |
| piezas | L=100, n=10, M=98.40 | 0.16 | 0.08 |
| marco | n=10, g=1.75 | 0.1591 | 0.0795 |
| piezas | L=100, n=10, M=100 | error | — |

## 2. Calculadora de ranura

- Entradas: espesor real medido `t`, kerf `k`.
- `ranura = t − k`.
- Salida adicional: cuánto cambian las piezas. Exterior dibujado `D` sale `D − k`; hueco dibujado `d` sale `d + k`.

**Casos de prueba**
| t | k | ranura | exterior 80 → | hueco 12 → |
|---|---|---|---|---|
| 2.85 | 0.2 | 2.65 | 79.8 | 12.2 |
| 3.00 | 0.17 | 2.83 | 79.83 | 12.17 |

## 3. Simulador de ensamble

Barra deslizante para el ancho dibujado de la ranura `w`, con `t` y `k` editables. Ilustración en vivo de la pestaña entrando en la ranura.

- Ancho real de la ranura: `w + k`.
- Holgura: `h = (w + k) − t`.
- Estado:
  - `h > 0.10` → **Floja** (rosa)
  - `0 ≤ h ≤ 0.10` → **Justa, desliza** (teal)
  - `−0.15 ≤ h < 0` → **Entra a presión** (teal)
  - `h < −0.15` → **No entra** (rosa)

Los umbrales son heurísticos para MDF; guardarlos en `src/data/ajuste.json` para que Rafael los afine con pruebas reales.

**Casos de prueba** (t = 2.85, k = 0.2)
| w | real | h | estado |
|---|---|---|---|
| 3.00 | 3.20 | 0.35 | Floja |
| 2.65 | 2.85 | 0.00 | Justa |
| 2.50 | 2.70 | −0.15 | Entra a presión |
| 2.30 | 2.50 | −0.35 | No entra |

## 4. Generador de la tira de prueba de kerf

Genera un DXF descargable.

- Entradas: largo `L` (100), piezas `n` (10), alto `a` (20), con o sin marco, margen del marco `m` (10).
- Salida: DXF ASCII R12, `$INSUNITS = 4` (mm), entidades `LINE` en la capa `CORTE` color 1 (rojo).
- Las aristas compartidas se dibujan **una sola vez** (si cada pieza fuera un rectángulo cerrado, las líneas internas quedarían duplicadas y se cortarían dos veces; el generador debe dar el ejemplo correcto).
- Sin marco: 2 horizontales + (n + 1) verticales.
- Con marco: lo anterior + 4 líneas del rectángulo exterior.
- Nombre de archivo: `prueba-kerf-{L}mm-{n}piezas[-marco].dxf`.

**Casos de prueba**
| Opciones | Entidades LINE | Caja contenedora |
|---|---|---|
| L=100, n=10, a=20, sin marco | 13 | 100 × 20 |
| L=100, n=10, a=20, marco m=10 | 17 | 120 × 40 |

Prueba adicional: el DXF generado debe pasar el validador de la etapa 2 sin errores.

## 5. Acomodo en la lámina

Dividida en dos bloques: el **comparador de camas** (solo lámina `W × H`) va en la sección 1, y el **conteo de piezas** (lámina, pieza, separación y margen) va en la sección 4, junto a la regla de los 3 mm. La sección 7 enlaza al conteo para calcular cuántas láminas comprar.

- Entradas: lámina `W × H` (por defecto 600 × 600), pieza `w × h`, separación `g` (3), margen al borde `m` (3).
- Por eje: `floor((W − 2m + g) / (w + g))`. Calcular normal y con la pieza girada 90°; mostrar el mayor.
- Dibujo a escala de la lámina con las piezas acomodadas.
- Comparador: dibuja la lámina sobre las tres camas a escala (datos de `src/data/maquinas.json`). Si un lado de la lámina queda a 5 mm o menos del límite de una cama, marcar "justo al límite".

**Casos de prueba**
| Lámina | Pieza | Resultado |
|---|---|---|
| 600 × 600 | 150 × 150 | 9 |
| 600 × 600 | 80 × 60 | 63 |
| 600 × 600 en CMA1200 (1200 × 600) | — | cabe, justo al límite |
| 1220 × 1220 | — | no cabe en ninguna |

## 6. Animación del orden de corte

Basada en `docs/referencia/portada-animacion.html`.

- Selector: "Orden correcto" (huecos → contorno) / "Contorno primero".
- En "Contorno primero", al cerrar el contorno la pieza se desplaza unos píxeles y los huecos se cortan corridos; mostrar el resultado defectuoso al final.
- Controles: reproducir, pausar, velocidad.
- Con `prefers-reduced-motion`, mostrar los dos resultados finales lado a lado sin animación.

## 7. Quiz de seguridad

8 preguntas de opción múltiple, una por pantalla, retroalimentación inmediata. Aprobado con 7 o más. Aclarar en pantalla que el quiz no sustituye la inducción del IDIT.

1. ¿Qué haces antes de operar la láser por primera vez? → Tomar la inducción de seguridad del IDIT.
2. ¿Cuándo puedes abrir la tapa? → Con el botón Laser apagado y después de que el extractor sacó el humo.
3. El trabajo va a durar 12 minutos. ¿Qué haces? → Quedarte vigilando todo el corte.
4. ¿Qué se enciende primero? → El switch inferior de sistemas auxiliares (extractor).
5. Te ofrecen un plástico sin etiqueta para cortar. → No se corta: puede ser PVC y liberar cloro.
6. Ves mucho humo y la lámina no se atraviesa. → Detienes y revisas foco, potencia y velocidad.
7. ¿Dónde fijas el origen por defecto? → Esquina superior derecha.
8. ¿En qué orden se procesa el archivo? → Grabado, huecos, contorno.

Distractores plausibles en cada pregunta. Guardar el resultado en `localStorage` (envolver en try/catch).

## 8. Panel de capas de SmartCarve

Imita la pestaña *Layer* del *Control Panel* de SmartCarve 4.3 (verificado en las capturas `grupo/toolmenu` y `daniel/cutter6`): tabla de 10 capas con ID, color, prioridad (*Prior*) y si se procesa (*Process*); al elegir una capa, sus parámetros (*Max. Power*, *Min. Power*, *Work Speed*). En SmartCarve los objetos se asignan con clic derecho en el color › *Apply to picked object* (página grupal); las prioridades se ejecutan de menor a mayor.

- Colores y prioridades de inicio en `src/data/smartcarve.json`, tomados de la captura de la página grupal (el rojo, capa 3, tiene prioridad 1; el azul, capa 1, prioridad 5). Se avisa en pantalla que en la máquina pueden ser otras.
- Pieza de ejemplo: un grabado, dos huecos y el contorno. Todos empiezan en la capa 1.
- Valores heredados: como en la máquina, cada capa puede arrancar con lo que dejó la sesión anterior (`heredados` en `smartcarve.json`). Hoy solo la capa 1 los tiene (75 / 70 / 30, de la misma captura); las demás arrancan vacías hasta tener una foto del panel. Se marcan con la etiqueta "heredados" y dejan de contar como heredados al editar un campo o al pulsar "Confirmar valores".
- Lógica en `src/lib/capas.js` (`ordenTrabajo`, `revisarCapas`), con pruebas.

**Revisiones**
| id | Nivel | Cuándo |
|---|---|---|
| `sin-prioridad` | Error | Una capa en uso no tiene número de prioridad (detiene las demás revisiones) |
| `sin-procesar` | Error | Un objeto está en una capa con Process = No |
| `mezcla` | Error | Grabado y corte en la misma capa |
| `orden-grabado` | Error | Algún corte tiene prioridad menor que el grabado |
| `orden-contorno` | Error | Algún hueco tiene prioridad mayor que el contorno |
| `mismo-turno` | Aviso | Contorno y huecos en la misma capa o con la misma prioridad |
| `prioridad-repetida` | Aviso | Dos capas en uso con la misma prioridad |
| `sin-parametros` | Aviso | Capa en uso sin potencia máxima, mínima o velocidad |
| `heredados` | Aviso | Capa en uso con los valores de la sesión anterior sin revisar |
| `min-mayor` | Error | Potencia mínima mayor que la máxima |
| `fuera-rango` | Error | Potencia mayor que 100 % |

**Casos de prueba**
| Asignación (grabado / huecos / contorno) | Resultado |
|---|---|
| 1 / 1 / 1 | `mezcla`, `mismo-turno` |
| 3 / 2 / 5 con parámetros | Sin hallazgos; orden 3 → 2 → 5 |
| 1 / 3 / 3 (azul graba, rojo corta) | `orden-grabado`, `mismo-turno` |
| 3 / 5 / 2 | `orden-contorno` |

Valores de referencia mostrados: corte 2019 (60 / 50 / 18) y grabado 2019 (25 / 20 / 40), los dos en MDF de 3 mm, presentados como punto de partida.

**Ayudas para principiantes**
- Modo guiado (por defecto) con cuatro pasos: grabado primero, huecos después, contorno al final, potencia y velocidad. Cada paso se marca solo al cumplirse (`progresoMisiones` en `src/lib/capas.js`). Si el contorno ya estaba en una capa que va al final, el paso 3 se cumple sin tocarlo y el paso 4 lo explica.
- **Pista:** resalta el objeto del paso y la capa sugerida (`capaSugerida`: la de prioridad más baja disponible para ese paso) y recuerda que manda el número de Prior, no el color.
- **Muéstrame:** hace el paso con animación, objeto por objeto.
- Tocar el color de una capa la aplica al objeto seleccionado (como clic derecho › Apply to picked object). El ID solo muestra los parámetros.
- **Usar valores de referencia:** llena las capas en uso con los valores de 2019 (grabado si la capa solo graba, corte en otro caso; `aplicarReferencia`) y avisa que se confirman con una prueba.
- Un solo mensaje principal (el primer error o aviso) y un enlace para ver los demás.
- Modo libre: el panel sin pasos, para experimentar.
