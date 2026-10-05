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

const DATOS = ['CO₂ 100 W', '3 cortadoras', 'MDF 3 mm', 'SmartCarve 4.3']

const ATAJOS = [
  { id: 'kerf', titulo: 'Kerf', texto: 'Mide el pedacito que se come el láser.' },
  { id: 'validador-dxf', titulo: 'Tu archivo', texto: 'Revisa tu DXF antes de llevarlo.' },
  { id: 'usa-la-maquina', titulo: 'Paso a paso', texto: 'Cinco fases frente a la máquina.' },
  { id: 'seguridad', titulo: 'Seguridad', texto: 'Las reglas que no se negocian.' },
  { id: 'galeria', titulo: 'Galería', texto: 'Lo que ya salió de estas máquinas.' },
]

export default function Portada() {
  return (
    <>
      <section id="inicio" className="portada" aria-labelledby="portada-titulo">
        <div className="wrap portada-rejilla">
          <motion.div
            className="portada-texto"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="portada-pre kicker">IDIT · IBERO Puebla</p>
            <h1 id="portada-titulo">Del dibujo a la pieza, sin quemar el intento.</h1>
            <p className="portada-lead">
              Lo que necesitas para cortar en las láseres del IDIT: cómo funcionan, cómo medir el kerf, cómo preparar tu
              archivo y cómo operar la máquina con seguridad.
            </p>
            <div className="portada-acciones">
              <a className="btn btn-oscuro btn-flecha" href="#maquinas">
                Empieza aquí
              </a>
              <a className="btn portada-btn-linea" href="#validador-dxf">
                Revisa tu DXF
              </a>
              <a className="btn portada-btn-linea" href="#kerf">
                Calcula tu kerf
              </a>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <LienzoCortadora />
          </motion.div>
        </div>
        <div className="wrap">
          <ul className="portada-datos" aria-label="Datos rápidos">
            {DATOS.map((d) => (
              <li key={d} className="kicker">
                {d}
              </li>
            ))}
          </ul>
        </div>
      </section>
      <div className="wrap">
      <nav className="atajos" aria-label="Atajos">
        {ATAJOS.map((a, i) => (
          <motion.a
            key={a.id}
            href={`#${a.id}`}
            className="atajo"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 + i * 0.06 }}
          >
            <span className="kicker">{a.titulo}</span>
            <span>{a.texto}</span>
          </motion.a>
        ))}
      </nav>
      </div>
    </>
  )
}
