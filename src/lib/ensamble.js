import { redondear } from './numeros.js'
import ajuste from '../data/ajuste.json'

export const ESTADOS = ajuste.estados

// w: ancho dibujado de la ranura; t: espesor real; k: kerf.
export function evaluarEnsamble({ w, t, k }, umbrales = ajuste.umbrales) {
  if (![w, t, k].every(Number.isFinite) || t <= 0 || k < 0 || w <= 0) return null
  const real = redondear(w + k, 6)
  const holgura = redondear(real - t, 6)
  let estado
  if (holgura > umbrales.flojaSobre) estado = 'floja'
  else if (holgura >= 0) estado = 'justa'
  else if (holgura >= umbrales.presionHasta) estado = 'presion'
  else estado = 'noEntra'
  return { real, holgura, estado, ...ESTADOS[estado] }
}
