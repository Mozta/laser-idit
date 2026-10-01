import { useEffect, useRef, useState } from 'react'
import { prepararCanvas, prefiereMenosMovimiento } from './dibujar.js'

export function useMenosMovimiento() {
  const [menos, setMenos] = useState(prefiereMenosMovimiento)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const cambio = () => setMenos(mq.matches)
    mq.addEventListener('change', cambio)
    return () => mq.removeEventListener('change', cambio)
  }, [])
  return menos
}

// Anima un lienzo con requestAnimationFrame. pintar(ctx, dt) se llama en cada cuadro.
// Se detiene cuando el lienzo sale de la pantalla o cuando activo es false.
export function useLienzo({ W, H, activo, pintar, pintarEstatico }) {
  const ref = useRef(null)
  const pintarRef = useRef(pintar)
  const estaticoRef = useRef(pintarEstatico)
  pintarRef.current = pintar
  estaticoRef.current = pintarEstatico

  useEffect(() => {
    const canvas = ref.current
    const x = prepararCanvas(canvas, W, H)
    if (!activo) {
      estaticoRef.current?.(x)
      return
    }
    let visible = true
    let id = 0
    let ultimo = null
    const cuadro = (ms) => {
      const dt = ultimo == null ? 0 : Math.min(0.05, (ms - ultimo) / 1000)
      ultimo = ms
      pintarRef.current(x, dt)
      if (visible) id = requestAnimationFrame(cuadro)
    }
    const obs = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      cancelAnimationFrame(id)
      ultimo = null
      if (visible) id = requestAnimationFrame(cuadro)
    })
    obs.observe(canvas)
    return () => {
      obs.disconnect()
      cancelAnimationFrame(id)
    }
  }, [W, H, activo])

  return ref
}
