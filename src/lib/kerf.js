import { redondear } from './numeros.js'

export const KERF_MAXIMO_RAZONABLE = 0.6

export const MENSAJES_KERF = {
  medidaMayor: 'Tu medida no puede ser igual o mayor que el largo dibujado. Revisa el vernier.',
  huecoInvalido: 'El hueco tiene que ser mayor que cero. Revisa el vernier.',
  kerfGrande: 'Es un kerf muy grande para MDF de 3 mm. Revisa foco, velocidad o la medición.',
  piezas: 'El número de piezas tiene que ser un entero, de 1 en adelante.',
}

function resultado(kerf) {
  const avisos = kerf > KERF_MAXIMO_RAZONABLE ? [MENSAJES_KERF.kerfGrande] : []
  return { ok: true, kerf: redondear(kerf, 6), porLado: redondear(kerf / 2, 6), avisos }
}

// Modo "piezas juntas": se juntan las n piezas y se mide su largo total M.
// Cada pieza pierde un kerf completo (medio por lado), así que kerf = (L − M) / n.
export function kerfPiezasJuntas({ L, n, M }) {
  if (![L, n, M].every(Number.isFinite) || L <= 0 || M <= 0) return null
  if (!Number.isInteger(n) || n < 1) return { ok: false, error: MENSAJES_KERF.piezas }
  if (M >= L) return { ok: false, error: MENSAJES_KERF.medidaMayor }
  return resultado((L - M) / n)
}

// Modo "hueco en el marco": las n piezas regresan al marco y se mide el hueco g.
// El marco también se agranda, así que el hueco vale n + 1 kerfs.
export function kerfHuecoMarco({ n, g }) {
  if (![n, g].every(Number.isFinite)) return null
  if (!Number.isInteger(n) || n < 1) return { ok: false, error: MENSAJES_KERF.piezas }
  if (g <= 0) return { ok: false, error: MENSAJES_KERF.huecoInvalido }
  return resultado(g / (n + 1))
}
