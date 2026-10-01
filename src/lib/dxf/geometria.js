// Geometría 2D mínima para el validador. Puntos como [x, y], medidas en mm.

export const TOL_CUERDA = 0.01

export function distancia(a, b) {
  return Math.hypot(b[0] - a[0], b[1] - a[1])
}

export function longitud(pts) {
  let s = 0
  for (let i = 1; i < pts.length; i++) s += distancia(pts[i - 1], pts[i])
  return s
}

export function caja(pts) {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const [x, y] of pts) {
    if (x < minX) minX = x
    if (y < minY) minY = y
    if (x > maxX) maxX = x
    if (y > maxY) maxY = y
  }
  return { minX, minY, maxX, maxY, ancho: maxX - minX, alto: maxY - minY }
}

export function unirCajas(cajas) {
  const c = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
  for (const b of cajas) {
    c.minX = Math.min(c.minX, b.minX)
    c.minY = Math.min(c.minY, b.minY)
    c.maxX = Math.max(c.maxX, b.maxX)
    c.maxY = Math.max(c.maxY, b.maxY)
  }
  return { ...c, ancho: c.maxX - c.minX, alto: c.maxY - c.minY }
}

export function cajasSeparadas(a, b, margen = 0) {
  return a.maxX + margen < b.minX || b.maxX + margen < a.minX || a.maxY + margen < b.minY || b.maxY + margen < a.minY
}

// Área con signo (positiva si el polígono va en sentido antihorario).
export function areaConSigno(pts) {
  let s = 0
  for (let i = 0, n = pts.length; i < n; i++) {
    const [x1, y1] = pts[i]
    const [x2, y2] = pts[(i + 1) % n]
    s += x1 * y2 - x2 * y1
  }
  return s / 2
}

export function puntoEnPoligono([x, y], pol) {
  let dentro = false
  for (let i = 0, j = pol.length - 1; i < pol.length; j = i++) {
    const [xi, yi] = pol[i]
    const [xj, yj] = pol[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) dentro = !dentro
  }
  return dentro
}

// Distancia de un punto a un segmento, con el parámetro de la proyección.
export function distanciaPuntoSegmento(p, a, b) {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const l2 = dx * dx + dy * dy
  let t = l2 ? ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2 : 0
  t = Math.max(0, Math.min(1, t))
  return { d: Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy), t }
}

function orientacion(a, b, c) {
  return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])
}

function seCruzan(a, b, c, d) {
  const o1 = orientacion(a, b, c)
  const o2 = orientacion(a, b, d)
  const o3 = orientacion(c, d, a)
  const o4 = orientacion(c, d, b)
  return o1 * o2 < 0 && o3 * o4 < 0
}

export function distanciaSegmentos(a, b, c, d) {
  if (seCruzan(a, b, c, d)) return 0
  return Math.min(
    distanciaPuntoSegmento(a, c, d).d,
    distanciaPuntoSegmento(b, c, d).d,
    distanciaPuntoSegmento(c, a, b).d,
    distanciaPuntoSegmento(d, a, b).d,
  )
}

// Distancia mínima entre dos contornos (cerrados). Regresa también el par de puntos más cercano.
export function distanciaContornos(p, q, limite = Infinity) {
  let mejor = { d: Infinity, pa: null, pb: null }
  const cq = caja(q)
  for (let i = 0; i < p.length - 1; i++) {
    const a = p[i]
    const b = p[i + 1]
    const cs = caja([a, b])
    if (cajasSeparadas(cs, cq, Math.min(limite, mejor.d))) continue
    for (let j = 0; j < q.length - 1; j++) {
      const c = q[j]
      const d = q[j + 1]
      const dist = distanciaSegmentos(a, b, c, d)
      if (dist < mejor.d) mejor = { d: dist, pa: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], pb: [(c[0] + d[0]) / 2, (c[1] + d[1]) / 2] }
    }
  }
  return mejor
}

