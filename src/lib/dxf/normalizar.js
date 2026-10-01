import { TOL_CUERDA, distancia, puntosArco, puntosBulge, longitud, caja } from './geometria.js'

export const TIPOS_TEXTO = ['DIMENSION', 'TEXT', 'MTEXT', 'LEADER', 'MULTILEADER', 'MLEADER', 'ATTDEF', 'ATTRIB']
export const TIPOS_SOBRANTES = ['HATCH', 'POINT', 'IMAGE', 'SOLID', 'WIPEOUT', '3DFACE', 'OLE2FRAME', 'XLINE', 'RAY']
const TIPOS_GEOMETRIA = ['LINE', 'ARC', 'CIRCLE', 'LWPOLYLINE', 'POLYLINE', 'ELLIPSE', 'SPLINE', 'INSERT']
const MAX_ANIDADO = 8

// ---------- transformaciones afines (a b c d e f): x' = a x + c y + e, y' = b x + d y + f ----------
function componer(m, n) {
  return [
    m[0] * n[0] + m[2] * n[1],
    m[1] * n[0] + m[3] * n[1],
    m[0] * n[2] + m[2] * n[3],
    m[1] * n[2] + m[3] * n[3],
    m[0] * n[4] + m[2] * n[5] + m[4],
    m[1] * n[4] + m[3] * n[5] + m[5],
  ]
}

function aplicar(m, [x, y]) {
  return [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]]
}

// Una extrusión con Z negativa refleja el eje X del sistema de la entidad.
function espejo(e) {
  return (e.extrusionDirectionZ ?? e.extrusionDirection?.z ?? 1) < 0
}

const ESPEJO_X = [-1, 0, 0, 1, 0, 0]

// ---------- discretización por tipo ----------

function verticesPolilinea(vs, cerrada, tol) {
  const pts = []
  const n = vs.length
  const tramos = cerrada ? n : n - 1
  for (let i = 0; i < tramos; i++) {
    const a = [vs[i].x, vs[i].y]
    const b = [vs[(i + 1) % n].x, vs[(i + 1) % n].y]
    const seg = vs[i].bulge ? puntosBulge(a, b, vs[i].bulge, tol) : [a, b]
    if (pts.length) seg.shift()
    pts.push(...seg)
  }
  if (n === 1) pts.push([vs[0].x, vs[0].y])
  return pts
}

function puntosElipse(e, tol) {
  const [cx, cy] = [e.center.x, e.center.y]
  const mx = e.majorAxisEndPoint.x
  const my = e.majorAxisEndPoint.y
  const sentido = espejo(e) ? -1 : 1
  const nx = -my * e.axisRatio * sentido
  const ny = mx * e.axisRatio * sentido
  let t0 = e.startAngle ?? 0
  let t1 = e.endAngle ?? 2 * Math.PI
  if (t1 <= t0) t1 += 2 * Math.PI
  const r = Math.hypot(mx, my)
  const n = Math.max(8, Math.ceil(((t1 - t0) / (2 * Math.acos(Math.max(-1, 1 - tol / Math.max(r, tol))))) * 1.2))
  const pts = []
  for (let i = 0; i <= Math.min(n, 4096); i++) {
    const t = t0 + ((t1 - t0) * i) / Math.min(n, 4096)
    pts.push([cx + mx * Math.cos(t) + nx * Math.sin(t), cy + my * Math.cos(t) + ny * Math.sin(t)])
  }
  return pts
}

// Evaluación de NURBS por de Boor.
function deBoor(t, grado, ctrl, nudos, pesos) {
  const n = ctrl.length - 1
  let k = grado
  while (k < n && t >= nudos[k + 1]) k++
  const d = []
  for (let j = 0; j <= grado; j++) {
    const p = ctrl[j + k - grado]
    const w = pesos ? pesos[j + k - grado] : 1
    d.push([p[0] * w, p[1] * w, w])
  }
  for (let r = 1; r <= grado; r++)
    for (let j = grado; j >= r; j--) {
      const i = j + k - grado
      const den = nudos[i + grado - r + 1] - nudos[i]
      const a = den ? (t - nudos[i]) / den : 0
      d[j] = [0, 1, 2].map((c) => (1 - a) * d[j - 1][c] + a * d[j][c])
    }
  return [d[grado][0] / d[grado][2], d[grado][1] / d[grado][2]]
}

