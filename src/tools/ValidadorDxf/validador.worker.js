import { validarDxf } from '../../lib/dxf/validar.js'
import { resultadoParaVista } from './vista.js'

self.onmessage = ({ data }) => {
  const r = validarDxf(data.texto, data.opciones)
  self.postMessage({ id: data.id, resultado: resultadoParaVista(r) })
}
