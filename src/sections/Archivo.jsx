import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import Seccion, { Bloque } from '../components/Seccion.jsx'
import Tarjeta from '../components/Tarjeta.jsx'
import Figura from '../components/Figura.jsx'
import Checklist from '../components/Checklist.jsx'
import { Segmentado } from '../tools/comun.jsx'
import OrdenCorte from '../tools/OrdenCorte.jsx'
import ValidadorDxf from '../tools/ValidadorDxf/ValidadorDxf.jsx'
import './secciones.css'

const PROGRAMAS = [
  {
    valor: 'fusion',
    etiqueta: 'Fusion',
    color: 'teal',
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
    color: 'orange',
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
    color: 'amber',
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
    color: 'rose',
    pasos: [
      <>Los parámetros son variables al inicio de tu código. Es la ruta de Daniel, natural si ya programas.</>,
      <>Dibuja en 2D, renderiza con <strong>F6</strong> y exporta con <strong>File › Export › Export as DXF</strong>.</>,
    ],
    codigo: 'espesor = 2.85;  // mide tu MDF\nkerf    = 0.2;   // de tu prueba\nranura  = espesor - kerf;\n\ndifference() {\n  square([60, 40]);\n  translate([30 - ranura / 2, 25])\n    square([ranura, 15]);\n}',
    imagenes: ['daniel/scad1.webp', 'daniel/scad3.webp'],
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
            <pre className="codigo">
              <code>{p.codigo}</code>
            </pre>
          </div>
          {p.imagenes && (
            <div className="rejilla-fotos" style={{ marginTop: 16 }}>
              {p.imagenes.map((r) => (
                <Figura key={r} ruta={r} />
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

      <Bloque>
        <ValidadorDxf />
      </Bloque>

      <Bloque titulo="Orden de trabajo: grabado, huecos, contorno">
        <p>
          Asigna las prioridades en SmartCarve para que primero grabe, luego corte los huecos interiores y al final el contorno
          exterior. Si el contorno va antes, la pieza se suelta y lo de adentro sale desplazado.
        </p>
        <OrdenCorte />
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
