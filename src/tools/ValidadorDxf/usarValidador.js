import { useEffect, useRef, useState } from 'react'

// Corre la validación en un Web Worker; si el navegador no lo permite, en el hilo principal.
export function useValidador(texto, opciones) {
  const [estado, setEstado] = useState({ cargando: false, resultado: null })
  const worker = useRef(null)
  const turno = useRef(0)
  const clave = JSON.stringify(opciones)

  // Respaldo sin Worker: el validador se carga aparte para no inflar el sitio.
  const enHiloPrincipal = async (texto, opciones, id) => {
    const [{ validarDxf }, { resultadoParaVista }] = await Promise.all([import('../../lib/dxf/validar.js'), import('./vista.js')])
    const r = resultadoParaVista(validarDxf(texto, opciones))
    if (id === turno.current) setEstado({ cargando: false, resultado: r })
  }

  useEffect(() => {
    try {
      worker.current = new Worker(new URL('./validador.worker.js', import.meta.url), { type: 'module' })
    } catch {
      worker.current = null
    }
    return () => worker.current?.terminate()
  }, [])

  useEffect(() => {
    if (texto == null) {
      setEstado({ cargando: false, resultado: null })
      return
    }
    const id = ++turno.current
    setEstado((e) => ({ ...e, cargando: true }))
    const espera = setTimeout(() => {
      const w = worker.current
      if (w) {
        w.onmessage = ({ data }) => {
          if (data.id === turno.current) setEstado({ cargando: false, resultado: data.resultado })
        }
        w.onerror = () => enHiloPrincipal(texto, opciones, id)
        w.postMessage({ id, texto, opciones })
      } else enHiloPrincipal(texto, opciones, id)
    }, 150)
    return () => clearTimeout(espera)
  }, [texto, clave])

  return estado
}
