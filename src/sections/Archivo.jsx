import { Suspense, lazy, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import Seccion, { Bloque } from '../components/Seccion.jsx'
import Tarjeta from '../components/Tarjeta.jsx'
import Figura from '../components/Figura.jsx'
import Checklist from '../components/Checklist.jsx'
import { Segmentado } from '../tools/comun.jsx'
import OrdenCorte from '../tools/OrdenCorte.jsx'
import Cargando from '../tools/Cargando.jsx'
import { AcomodoPiezas } from '../tools/AcomodoLamina.jsx'
import './secciones.css'

// Las dos herramientas más pesadas van en archivos aparte. La descarga empieza de inmediato,
// en paralelo, para que estén listas cuando el alumno llegue a esta sección.
const cargaValidador = import('../tools/ValidadorDxf/ValidadorDxf.jsx')
const cargaPanel = import('../tools/PanelCapas/PanelCapas.jsx')
const ValidadorDxf = lazy(() => cargaValidador)
const PanelCapas = lazy(() => cargaPanel)

const PROGRAMAS = [
  {
    valor: 'fusion',
    etiqueta: 'Fusion',
    color: 'accent',
    pasos: [
      <>Abre <strong>Modify › Change Parameters</strong>.</>,
      <>Agrega tres parámetros de usuario: <code>espesor</code>, <code>kerf</code> y <code>ranura</code> con la expresión <code>espesor - kerf</code>.</>,
      <>Al acotar una ranura en el boceto, escribe <code>ranura</code> en lugar de un número.</>,
      <>Para exportar: clic derecho en el boceto › <strong>Save As DXF</strong>.</>,
    ],
    codigo: 'espesor = 2.85 mm\nkerf    = 0.2 mm\nranura  = espesor - kerf',
  },
  {
    valor: 'onshape',
    etiqueta: 'Onshape',
    color: 'blue',
    pasos: [
      <>Agrega una operación <strong>Variable</strong> por cada parámetro, al inicio del árbol.</>,
      <>Úsalas en cotas con el signo de número: <code>#espesor</code>, <code>#ranura</code>.</>,
      <>Para exportar: clic derecho en la cara plana › <strong>Export as DXF/DWG</strong>.</>,
    ],
    codigo: '#espesor = 2.85 mm\n#kerf    = 0.2 mm\n#ranura  = #espesor - #kerf',
  },
  {
    valor: 'autocad',
    etiqueta: 'AutoCAD',
    color: 'teal',
    pasos: [
      <>Abre el <strong>Parameters Manager</strong> y crea los parámetros de usuario.</>,
      <>Acota con restricciones paramétricas y usa los parámetros en las expresiones. Así se diseñó el kit de 2019.</>,
      <>Guarda la versión limpia como DXF.</>,
    ],
    codigo: 'espesor = 2.85\nkerf    = 0.2\nranura  = espesor - kerf',
    imagenes: ['2019/kit2.webp', '2019/kit.webp'],
  },
  {
    valor: 'openscad',
    etiqueta: 'OpenSCAD',
    color: 'amber',
    pasos: [
      <>Los parámetros son variables al inicio de tu código. Es la ruta de Daniel, natural si ya programas.</>,
      <>Dibuja en 2D, renderiza con <strong>F6</strong> y exporta con <strong>File › Export › Export as DXF</strong>.</>,
    ],
    codigo: 'espesor = 2.85;  // mide tu MDF\nkerf    = 0.2;   // de tu prueba\nranura  = espesor - kerf;\n\ndifference() {\n  square([60, 40]);\n  translate([30 - ranura / 2, 25])\n    square([ranura, 15]);\n}',
    imagenes: ['daniel/scad1.webp', 'daniel/scad3.webp'],
  },
  {
    valor: 'solidworks',
    etiqueta: 'SolidWorks',
    color: 'text',
    pasos: [
      <>Revisa que la pieza esté en milímetros: <strong>Herramientas › Opciones › Propiedades de documento › Unidades</strong> (MMGS).</>,
      <>Abre <strong>Herramientas › Ecuaciones</strong> y crea tres <strong>variables globales</strong>: <code>espesor</code>, <code>kerf</code> y <code>ranura</code> con el valor <code>"espesor" - "kerf"</code>.</>,
      <>Al acotar la ranura en el croquis, escribe <code>=</code> y elige <code>"ranura"</code> en lugar de un número.</>,
      <>Para exportar: clic derecho en la cara plana de la pieza › <strong>Exportar a DXF/DWG</strong>.</>,
    ],
    codigo: '"espesor" = 2.85\n"kerf"    = 0.2\n"ranura"  = "espesor" - "kerf"',
  },
  {
    valor: 'catia',
    etiqueta: 'CATIA',
    color: 'muted',
    pasos: [
      <>En CATIA V5, crea los parámetros con <strong>Herramientas › Fórmula</strong> (f(x)): <strong>Nuevo parámetro de tipo</strong> Longitud para <code>espesor</code> y <code>kerf</code>.</>,
      <>Crea <code>ranura</code> también como Longitud y dale la fórmula <code>espesor - kerf</code>.</>,
      <>Al acotar la ranura en el Sketcher, doble clic en la cota › clic derecho en el valor › <strong>Editar fórmula</strong> y elige <code>ranura</code>.</>,
      <>Para exportar: pasa la pieza al taller <strong>Drafting</strong>, crea la vista de la cara plana y guarda con <strong>Archivo › Guardar como</strong> en formato <code>dxf</code>.</>,
    ],
    codigo: 'espesor = 2.85mm\nkerf    = 0.2mm\nranura  = espesor - kerf',
  },
]

function Parametrico() {
  const [prog, setProg] = useState('fusion')
  const p = PROGRAMAS.find((x) => x.valor === prog)
  return (
    <>
      <Segmentado grupo="programa" etiqueta="Programa" opciones={PROGRAMAS} valor={prog} alCambiar={setProg} />
      <AnimatePresence mode="wait">
        <motion.div
          key={prog}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          style={{ marginTop: 16 }}
        >
          <div className="rejilla-2">
            <Tarjeta titulo={p.etiqueta} acento={p.color}>
              <Checklist items={p.pasos} />
            </Tarjeta>
            <div>
              <pre className="codigo">
                <code>{p.codigo}</code>
              </pre>
              <p className="nota-prueba" style={{ marginTop: 8 }}>
                Valores de ejemplo: usa el espesor que mediste y el kerf de tu prueba.
              </p>
            </div>
          </div>
          {p.imagenes && (
            <div className="rejilla-fotos" style={{ marginTop: 16 }}>
              {p.imagenes.map((r) => (
                <Figura key={r} ruta={r} recorte="16 / 10" />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </>
  )
}

export default function Archivo() {
  return (
    <Seccion
      id="archivo"
      numero={4}
      titulo="Prepara tu archivo"
      idea="La máquina corta exactamente lo que dibujaste, incluidos tus errores."
      alterna
    >
      <div className="rejilla-2">
        <Checklist
          items={[
            <><strong>DXF en milímetros.</strong></>,
            <><strong>Contornos cerrados.</strong> Una línea abierta deja la pieza pegada a la lámina.</>,
            <><strong>Sin líneas repetidas encimadas.</strong> Se cortan dos veces y queman el borde.</>,
            <><strong>Sin cotas, texto de medidas ni líneas de construcción.</strong> Guarda dos versiones: una con cotas para documentar y una limpia para cortar.</>,
            <><strong>Texto a grabar convertido a curvas.</strong></>,
            <><strong>Al menos 3 mm de separación</strong> entre piezas y desde el borde del material.</>,
            <><strong>Capas por color.</strong> En SmartCarve cada color es una capa con su potencia, velocidad y prioridad.</>,
          ]}
        />
        <div className="pila">
          <Figura ruta="daniel/laser13.webp" />
          <Figura ruta="daniel/laser3.webp" />
        </div>
      </div>

      <Bloque titulo="Acomoda tus piezas">
        <p>
          La regla de los 3 mm cuenta para el acomodo: entre pieza y pieza, y entre las piezas y el borde de la lámina. Con piezas
          iguales, calcula cuántas te salen por lámina.
        </p>
        <AcomodoPiezas />
      </Bloque>

      <Bloque>
        <Suspense fallback={<Cargando id="validador-dxf" titulo="Revisa tu DXF antes de cortar" />}>
          <ValidadorDxf />
        </Suspense>
      </Bloque>

      <Bloque titulo="Orden de trabajo: grabado, huecos, contorno">
        <p>
          Asigna las prioridades en SmartCarve para que primero grabe, luego corte los huecos interiores y al final el contorno
          exterior. Si el contorno va antes, la pieza se suelta y lo de adentro sale desplazado.
        </p>
        <OrdenCorte />
      </Bloque>

      <Bloque titulo="Capas por color en SmartCarve">
        <p>
          SmartCarve separa tu dibujo por color: cada color es una capa con su potencia, su velocidad y su prioridad. Las
          prioridades se ejecutan de menor a mayor. Es lo que te deja grabar primero, cortar los huecos después y el contorno
          al final.
        </p>
        <Suspense fallback={<Cargando id="panel-capas" titulo="Asigna capas como en SmartCarve" />}>
          <PanelCapas />
        </Suspense>
      </Bloque>

      <Bloque titulo="Diseña con parámetros">
        <p>
          Define tres parámetros: <code>espesor</code>, <code>kerf</code> y <code>ranura = espesor − kerf</code>. Cuando cambie
          el lote de MDF o tu kerf, cambias un número y todas las ranuras se ajustan solas.
        </p>
        <Parametrico />
      </Bloque>

      <Bloque titulo="Un error que se repite">
        <div className="rejilla-2 centrada">
          <Figura ruta="daniel/mistakes2.webp" />
          <p>
            Si escalas una pieza para hacerla más grande, las ranuras crecen con ella y dejan de coincidir con tu espesor. Con
            parámetros, cambias el tamaño de la pieza y la ranura se queda en su medida.
          </p>
        </div>
      </Bloque>
    </Seccion>
  )
}
