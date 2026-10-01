import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Herramienta, Campo, Segmentado, Resultado, Mensaje } from './comun.jsx'
import Formula from '../components/Formula.jsx'
import { kerfPiezasJuntas, kerfHuecoMarco } from '../lib/kerf.js'
import { formatear, leerNumero } from '../lib/numeros.js'
import './svg.css'

const MODOS = [
  { valor: 'piezas', etiqueta: 'Piezas juntas' },
  { valor: 'marco', etiqueta: 'Hueco en el marco' },
]

export function DiagramaPiezas() {
  const ancho = 44
  return (
    <svg viewBox="0 0 520 150" role="img" aria-labelledby="dk-piezas">
      <title id="dk-piezas">
        Las diez piezas juntas, una contra otra. Arriba, el largo dibujado L; abajo, el largo medido M, que sale más corto.
      </title>
      <line x1="40" y1="22" x2="480" y2="22" className="s-guia" />
      <text x="260" y="16" textAnchor="middle" className="s-texto-chico">L = largo dibujado</text>
      <line x1="40" y1="16" x2="40" y2="28" className="s-linea" />
      <line x1="480" y1="16" x2="480" y2="28" className="s-linea" />
      {Array.from({ length: 10 }, (_, i) => (
        <rect key={i} x={40 + i * (ancho - 1.6)} y="40" width={ancho - 1.6} height="60" className="s-pieza" stroke="#16161E" strokeWidth="1" />
      ))}
      <line x1="40" y1="120" x2={40 + 10 * (ancho - 1.6)} y2="120" className="s-amber-trazo" />
      <line x1="40" y1="113" x2="40" y2="127" className="s-amber-trazo" />
      <line x1={40 + 10 * (ancho - 1.6)} y1="113" x2={40 + 10 * (ancho - 1.6)} y2="127" className="s-amber-trazo" />
      <text x="230" y="143" textAnchor="middle" className="s-texto">M = lo que mides con el vernier</text>
    </svg>
  )
}

export function DiagramaMarco() {
  return (
    <svg viewBox="0 0 520 150" role="img" aria-labelledby="dk-marco">
      <title id="dk-marco">
        Las diez piezas regresan al marco y se empujan hacia un lado. Sobra un hueco g al final, que vale once kerfs.
      </title>
      <rect x="20" y="20" width="480" height="100" className="s-madera" />
      <rect x="50" y="40" width="420" height="60" className="s-hueco" />
      {Array.from({ length: 10 }, (_, i) => (
        <rect key={i} x={50 + i * 40.5} y="40" width="40.5" height="60" className="s-pieza" stroke="#16161E" strokeWidth="1" />
      ))}
      <rect x="455" y="40" width="15" height="60" className="s-amber" opacity="0.85" />
      <line x1="455" y1="132" x2="470" y2="132" className="s-amber-trazo" />
      <text x="462" y="148" textAnchor="middle" className="s-texto s-mono">g</text>
      <text x="250" y="140" textAnchor="middle" className="s-texto">Empuja las piezas a un lado y mide el hueco</text>
    </svg>
  )
}

export default function CalculadoraKerf() {
  const [modo, setModo] = useState('piezas')
  const [L, setL] = useState('100')
  const [n, setN] = useState('10')
  const [M, setM] = useState('')
  const [g, setG] = useState('')

  const r =
    modo === 'piezas'
      ? kerfPiezasJuntas({ L: leerNumero(L), n: leerNumero(n), M: leerNumero(M) })
      : kerfHuecoMarco({ n: leerNumero(n), g: leerNumero(g) })

  const ok = r?.ok
  return (
    <Herramienta
      id="calculadora-kerf"
      titulo="Calculadora de kerf"
      descripcion="Elige cómo mediste tu tira de prueba. Cada forma de medir lleva su propio divisor."
    >
      <Segmentado grupo="kerf" etiqueta="Forma de medir" opciones={MODOS} valor={modo} alCambiar={setModo} />
      <AnimatePresence mode="wait">
        <motion.figure
          key={modo}
          className="diagrama"
          style={{ marginTop: 16 }}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.2 }}
        >
          {modo === 'piezas' ? <DiagramaPiezas /> : <DiagramaMarco />}
          <figcaption>
            {modo === 'piezas'
              ? 'Juntas las piezas y mides su largo total. Cada pieza perdió un kerf completo, medio por lado.'
              : 'Regresas las piezas al marco y mides el hueco que sobra. El marco también se agrandó: el hueco vale n + 1 kerfs.'}
          </figcaption>
        </motion.figure>
      </AnimatePresence>

      <Formula>{modo === 'piezas' ? 'kerf = ({L} − {M}) / {n}' : 'kerf = {g} / ({n} + 1)'}</Formula>

      <div className="campos">
        {modo === 'piezas' && <Campo etiqueta="Largo dibujado (L)" valor={L} alCambiar={setL} />}
        <Campo etiqueta="Número de piezas (n)" valor={n} alCambiar={setN} unidad="" entero />
        {modo === 'piezas' ? (
          <Campo etiqueta="Largo medido (M)" valor={M} alCambiar={setM} placeholder="98.40" />
        ) : (
          <Campo etiqueta="Hueco medido (g)" valor={g} alCambiar={setG} placeholder="1.75" />
        )}
      </div>

      {r && !ok && <Mensaje>{r.error}</Mensaje>}
      {ok && r.avisos.map((a) => <Mensaje key={a} tono="amber">{a}</Mensaje>)}

      <div className="resultados" aria-live="polite">
        <Resultado etiqueta="Kerf total" valor={ok ? formatear(r.kerf, 3) : '—'} destacado />
        <Resultado etiqueta="Kerf por lado" valor={ok ? formatear(r.porLado, 4) : '—'} />
      </div>
      <p className="nota-prueba">
        El kerf total es el ancho del corte. Cada borde pierde la mitad: ese es el kerf por lado.
      </p>
    </Herramienta>
  )
}
