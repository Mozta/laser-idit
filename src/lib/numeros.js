// Redondeo decimal sin errores de punto flotante (1.005 → 1.01, 0.1 + 0.2 → 0.3).
export function redondear(valor, decimales = 2) {
  if (!Number.isFinite(valor)) return NaN
  const signo = valor < 0 ? -1 : 1
  const r = Number(Math.round(Number(`${Math.abs(valor)}e${decimales}`)) + `e-${decimales}`)
  return r === 0 ? 0 : signo * r
}

// Texto con coma de miles nunca, punto decimal siempre, sin ceros sobrantes.
export function formatear(valor, decimales = 2) {
  const r = redondear(valor, decimales)
  if (Number.isNaN(r)) return '—'
  return String(r)
}

// Convierte la entrada de un campo a número; acepta coma decimal. Vacío o basura → NaN.
export function leerNumero(texto) {
  if (typeof texto === 'number') return texto
  if (texto == null) return NaN
  const limpio = String(texto).trim().replace(',', '.')
  if (limpio === '' || !/^-?\d*\.?\d+$|^-?\d+\.$/.test(limpio)) return NaN
  return Number(limpio)
}
