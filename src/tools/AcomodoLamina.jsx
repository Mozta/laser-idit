import { useState } from 'react'
import { motion } from 'motion/react'
import { Herramienta, Campo, Resultado, Mensaje } from './comun.jsx'
import { acomodar, compararCamas } from '../lib/acomodo.js'
import { formatear, leerNumero } from '../lib/numeros.js'
import maquinas from '../data/maquinas.json'
import './svg.css'
import './AcomodoLamina.css'

const MAX_ANIMADAS = 120

function Lamina({ W, H, g, m, mejor }) {
  const piezas = []
  for (let f = 0; f < mejor.filas; f++)
    for (let c = 0; c < mejor.columnas; c++) piezas.push([m + c * (mejor.pw + g), m + f * (mejor.ph + g)])
  const animar = piezas.length <= MAX_ANIMADAS
  const borde = Math.max(W, H) / 250
  return (
    <svg viewBox={`${-borde} ${-borde} ${W + 2 * borde} ${H + 2 * borde}`} role="img" aria-label={`Lámina de ${W} por ${H} mm con ${piezas.length} piezas acomodadas.`}>
      <rect width={W} height={H} className="s-madera" />
      <rect x={m} y={m} width={Math.max(0, W - 2 * m)} height={Math.max(0, H - 2 * m)} className="s-guia" style={{ strokeWidth: borde }} />
      {piezas.map(([x, y], i) => (
        <motion.g
          key={`${mejor.pw}-${mejor.ph}-${i}`}
          initial={animar ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25, delay: animar ? i * 0.012 : 0 }}
        >
          <rect x={x} y={y} width={mejor.pw} height={mejor.ph} className="s-pieza" style={{ stroke: 'var(--accent)', strokeWidth: borde }} />
        </motion.g>
      ))}
    </svg>
  )
}

function Camas({ lamina, resultados }) {
  // Mismo viewBox para las tres: así quedan a la misma escala.
  const lado = Math.max(lamina.W, lamina.H)
  const vbW = Math.max(...maquinas.map((q) => q.ancho), lado) + 60
  const vbH = Math.max(...maquinas.map((q) => q.alto), lado) + 60
  return (
    <div className="camas">
      {resultados.map((r) => {
        const q = r.maquina
        const lw = r.cabe ? r.ancho : lamina.W
        const lh = r.cabe ? r.alto : lamina.H
        const estado = !r.cabe ? 'No cabe' : r.justo ? 'Cabe, justo al límite' : 'Cabe'
        const tono = !r.cabe ? 'rose' : r.justo ? 'amber' : 'teal'
        return (
          <figure key={q.id} className="cama" style={{ '--acento': `var(--${tono})` }}>
            <svg viewBox={`${-30 - (vbW - 60 - q.ancho)} -30 ${vbW} ${vbH}`} role="img" aria-label={`${q.modelo}, cama de ${q.ancho} por ${q.alto} mm: ${estado}.`}>
              <rect width={q.ancho} height={q.alto} className="s-cama" style={{ strokeWidth: 6 }} />
              {/* El origen va en la esquina superior derecha */}
              <motion.rect
                initial={false}
                className="s-madera"
                style={{ stroke: `var(--${tono})`, strokeWidth: 8, fillOpacity: 0.9 }}
                animate={{ attrX: q.ancho - lw, width: lw, height: lh }}
                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
              />
              <circle cx={q.ancho} cy={0} r={22} className="s-amber" />
            </svg>
            <figcaption>
              <strong>{q.modelo.replace('CAMFive ', '')}</strong>
              <span>
                {q.ancho} × {q.alto} mm
              </span>
              <span className="cama-estado">{estado}</span>
            </figcaption>
          </figure>
        )
      })}
    </div>
  )
}

const MAX_LAMINA = 5000

