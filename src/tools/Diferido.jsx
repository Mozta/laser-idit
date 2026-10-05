import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import Cargando from './Cargando.jsx'

// Monta una herramienta pesada hasta que hace falta: cuando su lugar se acerca a la pantalla
// o cuando el navegador queda libre después de cargar la página. Así no compite con la portada.
export function crearDiferido(cargar) {
  const Componente = lazy(cargar)
  return function Diferido({ id, titulo }) {
    const [listo, setListo] = useState(false)
    const lugar = useRef(null)

    useEffect(() => {
      if (listo) return
      const activar = () => setListo(true)
      const obs = new IntersectionObserver((e) => e.some((x) => x.isIntersecting) && activar(), { rootMargin: '1200px 0px' })
      if (lugar.current) obs.observe(lugar.current)
      let idle
      const alCargar = () => {
        idle = 'requestIdleCallback' in window ? requestIdleCallback(activar, { timeout: 4000 }) : setTimeout(activar, 2000)
      }
      if (document.readyState === 'complete') alCargar()
      else window.addEventListener('load', alCargar, { once: true })
      return () => {
        obs.disconnect()
        window.removeEventListener('load', alCargar)
        if ('cancelIdleCallback' in window) cancelIdleCallback(idle)
        clearTimeout(idle)
      }
    }, [listo])

    const reservado = (
      <div ref={lugar}>
        <Cargando id={id} titulo={titulo} />
      </div>
    )
    if (!listo) return reservado
    return (
      <Suspense fallback={reservado}>
        <Componente />
      </Suspense>
    )
  }
}
