import { validarDxf } from '../../lib/dxf/validar.js'
import { resultadoParaVista } from './vista.js'

// Valida en el hilo principal cuando no hay Web Worker. Nunca lanza.
export function validarEnHiloPrincipal(texto, opciones) {
  try {
    return resultadoParaVista(validarDxf(texto, opciones))
  } catch {
    const h = [{ id: '1', nivel: 'error', titulo: 'No se pudo leer', mensaje: 'No pude leer el archivo. Exporta como DXF ASCII.' }]
    return { hallazgos: h, resumen: { estado: 'errores', texto: 'Corrige los errores antes de cortar', errores: 1, avisos: 0 }, trayectos: [], caja: null }
  }
}