function puntosSpline(e, tol) {
  const ctrl = (e.controlPoints || []).map((p) => [p.x, p.y])
  const grado = e.degreeOfSplineCurve || 3
  const nudos = e.knotValues || []
  if (ctrl.length > grado && nudos.length === ctrl.length + grado + 1) {
    const pesos = e.weights && e.weights.length === ctrl.length ? e.weights : null
    const t0 = nudos[grado]
    const t1 = nudos[ctrl.length]
    const evaluar = (t) => deBoor(Math.min(t, t1 - 1e-12 * Math.abs(t1 || 1)), grado, ctrl, nudos, pesos)
    // Subdivisión adaptativa por tramo de nudos hasta que la cuerda quede a tol.
    const pts = [evaluar(t0)]
    const tramos = []
    for (let i = grado; i < ctrl.length; i++) if (nudos[i + 1] > nudos[i]) tramos.push([nudos[i], nudos[i + 1]])
    const dividir = (ta, tb, pa, pb, prof) => {
      const tm = (ta + tb) / 2
      const pm = evaluar(tm)
      const q1 = evaluar(ta + (tb - ta) / 4)
      const q3 = evaluar(ta + (3 * (tb - ta)) / 4)
      const medio = [(pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2]
      const err = Math.max(distancia(pm, medio), distancia(q1, [(pa[0] + pm[0]) / 2, (pa[1] + pm[1]) / 2]), distancia(q3, [(pm[0] + pb[0]) / 2, (pm[1] + pb[1]) / 2]))
      if (prof < 14 && err > tol) {
        dividir(ta, tm, pa, pm, prof + 1)
        dividir(tm, tb, pm, pb, prof + 1)
      } else pts.push(pb)
    }
    for (const [a, b] of tramos) dividir(a, b, evaluar(a), b === t1 ? deBoor(t1 - 1e-9 * Math.max(1, Math.abs(t1)), grado, ctrl, nudos, pesos) : evaluar(b), 0)
    if (ctrl.length && (e.closed || (e.periodic ?? false))) pts.push(pts[0])
    return pts
  }
  // Solo puntos de ajuste: aproximación con una curva Catmull-Rom que pasa por ellos.
  const fit = (e.fitPoints || []).map((p) => [p.x, p.y])
  if (fit.length < 2) return ctrl.length ? ctrl : fit
  const pts = [fit[0]]
  for (let i = 0; i < fit.length - 1; i++) {
    const p0 = fit[Math.max(0, i - 1)]
    const p1 = fit[i]
    const p2 = fit[i + 1]
    const p3 = fit[Math.min(fit.length - 1, i + 2)]
    const n = Math.max(4, Math.ceil(distancia(p1, p2) / 0.5))
    for (let s = 1; s <= n; s++) {
      const t = s / n
      const t2 = t * t
      const t3 = t2 * t
      pts.push([0, 1].map((c) => 0.5 * (2 * p1[c] + (-p0[c] + p2[c]) * t + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * t3)))
    }
  }
  return pts
}

// Puntos en el sistema de la entidad (antes de bloques). Regresa null si el tipo no es geometría.
function puntosEntidad(e, tol) {
  switch (e.type) {
    case 'LINE':
      return { pts: e.vertices.map((v) => [v.x, v.y]), cerrada: false }
    case 'ARC': {
      let a0 = e.startAngle
      let a1 = e.endAngle
      if (a1 <= a0) a1 += 2 * Math.PI
      return { pts: puntosArco(e.center.x, e.center.y, e.radius, a0, a1 - a0, tol), cerrada: false }
    }
    case 'CIRCLE': {
      const pts = puntosArco(e.center.x, e.center.y, e.radius, 0, 2 * Math.PI, tol)
      pts[pts.length - 1] = pts[0]
      return { pts, cerrada: true }
    }
    case 'LWPOLYLINE':
    case 'POLYLINE': {
      if (e.is3dPolygonMesh || e.isPolyfaceMesh) return null
      const vs = (e.vertices || []).filter((v) => !v.splineControlPoint)
      if (!vs.length) return null
      const pts = verticesPolilinea(vs, !!e.shape, tol)
      return { pts, cerrada: !!e.shape }
    }
    case 'ELLIPSE': {
      const pts = puntosElipse(e, tol)
      const completa = Math.abs((e.endAngle ?? 2 * Math.PI) - (e.startAngle ?? 0) - 2 * Math.PI) < 1e-6
      if (completa) pts[pts.length - 1] = pts[0]
      return { pts, cerrada: completa, yaReflejada: true }
    }
    case 'SPLINE':
      return { pts: puntosSpline(e, tol), cerrada: !!e.closed }
    default:
      return null
  }
}

// Segmentos rectos tal como vienen en el archivo (para contar segmentos diminutos).
function segmentosRectos(e) {
  if (e.type === 'LINE') return [distancia([e.vertices[0].x, e.vertices[0].y], [e.vertices[1].x, e.vertices[1].y])]
  if (e.type === 'LWPOLYLINE' || e.type === 'POLYLINE') {
    const vs = e.vertices || []
    const r = []
    const tramos = e.shape ? vs.length : vs.length - 1
    for (let i = 0; i < tramos; i++) {
      if (vs[i].bulge) continue
      const b = vs[(i + 1) % vs.length]
      r.push(Math.hypot(b.x - vs[i].x, b.y - vs[i].y))
    }
    return r
  }
  return []
}

function colorDe(e, capas, heredado) {
  const ci = e.colorIndex
  if (ci === 0 && heredado != null) return heredado // BYBLOCK
  if (ci != null && ci !== 256 && ci > 0) return ci
  return capas[e.layer]?.colorIndex ?? 7
}

/**
 * Convierte las entidades del DXF a trayectos en mm.
 * Cada trayecto: { id, tipo, capa, color, pts, cerrado, longitud, caja, recto, segmentos }.
 */
export function normalizar(dxf, { tol = TOL_CUERDA, tolUnion = 0.01, escala = 1 } = {}) {
  const capas = dxf.tables?.layer?.layers || {}
  const bloques = dxf.blocks || {}
  const trayectos = []
  const ignoradas = []
  const problemas = { bloquesFaltantes: new Set(), anidadoProfundo: false }
  let tiposPorCapa = {}

  const registrarCapa = (capa) => {
    tiposPorCapa[capa] = (tiposPorCapa[capa] || 0) + 1
  }

  function recorrer(entidades, m, capaPadre, colorPadre, prof, origen) {
    for (const e of entidades) {
      if (e.inPaperSpace) continue
      const capa = e.layer === '0' && capaPadre ? capaPadre : e.layer ?? '0'
      const color = colorDe({ ...e, layer: capa }, capas, colorPadre)

      if (e.type === 'INSERT') {
        const b = bloques[e.name]
        if (!b) {
          problemas.bloquesFaltantes.add(e.name)
          continue
        }
        if (prof >= MAX_ANIDADO) {
          problemas.anidadoProfundo = true
          continue
        }
        const base = b.position || { x: 0, y: 0 }
        const sx = e.xScale ?? 1
        const sy = e.yScale ?? 1
        const rot = ((e.rotation ?? 0) * Math.PI) / 180
        const cols = Math.max(1, e.columnCount ?? 1)
        const filas = Math.max(1, e.rowCount ?? 1)
        for (let ci = 0; ci < cols; ci++)
          for (let fi = 0; fi < filas; fi++) {
            const dx = ci * (e.columnSpacing ?? 0)
            const dy = fi * (e.rowSpacing ?? 0)
            let local = [1, 0, 0, 1, -base.x, -base.y]
            local = componer([sx, 0, 0, sy, 0, 0], local)
            local = componer([1, 0, 0, 1, dx, dy], local)
            local = componer([Math.cos(rot), Math.sin(rot), -Math.sin(rot), Math.cos(rot), 0, 0], local)
            local = componer([1, 0, 0, 1, e.position.x, e.position.y], local)
            if (espejo(e)) local = componer(ESPEJO_X, local)
            recorrer(b.entities || [], componer(m, local), capa, color, prof + 1, origen ?? { tipo: 'INSERT', bloque: e.name })
          }
        continue
      }

      if (!TIPOS_GEOMETRIA.includes(e.type)) {
        ignoradas.push({ tipo: e.type, capa })
        registrarCapa(capa)
        continue
      }

      const r = puntosEntidad(e, tol)
      if (!r || r.pts.length < 2) continue
      let mm = m
      if (espejo(e) && !r.yaReflejada) mm = componer(m, ESPEJO_X)
      const pts = r.pts.map((p) => aplicar(mm, p))
      const cerrado = r.cerrada || (pts.length > 2 && distancia(pts[0], pts.at(-1)) <= tolUnion)
      if (cerrado && distancia(pts[0], pts.at(-1)) > 0) pts.push(pts[0])
      registrarCapa(capa)
      trayectos.push({
        id: trayectos.length,
        tipo: e.type,
        origen: origen?.tipo === 'INSERT' ? `${e.type} en bloque ${origen.bloque}` : e.type,
        capa,
        color,
        pts,
        cerrado,
        recto: e.type === 'LINE' || ((e.type === 'LWPOLYLINE' || e.type === 'POLYLINE') && !(e.vertices || []).some((v) => v.bulge)),
        segmentosOriginales: segmentosRectos(e),
        longitud: longitud(pts),
        caja: caja(pts),
      })
    }
  }

  // La tolerancia de cuerda se aplica ya en mm: se divide entre la escala de unidades.
  tol = tol / escala
  recorrer(dxf.entities || [], [escala, 0, 0, escala, 0, 0], null, null, 0, null)
  return { trayectos, ignoradas, tiposPorCapa, capas, problemas: { ...problemas, bloquesFaltantes: [...problemas.bloquesFaltantes] } }
}
