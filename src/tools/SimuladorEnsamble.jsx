import { useId, useState } from 'react'
import { motion } from 'motion/react'
import { Herramienta, Campo, Resultado, Mensaje, MENSAJE_INVALIDO } from './comun.jsx'
import { evaluarEnsamble } from '../lib/ensamble.js'
import { formatear, formatearFijo, leerNumero, escrito } from '../lib/numeros.js'
import './svg.css'
import './SimuladorEnsamble.css'

const ESCALA = 50 // px por mm
const CX = 220
const PLACA_Y = 150
const PLACA_H = 70

function Ilustracion({ w, t, k, r }) {
  const real = Math.max(0.2, w + k)
  const ancho = Math.min(real, 6) * ESCALA
  const tab = Math.min(t, 6) * ESCALA
  const entra = r && r.estado !== 'noEntra'
  const yTab = entra ? PLACA_Y + PLACA_H - 150 : PLACA_Y - 150
  const color = r?.tono === 'rose' ? 'var(--rose)' : 'var(--teal)'
  const transicion = { type: 'spring', stiffness: 160, damping: 20 }
  return (
    <svg viewBox="0 0 440 250" role="img" aria-label={r ? `Pestaña de ${formatear(t, 2)} mm en una ranura real de ${formatear(r.real, 2)} mm: ${r.etiqueta}.` : 'Ilustración del ensamble'}>
      <rect x="0" y={PLACA_Y} width="440" height={PLACA_H} className="s-madera" />
      <motion.rect
        initial={false}
        height={PLACA_H + 2}
        className="s-hueco"
        animate={{ attrX: CX - ancho / 2, attrY: PLACA_Y - 1, width: ancho }}
        transition={transicion}
      />
      <motion.rect
        initial={false}
        height={PLACA_H}
        className="s-guia"
        animate={{ attrX: CX - (w * ESCALA) / 2, attrY: PLACA_Y, width: Math.max(0, w * ESCALA) }}
        transition={transicion}
      />
      <motion.rect
        initial={false}
        height="150"
        rx="2"
        className="s-pieza"
        animate={{ attrY: yTab, attrX: CX - tab / 2, width: tab }}
        transition={transicion}
        style={{ stroke: color, strokeWidth: 2 }}
      />
      <text x="16" y="236" className="s-texto-chico">
        Línea punteada: lo que dibujaste. Hueco oscuro: lo que corta el láser.
      </text>
    </svg>
  )
}

export default function SimuladorEnsamble() {
  const [w, setW] = useState(2.65)
  const [t, setT] = useState('2.85')
  const [k, setK] = useState('0.2')
  const idRango = useId()

  const tn = leerNumero(t)
  const kn = leerNumero(k)
  const r = evaluarEnsamble({ w, t: tn, k: kn })
  const min = 1.5
  const max = 4

  return (
    <Herramienta
      id="simulador-ensamble"
      titulo="Simulador de ensamble"
      descripcion="Mueve el ancho dibujado de la ranura y mira si la pestaña entra. La holgura es el ancho real de la ranura menos el espesor."
    >
      <div className="campos">
        <Campo etiqueta="Espesor real (t)" valor={t} alCambiar={setT} />
        <Campo etiqueta="Kerf total (k)" valor={k} alCambiar={setK} />
      </div>
      <div className="field">
        <label htmlFor={idRango}>
          Ancho dibujado de la ranura (w): <strong className="teal">{formatear(w, 2)} mm</strong>
        </label>
        <input
          id={idRango}
          type="range"
          min={min}
          max={max}
          step="0.01"
          value={w}
          onChange={(e) => setW(Number(e.target.value))}
          aria-valuetext={`${formatear(w, 2)} milímetros`}
        />
      </div>
      <figure className="diagrama ensamble-dibujo">
        <Ilustracion w={w} t={Number.isFinite(tn) ? tn : 0} k={Number.isFinite(kn) ? kn : 0} r={r} />
      </figure>
      {!r && [t, k].every(escrito) && <Mensaje tono="amber">{MENSAJE_INVALIDO}</Mensaje>}
      <div className="resultados" aria-live="polite">
        <Resultado etiqueta="Ranura real (w + k)" valor={r ? formatearFijo(r.real, 2) : '—'} />
        <Resultado etiqueta="Holgura" valor={r ? formatearFijo(r.holgura, 2) : '—'} />
        <Resultado etiqueta="Resultado" valor={r ? r.etiqueta : '—'} unidad="" destacado tono={r?.tono} />
      </div>
      {r && <p className="ensamble-detalle">{r.detalle}</p>}
      <p className="nota-prueba">
        Los límites entre floja, justa y a presión son aproximados para MDF. Tu prueba de ensamble manda.
      </p>
    </Herramienta>
  )
}
