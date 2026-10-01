// Tolerancia para que divisiones exactas (3.9999999…) no pierdan una pieza.
const EPS = 1e-9

export const LIMITE_JUSTO = 5

// Piezas que caben en un eje: floor((W − 2m + g) / (w + g)).
export function piezasPorEje(largo, pieza, separacion, margen) {
  const util = largo - 2 * margen + separacion
  if (pieza <= 0 || util <= 0) return 0
  return Math.max(0, Math.floor(util / (pieza + separacion) + EPS))
}

export function acomodar({ W, H, w, h, g = 3, m = 3 }) {
  if (![W, H, w, h, g, m].every(Number.isFinite) || W <= 0 || H <= 0 || w <= 0 || h <= 0 || g < 0 || m < 0) {
    return null
  }
  const normal = { columnas: piezasPorEje(W, w, g, m), filas: piezasPorEje(H, h, g, m), girada: false, pw: w, ph: h }
  const girada = { columnas: piezasPorEje(W, h, g, m), filas: piezasPorEje(H, w, g, m), girada: true, pw: h, ph: w }
  normal.total = normal.columnas * normal.filas
  girada.total = girada.columnas * girada.filas
  const mejor = girada.total > normal.total ? girada : normal
  return { normal, girada, mejor, total: mejor.total }
}

// ¿Cabe la lámina en la cama? Se prueba en ambas orientaciones y se prefiere la que deja holgura.
export function laminaEnCama(lamina, cama, limite = LIMITE_JUSTO) {
  const opciones = [
    { ancho: lamina.W, alto: lamina.H, girada: false },
    { ancho: lamina.H, alto: lamina.W, girada: true },
  ]
    .filter((o) => o.ancho <= cama.ancho && o.alto <= cama.alto)
    .map((o) => {
      const sobraX = cama.ancho - o.ancho
      const sobraY = cama.alto - o.alto
      return { ...o, sobraX, sobraY, justo: sobraX <= limite || sobraY <= limite }
    })
  if (opciones.length === 0) return { cabe: false, justo: false }
  const mejor = opciones.find((o) => !o.justo) || opciones[0]
  return { cabe: true, ...mejor }
}

export function compararCamas(lamina, maquinas, limite = LIMITE_JUSTO) {
  return maquinas.map((maq) => ({ maquina: maq, ...laminaEnCama(lamina, maq, limite) }))
}