// Número de segmentos para un arco de radio r y ángulo total barrido, con error de cuerda tol.
export function pasosArco(r, barrido, tol = TOL_CUERDA) {
  const ar = Math.abs(r)
  if (ar <= tol) return Math.max(2, Math.ceil(Math.abs(barrido) / (Math.PI / 4)))
  const maxPaso = 2 * Math.acos(Math.max(-1, 1 - tol / ar))
  return Math.min(4096, Math.max(2, Math.ceil(Math.abs(barrido) / maxPaso)))
}

export function puntosArco(cx, cy, r, inicio, barrido, tol = TOL_CUERDA) {
  const n = pasosArco(r, barrido, tol)
  const pts = []
  for (let i = 0; i <= n; i++) {
    const a = inicio + (barrido * i) / n
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)])
  }
  return pts
}

// Arco entre dos vértices de polilínea con bulge (tan de un cuarto del ángulo incluido).
export function puntosBulge(p1, p2, bulge, tol = TOL_CUERDA) {
  const theta = 4 * Math.atan(bulge)
  const c = distancia(p1, p2)
  if (!c || Math.abs(bulge) < 1e-12) return [p1, p2]
  const r = c / (2 * Math.sin(theta / 2))
  const a0 = Math.atan2(p2[1] - p1[1], p2[0] - p1[0])
  const ac = a0 + Math.PI / 2 - theta / 2
  const cx = p1[0] + r * Math.cos(ac)
  const cy = p1[1] + r * Math.sin(ac)
  const inicio = Math.atan2(p1[1] - cy, p1[0] - cx)
  const pts = puntosArco(cx, cy, Math.abs(r), inicio, theta, tol)
  pts[0] = p1
  pts[pts.length - 1] = p2
  return pts
}

// Quita vértices colineales o repetidos (para reconocer rectángulos y muescas).
export function simplificar(pol, tol = 1e-6) {
  const sinRepetir = pol.filter((p, i) => i === 0 || distancia(p, pol[i - 1]) > tol)
  const cerrado = sinRepetir.length > 2 && distancia(sinRepetir[0], sinRepetir.at(-1)) <= tol
  const pts = cerrado ? sinRepetir.slice(0, -1) : sinRepetir
  const fuera = []
  for (let i = 0; i < pts.length; i++) {
    const a = pts[(i - 1 + pts.length) % pts.length]
    const b = pts[i]
    const c = pts[(i + 1) % pts.length]
    const lab = distancia(a, b)
    const lbc = distancia(b, c)
    if (lab && lbc && Math.abs(orientacion(a, b, c)) / (lab * lbc) < 1e-6 && (b[0] - a[0]) * (c[0] - b[0]) + (b[1] - a[1]) * (c[1] - b[1]) > 0) continue
    fuera.push(b)
  }
  return fuera
}

// Rejilla para fusionar puntos cercanos (nodos del grafo de extremos).
export class Rejilla {
  constructor(tol) {
    this.tol = tol
    this.celda = Math.max(tol * 4, 1e-6)
    this.mapa = new Map()
    this.puntos = []
  }
  clave(x, y) {
    return `${Math.floor(x / this.celda)},${Math.floor(y / this.celda)}`
  }
  // Regresa el índice de un punto existente a menos de tol, o agrega uno nuevo.
  indice(p) {
    const cx = Math.floor(p[0] / this.celda)
    const cy = Math.floor(p[1] / this.celda)
    for (let i = -1; i <= 1; i++)
      for (let j = -1; j <= 1; j++) {
        for (const k of this.mapa.get(`${cx + i},${cy + j}`) || []) {
          if (distancia(this.puntos[k], p) <= this.tol) return k
        }
      }
    const k = this.puntos.length
    this.puntos.push(p)
    const c = this.clave(p[0], p[1])
    if (!this.mapa.has(c)) this.mapa.set(c, [])
    this.mapa.get(c).push(k)
    return k
  }
}
