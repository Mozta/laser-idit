import { useMemo, useRef, useState } from 'react'
import { Herramienta, Segmentado } from './comun.jsx'
import { crearTrabajo, circulo, rectangulo } from '../lib/trabajoCorte.js'
import { crearDibujante } from './cortadora/dibujar.js'
import { useLienzo, useMenosMovimiento } from './cortadora/useLienzo.js'
import './OrdenCorte.css'

const W = 620
const H = 440
const INICIO = [580, 50]
const ESCENA = { W, H, lamina: [50, 80, 520, 330], rieles: [20, 600], desplazamiento: [16, 12] }

// Una placa con dos huecos y una ranura, al estilo de la portada.
const PIEZA = {
  huecos: [circulo(220, 245, 42, 40), rectangulo(330, 205, 430, 285)],
  contorno: [[130, 130], [290, 130], [290, 170], [320, 170], [320, 130], [490, 130], [490, 360], [130, 360], [130, 130]],
}

const ORDENES = [
  { valor: 'correcto', etiqueta: 'Orden correcto' },
  { valor: 'contorno', etiqueta: 'Contorno primero' },
]

const VELOCIDADES = [
  { valor: 0.5, etiqueta: '0.5×' },
  { valor: 1, etiqueta: '1×' },
  { valor: 2, etiqueta: '2×' },
]

function Lienzo({ orden, reproduciendo, velocidad, alTerminar, reinicio, estatico = false }) {
  const trabajo = useMemo(() => crearTrabajo([PIEZA], { inicio: INICIO, orden, vCorte: 180 }), [orden])
  const dibujar = useMemo(() => crearDibujante(trabajo, ESCENA), [trabajo])
  const reloj = useRef({ t: 0, clave: null })
  const clave = `${orden}-${reinicio}`
  if (reloj.current.clave !== clave) reloj.current = { t: 0, clave }

  const ref = useLienzo({
    W,
    H,
    activo: !estatico,
    pintar: (x, dt) => {
      const r = reloj.current
      if (reproduciendo) r.t = Math.min(trabajo.total, r.t + dt * velocidad)
      dibujar(x, r.t, reproduciendo ? dt : 0)
      if (r.t >= trabajo.total && reproduciendo) alTerminar?.()
    },
    pintarEstatico: (x) => dibujar(x, trabajo.total, 0, { humo: false }),
  })

  const desc =
    orden === 'correcto'
      ? 'Orden correcto: primero se cortan el círculo y el rectángulo interiores, al final el contorno. Los huecos quedan en su lugar.'
      : 'Contorno primero: la pieza se suelta, se corre unos milímetros y los huecos se cortan desplazados. El resultado sale defectuoso.'
  return (
    <div className="orden-lienzo">
      <canvas ref={ref} role="img" aria-label={desc} />
    </div>
  )
}

export default function OrdenCorte() {
  const menos = useMenosMovimiento()
  const [orden, setOrden] = useState('correcto')
  const [reproduciendo, setReproduciendo] = useState(true)
  const [velocidad, setVelocidad] = useState(1)
  const [reinicio, setReinicio] = useState(0)
  const [terminado, setTerminado] = useState(false)

  const cambiarOrden = (o) => {
    setOrden(o)
    setTerminado(false)
    setReproduciendo(true)
  }
  const repetir = () => {
    setReinicio((r) => r + 1)
    setTerminado(false)
    setReproduciendo(true)
  }

  if (menos) {
    return (
      <Herramienta id="orden-corte" titulo="¿Por qué los huecos van primero?" descripcion="Resultado de cada orden de corte.">
        <div className="orden-lado">
          <figure>
            <Lienzo orden="correcto" estatico />
            <figcaption className="teal">Huecos → contorno: todo en su lugar.</figcaption>
          </figure>
          <figure>
            <Lienzo orden="contorno" estatico />
            <figcaption className="rose">Contorno primero: los huecos salen corridos.</figcaption>
          </figure>
        </div>
      </Herramienta>
    )
  }

  return (
    <Herramienta
      id="orden-corte"
      titulo="¿Por qué los huecos van primero?"
      descripcion="Compara los dos órdenes. Cuando el contorno se cierra, la pieza queda suelta sobre la cama de panal y cualquier vibración la mueve."
    >
      <Segmentado grupo="orden" etiqueta="Orden de corte" opciones={ORDENES} valor={orden} alCambiar={cambiarOrden} />
      <figure className="diagrama" style={{ marginTop: 16 }}>
        <Lienzo
          orden={orden}
          reproduciendo={reproduciendo}
          velocidad={velocidad}
          reinicio={reinicio}
          alTerminar={() => {
            setTerminado(true)
            setReproduciendo(false)
          }}
        />
        <figcaption aria-live="polite">
          {terminado
            ? orden === 'correcto'
              ? 'Listo: los huecos quedaron donde los dibujaste.'
              : 'Resultado defectuoso: la pieza se movió y los huecos (en rosa) quedaron corridos.'
            : orden === 'correcto'
              ? 'Primero los huecos, al final el contorno.'
              : 'Primero el contorno… fíjate qué pasa con la pieza.'}
        </figcaption>
      </figure>
      <div className="orden-controles">
        {terminado ? (
          <button type="button" className="btn btn-primary" onClick={repetir}>
            Repetir
          </button>
        ) : (
          <button type="button" className="btn btn-primary" onClick={() => setReproduciendo((v) => !v)}>
            {reproduciendo ? 'Pausar' : 'Reproducir'}
          </button>
        )}
        <Segmentado grupo="vel" etiqueta="Velocidad" opciones={VELOCIDADES} valor={velocidad} alCambiar={setVelocidad} />
      </div>
    </Herramienta>
  )
}
