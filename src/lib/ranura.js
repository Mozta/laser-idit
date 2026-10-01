import { redondear } from './numeros.js'

// Ranura para ensamble ajustado: espesor real menos kerf.
// Afuera se encoge, adentro crece: un contorno pierde k y un hueco gana k.
export function calcularRanura({ t, k, exterior, hueco }) {
  if (![t, k].every(Number.isFinite) || t <= 0 || k < 0) return null
  const r = { ranura: redondear(t - k, 6) }
  if (Number.isFinite(exterior)) r.exterior = redondear(exterior - k, 6)
  if (Number.isFinite(hueco)) r.hueco = redondear(hueco + k, 6)
  return r
}
