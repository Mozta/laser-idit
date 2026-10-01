import { useMemo, useRef } from 'react'
import { motion } from 'motion/react'
import { crearTrabajo, circulo, rectangulo } from '../../lib/trabajoCorte.js'
import { crearDibujante } from './dibujar.js'
import { useLienzo, useMenosMovimiento } from './useLienzo.js'
import './Portada.css'

const W = 760
const H = 824
const ESPERA = 1.6

const PIEZAS = [
  {
    huecos: [circulo(185, 300, 38, 40), rectangulo(318, 290, 362, 334)],
    contorno: [[120, 160], [248, 160], [248, 250], [272, 250], [272, 160], [400, 160], [400, 400], [120, 400], [120, 160]],
  },
  {
    huecos: [circulo(550, 300, 44, 40), rectangulo(500, 480, 600, 560)],
    contorno: [[440, 180], [660, 180], [660, 380], [604, 380], [604, 404], [660, 404], [660, 640], [440, 640], [440, 180]],
  },
  {
    huecos: [circulo(260, 580, 48, 6)],
    contorno: [[120, 460], [400, 460], [400, 700], [120, 700], [120, 460]],
  },
]

export function LienzoCortadora() {
  const menos = useMenosMovimiento()
  const trabajo = useMemo(() => crearTrabajo(PIEZAS, { inicio: [690, 120] }), [])
  const dibujar = useMemo(() => crearDibujante(trabajo, { W, H, lamina: [60, 100, 640, 660], rieles: [30, 730] }), [trabajo])
  const reloj = useRef(0)

  const ref = useLienzo({
    W,
    H,
    activo: !menos,
    pintar: (x, dt) => {
      reloj.current += dt
      dibujar(x, reloj.current % (trabajo.total + ESPERA), dt)
    },
    pintarEstatico: (x) => dibujar(x, trabajo.total, 0, { humo: false }),
  })

  return (
    <div className="portada-lienzo">
      <canvas
        ref={ref}
        role="img"
        aria-label="Animación: el cabezal de la cortadora, visto desde arriba, corta tres piezas en una lámina de MDF. En cada pieza corta primero los huecos y al final el contorno."
      />
    </div>
  )
}

export default function Portada() {
  return (
    <section id="inicio" className="portada" aria-labelledby="portada-titulo">
      <div className="wrap portada-rejilla">
        <motion.div
          className="portada-texto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <p className="portada-pre">IDIT · IBERO Puebla</p>
          <h1 id="portada-titulo">
            Del dibujo a la pieza, <span className="teal">sin quemar el intento</span>
          </h1>
          <p className="portada-lead">
            Lo que necesitas para cortar en las láseres del IDIT: cómo funcionan, cómo medir el kerf, cómo preparar tu
            archivo y cómo operar la máquina con seguridad.
          </p>
          <ul className="portada-datos" aria-label="Datos rápidos">
            <li>
              <strong>3</strong> cortadoras
            </li>
            <li>
              <strong>CO₂</strong> 100 W
            </li>
            <li>
              <strong>MDF</strong> 3 mm
            </li>
          </ul>
          <div className="portada-acciones">
            <a className="btn btn-primary" href="#maquinas">
              Empieza aquí
            </a>
            <a className="btn" href="#validador-dxf">
              Revisa tu DXF
            </a>
            <a className="btn" href="#kerf">
              Calcula tu kerf
            </a>
            <a className="btn" href="#usa-la-maquina">
              Paso a paso en la máquina
            </a>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
        >
          <LienzoCortadora />
        </motion.div>
      </div>
    </section>
  )
}
