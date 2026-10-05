// Redondeo decimal sin errores de punto flotante (1.005 → 1.01, 0.1 + 0.2 → 0.3).
// Se recorre la coma en notación exponencial para no multiplicar en binario,
// y funciona igual con números muy chicos o muy grandes (1e-7, 1e22).
export function redondear(valor, decimales = 2) {
  if (!Number.isFinite(valor)) return NaN
  const signo = valor < 0 ? -1 : 1
  const [mantisa, exponente] = Math.abs(valor).toExponential().split('e')
  const recorrido = Number(`${mantisa}e${Number(exponente) + decimales}`)
  const r = Math.round(recorrido) / 10 ** decimales
  return r === 0 ? 0 : signo * r
}

// Texto sin ceros sobrantes (0.16, 79.8). Para mensajes y medidas dentro de una frase.
export function formatear(valor, decimales = 2) {
  const r = redondear(valor, decimales)
  if (Number.isNaN(r)) return '—'
  return String(r)
}

// Texto con todos los decimales (0.160, 79.80). Para los resultados de las calculadoras.
export function formatearFijo(valor, decimales = 2) {
  const r = redondear(valor, decimales)
  if (Number.isNaN(r)) return '—'
  const [entero, fraccion = ''] = String(Math.abs(r)).split('.')
  const texto = decimales > 0 ? `${entero}.${fraccion.padEnd(decimales, '0')}` : entero
  return r < 0 ? `−${texto}` : texto
}

// Convierte la entrada de un campo a número; acepta coma decimal. Vacío o basura → NaN.
export function leerNumero(texto) {
  if (typeof texto === 'number') return texto
  if (texto == null) return NaN
  const limpio = String(texto).trim().replace(',', '.')
  if (limpio === '' || !/^-?\d*\.?\d+$|^-?\d+\.$/.test(limpio)) return NaN
  return Number(limpio)
}

// ¿El campo tiene algo escrito? Sirve para avisar cuando hay datos pero no son válidos.
export const escrito = (texto) => String(texto ?? '').trim() !== ''
