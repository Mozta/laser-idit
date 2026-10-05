import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { SECCIONES } from '../data/secciones.js'
import './Navegacion.css'

function useSeccionActiva() {
  const [activa, setActiva] = useState(null)
  useEffect(() => {
    const visibles = new Map()
    const obs = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) visibles.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0)
        let mejor = null
        let max = 0
        for (const [id, r] of visibles) if (r > max) [mejor, max] = [id, r]
        setActiva(mejor)
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: [0, 0.01, 0.5, 1] },
    )
    for (const s of SECCIONES) {
      const el = document.getElementById(s.id)
      if (el) obs.observe(el)
    }
    return () => obs.disconnect()
  }, [])
  return activa
}

export default function Navegacion() {
  const activa = useSeccionActiva()
  const [abierto, setAbierto] = useState(false)
  const [flotante, setFlotante] = useState(false)
  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, 'change', (y) => setFlotante(y > 48))

  useEffect(() => {
    if (!abierto) return
    const cerrar = (e) => e.key === 'Escape' && setAbierto(false)
    window.addEventListener('keydown', cerrar)
    return () => window.removeEventListener('keydown', cerrar)
  }, [abierto])

  return (
    <header className={`nav${flotante || abierto ? ' flotante' : ''}`}>
      <div className="nav-barra">
        <a className="nav-marca" href="#inicio" onClick={() => setAbierto(false)}>
          <svg className="nav-logo" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="2" y="2" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" />
            <circle cx="12" cy="12" r="3.5" fill="currentColor" />
          </svg>
          Corte láser <span className="nav-sub">IDIT</span>
        </a>
        <nav aria-label="Secciones" className="nav-escritorio">
          <ul>
            {SECCIONES.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} aria-current={activa === s.id ? 'location' : undefined}>
                  {s.corto}
                  {activa === s.id && <motion.span layoutId="nav-subrayado" className="nav-subrayado" />}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <a className="btn btn-oscuro nav-cta" href="#validador-dxf">
          Revisa tu DXF
        </a>
        <button
          type="button"
          className="btn btn-oscuro nav-menu"
          aria-expanded={abierto}
          aria-controls="nav-movil"
          onClick={() => setAbierto((v) => !v)}
        >
          {abierto ? 'Cerrar' : 'Menú'}
        </button>
      </div>
      <AnimatePresence>
        {abierto && (
          <motion.nav
            id="nav-movil"
            aria-label="Secciones"
            className="nav-movil"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            <ul>
              {SECCIONES.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} onClick={() => setAbierto(false)} aria-current={activa === s.id ? 'location' : undefined}>
                    <span className="nav-num">{String(i + 1).padStart(2, '0')}</span> {s.corto}
                  </a>
                </li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
