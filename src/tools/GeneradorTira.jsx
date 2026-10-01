import { useId, useState } from 'react'
import { motion } from 'motion/react'
import { Herramienta, Campo, Mensaje } from './comun.jsx'
import { generarTiraDxf, validarOpcionesTira } from '../lib/tiraKerf.js'
import { formatear, leerNumero } from '../lib/numeros.js'
import './svg.css'

function Vista({ lineas, caja }) {
  const pad = Math.max(caja.ancho, caja.alto) * 0.04
  const vb = `${caja.minX - pad} ${-caja.maxY - pad} ${caja.ancho + 2 * pad} ${caja.alto + 2 * pad}`
  const grosor = Math.max(caja.ancho, caja.alto) / 300
  return (
    <svg viewBox={vb} role="img" aria-label={`Vista previa: ${lineas.length} líneas, ${formatear(caja.ancho, 2)} por ${formatear(caja.alto, 2)} mm.`}>
      <g transform="scale(1,-1)">
        {lineas.map(([x1, y1, x2, y2], i) => (
          <motion.line
            key={`${x1}-${y1}-${x2}-${y2}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="var(--rose)"
            strokeWidth={grosor}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.4, delay: i * 0.03 }}
          />
        ))}
      </g>
    </svg>
  )
}

export default function GeneradorTira() {
  const [L, setL] = useState('100')
  const [n, setN] = useState('10')
  const [a, setA] = useState('20')
  const [marco, setMarco] = useState(true)
  const [m, setM] = useState('10')
  const idMarco = useId()

  const op = { L: leerNumero(L), n: leerNumero(n), a: leerNumero(a), marco, m: leerNumero(m) }
  const error = validarOpcionesTira(op)
  const dxf = error ? null : generarTiraDxf(op)

  const descargar = () => {
    const url = URL.createObjectURL(new Blob([dxf.texto], { type: 'application/dxf' }))
    const enlace = document.createElement('a')
    enlace.href = url
    enlace.download = dxf.nombre
    enlace.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <Herramienta
      id="generador-tira"
      titulo="Genera tu tira de prueba"
      descripcion="Descarga el DXF listo para cortar: en milímetros, en la capa CORTE (rojo) y sin líneas repetidas."
    >
      <div className="campos">
        <Campo etiqueta="Largo total (L)" valor={L} alCambiar={setL} />
        <Campo etiqueta="Piezas (n)" valor={n} alCambiar={setN} unidad="" entero />
        <Campo etiqueta="Alto (a)" valor={a} alCambiar={setA} />
        {marco && <Campo etiqueta="Margen del marco (m)" valor={m} alCambiar={setM} />}
      </div>
      <label htmlFor={idMarco} className="casilla">
        <input id={idMarco} type="checkbox" checked={marco} onChange={(e) => setMarco(e.target.checked)} />
        Con marco (para medir el hueco)
      </label>
      {error && <Mensaje>{error}</Mensaje>}
      {dxf && (
        <>
          <figure className="diagrama">
            <Vista lineas={dxf.lineas} caja={dxf.caja} />
            <figcaption>
              {dxf.lineas.length} líneas · {formatear(dxf.caja.ancho, 2)} × {formatear(dxf.caja.alto, 2)} mm. Las líneas entre
              piezas se dibujan una sola vez: si cada pieza fuera un rectángulo cerrado, esas líneas se cortarían dos veces.
            </figcaption>
          </figure>
          <button type="button" className="btn btn-primary" onClick={descargar}>
            Descargar {dxf.nombre}
          </button>
        </>
      )}
    </Herramienta>
  )
}
