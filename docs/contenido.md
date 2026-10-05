# Contenido del sitio

Tono: tuteo, cercano, frases cortas. Títulos con personalidad, como en la presentación de clase ("El láser se come un pedacito", "Afuera se encoge, adentro crece"). Cada sección abre con un título y una idea central de una línea. Nada de párrafos largos: el alumno lee esto parado junto a la máquina.

Material de referencia: MDF de 3 mm, que es lo que usan los alumnos de primer semestre.

---

## Correcciones obligatorias a las fuentes

Las tres fuentes tienen errores o ambigüedades. El sitio NO debe repetirlos:

1. **Fórmula del kerf.** Hay dos maneras de medir con la tira de 10 rectángulos y cada una lleva su divisor:
   - **Piezas juntas:** se juntan las 10 piezas y se mide su largo total. Cada pieza pierde un kerf completo (medio por lado). `kerf = (largo dibujado − largo medido) / 10`.
   - **Hueco en el marco:** se regresan las piezas al marco y se mide el hueco que sobra. El hueco vale 11 kerfs, porque el marco también se agranda. `kerf = hueco / 11`.
   La página de 2019 y la página grupal no dejan claro cuál de las dos midieron. El sitio explica ambas y dice siempre qué se mide.
2. **Potencia y velocidad.** En la página grupal, la sección titulada "Speed" describe la potencia. Usar las definiciones de este documento.
3. **Kerf total y kerf por lado.** Siempre decir cuál es. El kerf es el ancho total del corte; cada borde pierde la mitad.
4. **Valores de kerf reportados** (mismas máquinas, en mm): 2019 = 0.16 total; código de Daniel = 0.136; lo que Daniel dice que midió su grupo ≈ 0.36; página grupal = 0.25 (en MDF de 2.5 mm). Se presentan juntos como hallazgo: el kerf cambia con la máquina, el tubo, la velocidad, el lote de material y la forma de medir.

---

## 1. Las máquinas del IDIT

Idea central: tres cortadoras, mismo flujo.

| Modelo | Área de trabajo | Notas |
|---|---|---|
| CAMFive CFL-CMA1200 | 1200 × 600 mm | Cama de panal |
| CAMFive CFL-CMA1080K | 1000 × 800 mm | La documentada en 2019; mesa sube y baja; accesorio rotativo |
| CAMFive CFL-CMA1309T | 1300 × 900 mm | Cama de panal |

Las tres: láser de CO₂ de 100 W, controladas con SmartCarve 4.3 (requiere llave USB conectada), reciben archivos DXF. Hay un switch inferior que enciende los sistemas auxiliares, incluido el extractor.

Interactivo: comparador de camas a escala con la pieza de material del alumno encima (ver `herramientas.md`, "Acomodo en la lámina").

## 2. Cómo corta

Idea central: un haz invisible concentrado en un punto evapora el material.

- **Foco:** distancia entre la boquilla y el material. 5 mm, ajustada con un calibrador de esa medida. Muy bajo quema; muy alto no corta.
- **Potencia máxima (%):** la que usa en tramos rectos. Decide si atraviesa el material.
- **Potencia mínima (%):** la que usa en curvas y esquinas, donde el cabezal frena. Si es alta, quema las esquinas; si es baja, deja curvas sin cortar. Se deja 10 a 20 % abajo de la máxima.
- **Velocidad (mm/s):** más lenta corta más hondo, pero quema más y ensancha el corte.

Tabla de valores reportados para MDF de 3 mm (Máx / Mín / Velocidad):
- 2019: 60 / 50 / 18
- Daniel, 2026: 80 / 75 / 25 (reporta que quemó un poco)
- Página grupal, 2026: 75 / 70 / 30

Punto de partida: máx 70–80, mín unos 10 abajo, 20–30 mm/s. Se confirma con una prueba de potencia y velocidad en la máquina del día. La página grupal usa una plantilla de LaserGridMaster para la matriz de prueba; mencionarlo como opción.

## 3. Kerf

Idea central: el láser se come un pedacito, y ese pedacito decide si tus piezas embonan.

- Definición: ancho de material que elimina el corte.
- Regla: cada borde pierde la mitad del kerf. **Afuera se encoge, adentro crece.** Los contornos exteriores salen más chicos que el dibujo; huecos y ranuras salen más grandes.
- Para un ensamble ajustado (press-fit): `ranura = espesor real − kerf`.
- El MDF de "3 mm" casi nunca mide 3.00. Se mide con vernier cada lote.
- Cómo se mide: las dos variantes de la sección de correcciones, con diagrama de cada una.
- La anécdota de Daniel: aplicó el kerf al revés, sus piezas no embonaron y necesitó 9 cortes de prueba. Usar con su crédito; es un buen ejemplo de documentar el error.
- La tabla de cuatro valores reportados (correcciones, punto 4).

Interactivos: calculadora de kerf, calculadora de ranura, simulador de ensamble, generador de la tira de prueba.

## 4. Prepara tu archivo

Idea central: la máquina corta exactamente lo que dibujaste, incluidos tus errores.

Checklist:
- DXF en milímetros.
- Contornos cerrados.
- Sin líneas repetidas encimadas (se cortan dos veces y queman).
- Sin cotas, texto de medidas ni líneas de construcción en el archivo de corte. Guarda dos versiones: una con cotas para documentar y una limpia para cortar.
- Texto a grabar convertido a curvas.
- Al menos 3 mm de separación entre piezas y desde el borde del material.
- Capas por color: en SmartCarve cada color es una capa con su potencia, velocidad y prioridad.
- Orden de trabajo: **grabado → huecos interiores → contorno exterior**. Si el contorno va antes, la pieza se suelta y lo de adentro sale desplazado.