// Sección 1: en qué cama entra la lámina del alumno.
export function ComparadorCamas() {
  const [W, setW] = useState('600')
  const [H, setH] = useState('600')
  const val = { W: leerNumero(W), H: leerNumero(H) }
  const ok = Number.isFinite(val.W) && Number.isFinite(val.H) && val.W > 0 && val.H > 0
  const muyGrande = ok && (val.W > MAX_LAMINA || val.H > MAX_LAMINA)
  const camas = ok && !muyGrande ? compararCamas(val, maquinas) : null

  return (
    <Herramienta
      id="comparador-camas"
      titulo="¿En qué cama entra tu lámina?"
      descripcion="Escribe el tamaño de tu material. Las tres camas se dibujan a la misma escala, con tu lámina puesta en el origen."
    >
      <div className="campos">
        <Campo etiqueta="Lámina, ancho" valor={W} alCambiar={setW} />
        <Campo etiqueta="Lámina, alto" valor={H} alCambiar={setH} />
      </div>
      {muyGrande && <Mensaje tono="amber">Esa lámina es enorme. Revisa que esté en milímetros.</Mensaje>}
      {camas && (
        <>
          <p className="muted">El punto amarillo es el origen, en la esquina superior derecha. «Justo al límite» significa 5 mm o menos de holgura.</p>
          <Camas lamina={val} resultados={camas} />
        </>
      )}
    </Herramienta>
  )
}

// Sección 4: cuántas piezas iguales caben en la lámina, con separación y margen.
export function AcomodoPiezas() {
  const [W, setW] = useState('600')
  const [H, setH] = useState('600')
  const [w, setw] = useState('80')
  const [h, seth] = useState('60')
  const [g, setG] = useState('3')
  const [m, setM] = useState('3')

  const val = { W: leerNumero(W), H: leerNumero(H), w: leerNumero(w), h: leerNumero(h), g: leerNumero(g), m: leerNumero(m) }
  const r = acomodar(val)
  const muyGrande = val.W > MAX_LAMINA || val.H > MAX_LAMINA

  return (
    <Herramienta
      id="acomodo-lamina"
      titulo="¿Cuántas piezas caben en tu lámina?"
      descripcion="Para piezas iguales: deja al menos 3 mm entre piezas y 3 mm al borde. Prueba la pieza normal y girada, y te muestra la que acomoda más."
    >
      <div className="campos">
        <Campo etiqueta="Lámina, ancho" valor={W} alCambiar={setW} />
        <Campo etiqueta="Lámina, alto" valor={H} alCambiar={setH} />
        <Campo etiqueta="Pieza, ancho" valor={w} alCambiar={setw} />
        <Campo etiqueta="Pieza, alto" valor={h} alCambiar={seth} />
        <Campo etiqueta="Separación entre piezas" valor={g} alCambiar={setG} />
        <Campo etiqueta="Margen al borde" valor={m} alCambiar={setM} />
      </div>
      {muyGrande && <Mensaje tono="amber">Esa lámina es enorme. Revisa que esté en milímetros.</Mensaje>}
      {r && !muyGrande && (
        <div className="acomodo">
          <figure className="diagrama acomodo-lamina">
            <Lamina W={val.W} H={val.H} g={val.g} m={val.m} mejor={r.mejor} />
            <figcaption>Línea punteada: margen al borde. Cada rectángulo es una pieza.</figcaption>
          </figure>
          <div className="resultados" aria-live="polite">
            <Resultado etiqueta="Piezas que caben" valor={String(r.total)} unidad="" destacado />
            <Resultado etiqueta="Acomodo" valor={`${r.mejor.columnas} × ${r.mejor.filas}`} unidad="" />
            <Resultado etiqueta="Orientación" valor={r.mejor.girada ? 'Girada 90°' : 'Normal'} unidad="" />
          </div>
          <p className="nota-prueba">
            Normal: {r.normal.total} · Girada: {r.girada.total}. Si tus piezas son distintas entre sí, acomódalas en tu programa y
            revisa la separación con el validador de abajo.
          </p>
        </div>
      )}
    </Herramienta>
  )
}
