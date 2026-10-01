// Plan de un trabajo de corte: recorridos (travel) y cortes (cut) con sus tiempos.
// Basado en docs/referencia/portada-animacion.html.

export function longitud(p) {
  let s = 0
  for (let i = 1; i < p.length; i++) s += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1])
  return s
}

// Punto a una fracción f del recorrido p, con el índice del segmento.
export function puntoEn(p, f) {
  const meta = longitud(p) * f
  let acc = 0
  for (let i = 1; i < p.length; i++) {
    const s = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1])
    if (acc + s >= meta) {
      const u = s ? (meta - acc) / s : 0
      return { pt: [p[i - 1][0] + (p[i][0] - p[i - 1][0]) * u, p[i - 1][1] + (p[i][1] - p[i - 1][1]) * u], i }
    }
    acc += s
  }
  return { pt: p[p.length - 1], i: p.length - 1 }
}

export function circulo(cx, cy, r, n) {
  const p = []
  for (let i = 0; i <= n; i++) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n
    p.push([cx + r * Math.cos(a), cy + r * Math.sin(a)])
  }
  return p
}

export function rectangulo(a, b, c, d) {
  return [[a, b], [c, b], [c, d], [a, d], [a, b]]
}

// orden: 'correcto' (huecos → contorno) o 'contorno' (contorno → huecos).
export function crearTrabajo(piezas, { inicio = [0, 0], orden = 'correcto', vCorte = 230, vViaje = 650 } = {}) {
  const ops = []
  let pos = inicio
  const agregar = (tipo, pts, pieza, extra = {}) => {
    const L = longitud(pts)
    ops.push({ tipo, pts, pieza, L, d: L / (tipo === 'corte' ? vCorte : vViaje), ...extra })
  }
  piezas.forEach((pz, pi) => {
    const huecos = pz.huecos.map((h) => ({ pts: h, rol: 'hueco' }))
    const contorno = { pts: pz.contorno, rol: 'contorno' }
    const secuencia = orden === 'contorno' ? [contorno, ...huecos] : [...huecos, contorno]
    for (const s of secuencia) {
      agregar('viaje', [pos, s.pts[0]], pi)
      agregar('corte', s.pts, pi, { rol: s.rol })
      pos = s.pts[s.pts.length - 1]
    }
  })
  agregar('viaje', [pos, inicio], -1)
  let t = 0
  for (const o of ops) {
    o.t0 = t
    t += o.d
    o.t1 = t
  }
  return { piezas, ops, total: t, inicio, orden }
}

// Momento en que se cierra el contorno de cada pieza.
export function finContornos(trabajo) {
  return trabajo.piezas.map((_, pi) => trabajo.ops.find((o) => o.pieza === pi && o.rol === 'contorno').t1)
}
