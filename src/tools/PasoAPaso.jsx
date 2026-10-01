import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import Figura from '../components/Figura.jsx'
import pasos from '../data/pasos.json'
import './PasoAPaso.css'

const CLAVE = 'laser-idit:paso-a-paso'
const TOTAL = pasos.reduce((s, f) => s + f.pasos.length, 0)

function leer() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE)) || {}
  } catch {
    return {}
  }
}

export default function PasoAPaso() {
  const [hechos, setHechos] = useState({})
  useEffect(() => setHechos(leer()), [])

  const marcar = (clave) =>
    setHechos((h) => {
      const nuevo = { ...h, [clave]: !h[clave] }
      try {
        localStorage.setItem(CLAVE, JSON.stringify(nuevo))
      } catch {
        /* sin almacenamiento: las casillas funcionan durante la visita */
      }
      return nuevo
    })

  const reiniciar = () => {
    setHechos({})
    try {
      localStorage.removeItem(CLAVE)
    } catch {
      /* nada que borrar */
    }
  }

  const cuenta = Object.values(hechos).filter(Boolean).length

  return (
    <div className="pasos">
      <div className="pasos-barra">
        <div>
          <strong>
            {cuenta} de {TOTAL}
          </strong>{' '}
          <span className="muted">pasos marcados. Tus casillas se quedan guardadas en este navegador.</span>
        </div>
        <button type="button" className="btn" onClick={reiniciar} disabled={cuenta === 0}>
          Reiniciar casillas
        </button>
        <div className="pasos-progreso" aria-hidden="true">
          <motion.div className="pasos-relleno" animate={{ width: `${(cuenta / TOTAL) * 100}%` }} />
        </div>
      </div>

      <ol className="fases">
        {pasos.map((fase, fi) => {
          const listas = fase.pasos.filter((_, i) => hechos[`${fase.id}-${i}`]).length
          const completa = listas === fase.pasos.length
          return (
            <li key={fase.id} className={`fase${completa ? ' fase-completa' : ''}`}>
              <div className="fase-cabeza">
                <span className="fase-num" aria-hidden="true">
                  {fi + 1}
                </span>
                <h3>{fase.titulo}</h3>
                <span className="fase-cuenta">
                  {listas}/{fase.pasos.length}
                </span>
              </div>
              <ul className="fase-pasos">
                {fase.pasos.map((p, i) => {
                  const clave = `${fase.id}-${i}`
                  return (
                    <li key={clave}>
                      <label className={hechos[clave] ? 'hecho' : ''}>
                        <input type="checkbox" checked={!!hechos[clave]} onChange={() => marcar(clave)} />
                        <span>{p}</span>
                      </label>
                    </li>
                  )
                })}
              </ul>
              <div className="fase-fotos">
                {fase.imagenes.map((ruta) => (
                  <Figura key={ruta} ruta={ruta} recorte="4 / 3" />
                ))}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
