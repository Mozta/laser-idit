import { useEffect, useRef, useState } from 'react'

const ERROR_CARGA = {
  hallazgos: [
    { id: '1', nivel: 'error', titulo: 'No se pudo revisar', mensaje: 'No pude cargar el revisor. Revisa tu conexión y vuelve a elegir el archivo.' },
  ],
  resumen: { estado: 'errores', texto: 'No se pudo revisar el archivo', errores: 1, avisos: 0 },
  trayectos: [],
  caja: null,
}

// Corre la validación en un Web Worker. Si el worker no existe o falla en cualquier momento,
// valida en el hilo principal (ese código se carga aparte, solo si hace falta).
export function useValidador(texto, opciones) {
  const [estado, setEstado] = useState({ cargando: false, resultado: null })
  const worker = useRef(null)
  const turno = useRef(0)
  const pendiente = useRef(null)
  const textoAnterior = useRef(null)
  const clave = JSON.stringify(opciones)

  const terminar = (id, resultado) => {
    if (id === turno.current) {
      pendiente.current = null
      setEstado({ cargando: false, resultado })
    }
  }

  const enHiloPrincipal = async ({ id, texto, opciones }) => {
    try {
      const { validarEnHiloPrincipal } = await import('./respaldo.js')
      terminar(id, validarEnHiloPrincipal(texto, opciones))
    } catch {
      terminar(id, ERROR_CARGA)
    }
  }

  useEffect(() => {
    let w = null
    const descartar = () => {
      w?.terminate()
      if (worker.current === w) worker.current = null
      // Si había un trabajo esperando respuesta, se hace en el hilo principal.
      if (pendiente.current) enHiloPrincipal(pendiente.current)
    }
    try {
      w = new Worker(new URL('./validador.worker.js', import.meta.url), { type: 'module' })
      w.onmessage = ({ data }) => terminar(data.id, data.resultado)
      w.onerror = descartar
      w.onmessageerror = descartar
      worker.current = w
    } catch {
      worker.current = null
    }
    return () => {
      w?.terminate()
      worker.current = null
    }
  }, [])

  useEffect(() => {
    if (texto == null) {
      pendiente.current = null
      textoAnterior.current = null
      setEstado({ cargando: false, resultado: null })
      return
    }
    const id = ++turno.current
    // Archivo nuevo: se borra el resultado anterior. Solo cambiaron opciones: se conserva mientras recalcula.
    const archivoNuevo = textoAnterior.current !== texto
    textoAnterior.current = texto
    setEstado((e) => ({ cargando: true, resultado: archivoNuevo ? null : e.resultado }))
    const espera = setTimeout(() => {
      const trabajo = { id, texto, opciones }
      pendiente.current = trabajo
      if (worker.current) worker.current.postMessage(trabajo)
      else enHiloPrincipal(trabajo)
    }, 150)
    return () => clearTimeout(espera)
  }, [texto, clave])

  return estado
}