Diseño paramétrico: recomendar parámetros `espesor`, `kerf` y `ranura = espesor − kerf`. Mostrar cómo en Fusion (Modify › Change Parameters), Onshape (Variable, se usan como `#espesor`), AutoCAD (Parameters Manager, como en 2019), OpenSCAD (variables en código; la ruta de Daniel, natural para alumnos de Sistemas), SolidWorks (Herramientas › Ecuaciones, variables globales) y CATIA V5 (Herramientas › Fórmula).

Exportar: Fusion, clic derecho en el boceto › Save As DXF. Onshape, clic derecho en la cara plana › Export as DXF/DWG. SolidWorks, clic derecho en la cara plana › Exportar a DXF/DWG. CATIA V5, desde un dibujo en Drafting › Guardar como dxf.

Interactivos: validador de DXF (etapa 2) y animación del orden de corte.

## 5. Usa la máquina

Idea central: cinco fases, siempre en el mismo orden.

1. **Encender:** switch inferior (arranca el extractor, hace mucho ruido) → switches de la máquina → liberar paro de emergencia → girar la llave.
2. **Preparar:** foco a 5 mm con el calibrador (se aflojan las tuercas, se pone el calibrador, se aprietan) → material en la cama → origen en la esquina superior derecha con las flechas y el botón Origin.
3. **Programar:** en SmartCarve, importar el DXF en mm → asignar capas, prioridades, potencia y velocidad → Go Scale (el cabezal recorre el perímetro del trabajo para verificar que cabe en el material). Opcional: guardar como `.oud` para cargar desde USB.
4. **Cortar:** cerrar la tapa → botón Laser → Start → vigilar todo el corte.
5. **Terminar:** esperar a que el extractor saque el humo → apagar el botón Laser → abrir → retirar piezas → apagar en orden inverso (potencia al mínimo, llave fuera, paro, switches) → limpiar la cama.

Interactivo opcional: modo "paso a paso" con casillas, pensado para usarse en el celular frente a la máquina.

## 6. Seguridad

Idea central: las reglas que no se negocian.

- No operas sin la inducción de seguridad del IDIT.
- Nunca abras la tapa con el láser activo. El haz no se ve.
- Nunca dejes la máquina sola mientras corta. Papel y cartón se incendian.
- Extractor siempre encendido. El humo del MDF lleva compuestos de las resinas (formaldehído).
- Mucho humo significa que no está cortando bien: detén y revisa.
- No cortes plásticos desconocidos. PVC y vinil liberan cloro.
- Ubica el paro de emergencia y el extintor antes de empezar.

Interactivo: quiz de seguridad (ver `herramientas.md`).

## 7. Materiales y juntas

- Materiales que se cortan y que se graban: usar la lista de la página grupal, que es la más completa, revisando redacción. Marcar en rojo los prohibidos.
- Tipos de junta (de la página grupal, con sus archivos descargables `joints.zip` y su crédito): press-fit, finger joint, snap-fit, cuña, perno, flexión (living hinge).
- Comprar material: hoja de MDF crudo de 3 mm (1.22 × 2.44 m), pedirla cortada en piezas de 60 × 60 cm (8 por hoja). Media hoja no cabe en ninguna máquina. Sin melamina, sin pintura, sin pandeo.

## 8. Galería

Trabajos de la comunidad con crédito: kit paramétrico de polígonos (2019), kit de esferas en OpenSCAD y soporte de laptop (Daniel, 2026), pruebas del grupo 2026. Pensar la galería para crecer cada semestre con piezas de los alumnos (datos en `src/data/galeria.json`).

---

## Pendientes por confirmar

Datos de las fuentes que no cuadran. El sitio no los resuelve por su cuenta; se decide con Rafael.

1. **Modelo de la tercera máquina.** Este documento dice CFL-CMA1309T. Dos fotos de la placa (página grupal y Daniel) dicen **CFL-CMA1390T**, y el área 1300 × 900 coincide con "1390". El sitio usa 1309T hasta confirmar; se cambia en `src/data/maquinas.json`.
2. **Medida del vernier en 2019.** La página de 2019 reporta 98.25 mm; la foto `20190206_171302` parece marcar 98.34. El sitio no muestra la cifra junto a la foto.
3. **Kerf de Daniel.** Su código usa `kerf = 0.136` y lo describe como el valor que calculó su clase; en sus resultados escribe "around 0.36mm". El sitio presenta ambos tal como él los reporta.
4. **Kerf de la página grupal.** Divide el espesor del MDF entre el número de cortes (2.5 / 10 = 0.25). Ese cálculo no corresponde a ninguna de las dos maneras de medir; el valor se muestra solo como reportado.

## Fuentes

- Rafael Pérez Aguirre, Fab Academy 2019, semana 4: https://fabacademy.org/2019/labs/puebla/students/rafael-aguirre/week04.html
- Daniel Peña Cruz, Fab Academy 2026, semana 3 (CC BY-NC): https://fabacademy.org/2026/labs/puebla/students/daniel-penyacruz/assignments/week03.html
- Itzel Eunice Moreno Rodríguez, página grupal Fab Academy 2026 (CC BY-NC): https://fabacademy.org/2026/labs/puebla/students/itzeleunice-moreno/assignments/groupassignment1.html
