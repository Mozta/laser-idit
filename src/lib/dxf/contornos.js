import { Rejilla, caja, cajasSeparadas, distancia, distanciaPuntoSegmento, puntoEnPoligono, areaConSigno } from './geometria.js'

// Envolvente convexa (cadena monótona). Sirve de silueta para redes de líneas compartidas.
function envolvente(puntos) {
  const p = [...puntos].sort((a, b) => a[0] - b[0] || a[1] - b[1])
  if (p.length < 3) return p
  const cruz = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
  const abajo = []
  for (const q of p) {
    while (abajo.length >= 2 && cruz(abajo.at(-2), abajo.at(-1), q) <= 0) abajo.pop()
    abajo.push(q)
  }
  const arriba = []
  for (let i = p.length - 1; i >= 0; i--) {
    while (arriba.length >= 2 && cruz(arriba.at(-2), arriba.at(-1), p[i]) <= 0) arriba.pop()
    arriba.push(p[i])
  }
  const h = abajo.slice(0, -1).concat(arriba.slice(0, -1))
  h.push(h[0])
  return h
}

// ¿Cae p sobre el interior de algún trayecto distinto de `excepto`? (uniones en T)
function uneEnT(p, trayectos, excepto, tol, indice) {
  for (const t of indice(p)) {
    if (t.id === excepto) continue
    const pts = t.pts
    for (let i = 0; i < pts.length - 1; i++) {
      const { d } = distanciaPuntoSegmento(p, pts[i], pts[i + 1])
      if (d <= tol) return { t, i }
    }
  }
  return null
}

// Rejilla de celdas para buscar trayectos cerca de un punto. La celda crece con el dibujo
// (unas 256 por lado como máximo) y un trayecto que abarcaría demasiadas celdas va a una lista aparte,
// para que una línea suelta enorme no congele la revisión.
const MAX_CELDAS_POR_TRAYECTO = 4096

function indiceEspacial(trayectos, tol) {
  let ancho = 0
  if (trayectos.length) {
    const xs = trayectos.flatMap((t) => [t.caja.minX, t.caja.maxX])
    const ys = trayectos.flatMap((t) => [t.caja.minY, t.caja.maxY])
    ancho = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys))
  }
  const celda = Math.max(25, ancho / 256)
  const mapa = new Map()
  const grandes = []
  for (const t of trayectos) {
    const c = t.caja
    const x0 = Math.floor((c.minX - tol) / celda)
    const x1 = Math.floor((c.maxX + tol) / celda)
    const y0 = Math.floor((c.minY - tol) / celda)
    const y1 = Math.floor((c.maxY + tol) / celda)
    if ((x1 - x0 + 1) * (y1 - y0 + 1) > MAX_CELDAS_POR_TRAYECTO) {
      grandes.push(t)
      continue
    }
    for (let x = x0; x <= x1; x++)
      for (let y = y0; y <= y1; y++) {
        const k = `${x},${y}`
        if (!mapa.has(k)) mapa.set(k, [])
        mapa.get(k).push(t)
      }
  }
  return (p) => {
    const cerca = mapa.get(`${Math.floor(p[0] / celda)},${Math.floor(p[1] / celda)}`) || []
    return grandes.length ? cerca.concat(grandes) : cerca
  }
}

class Conjuntos {
  constructor() {
    this.padre = new Map()
  }
  raiz(x) {
    if (!this.padre.has(x)) this.padre.set(x, x)
    let r = x
    while (this.padre.get(r) !== r) r = this.padre.get(r)
    while (this.padre.get(x) !== r) {
      const s = this.padre.get(x)
      this.padre.set(x, r)
      x = s
    }
    return r
  }
  unir(a, b) {
    this.padre.set(this.raiz(a), this.raiz(b))
  }
}

/**
 * Agrupa los trayectos en contornos.
 * - Trayectos cerrados: un contorno cada uno.
 * - Trayectos abiertos: se unen por sus extremos (y en T sobre otras líneas).
 *   Un componente sin extremos sueltos es un contorno cerrado (lazo simple) o una red con líneas compartidas.
 *   Un componente con extremos sueltos es un contorno abierto.
 */
export function analizarContornos(trayectos, tol) {
  const indice = indiceEspacial(trayectos, tol)
  const porId = new Map(trayectos.map((t) => [t.id, t]))
  const rejilla = new Rejilla(tol)
  const cerrados = trayectos.filter((t) => t.cerrado)
  const abiertos = trayectos.filter((t) => !t.cerrado)
  const conj = new Conjuntos()
  const grado = new Map()
  const extremos = []
  const cortesPorTrayecto = new Map()

  for (const t of abiertos) {
    const a = rejilla.indice(t.pts[0])
    const b = rejilla.indice(t.pts.at(-1))
    grado.set(a, (grado.get(a) || 0) + 1)
    grado.set(b, (grado.get(b) || 0) + 1)
    conj.unir(`t${t.id}`, `n${a}`)
    conj.unir(`t${t.id}`, `n${b}`)
    extremos.push({ t, nodo: a, p: t.pts[0] }, { t, nodo: b, p: t.pts.at(-1) })
  }

  // Extremos de grado 1 que caen sobre otra línea: unión en T, no son sueltos.
  const sueltos = []
  const enT = new Set()
  for (const ex of extremos) {
    if (grado.get(ex.nodo) !== 1) continue
    const hit = uneEnT(ex.p, trayectos, ex.t.id, tol, indice)
    if (hit) {
      enT.add(ex.nodo)
      conj.unir(`n${ex.nodo}`, `t${hit.t.id}`)
      if (!cortesPorTrayecto.has(hit.t.id)) cortesPorTrayecto.set(hit.t.id, new Set())
      cortesPorTrayecto.get(hit.t.id).add(ex.nodo)
    } else sueltos.push(ex)
  }

  // Componentes de trayectos abiertos.
  const componentes = new Map()
  for (const t of abiertos) {
    const r = conj.raiz(`t${t.id}`)
    if (!componentes.has(r)) componentes.set(r, { trayectos: [], nodos: new Set(), sueltos: [], cerradosTocados: new Set() })
    const c = componentes.get(r)
    c.trayectos.push(t)
    c.nodos.add(rejilla.indice(t.pts[0]))
    c.nodos.add(rejilla.indice(t.pts.at(-1)))
  }
  for (const s of sueltos) componentes.get(conj.raiz(`t${s.t.id}`))?.sueltos.push(s)
  // Una línea abierta que toca en T un trayecto cerrado se une a él.
  for (const t of cerrados) {
    const r = conj.padre.has(`t${t.id}`) ? conj.raiz(`t${t.id}`) : null
    if (r && componentes.has(r)) componentes.get(r).cerradosTocados.add(t.id)
  }

  const contornos = []
  const abiertosRes = []
  const absorbidos = new Set()

  for (const c of componentes.values()) {
    if (c.sueltos.length) {
      abiertosRes.push({ trayectos: c.trayectos.map((t) => t.id), sueltos: c.sueltos.map((s) => s.p) })
      continue
    }
    const todos = [...c.trayectos]
    for (const id of c.cerradosTocados) {
      todos.push(porId.get(id))
      absorbidos.add(id)
    }
    // ¿Lazo simple? todos los nodos de grado 2 y sin uniones en T ni cerrados tocados.
    const simple = !c.cerradosTocados.size && [...c.nodos].every((n) => grado.get(n) === 2 && !enT.has(n))
    if (simple) {
      contornos.push({ tipo: 'lazo', trayectos: c.trayectos.map((t) => t.id), pol: encadenar(c.trayectos, rejilla) })
    } else {
      // Red con líneas compartidas: caras internas = E − V + 1 (Euler, red conexa y plana).
      let V = c.nodos.size
      let E = 0
      for (const t of c.trayectos) E += 1 + (cortesPorTrayecto.get(t.id)?.size || 0)
      for (const id of c.cerradosTocados) {
        const k = cortesPorTrayecto.get(id)?.size || 0
        E += Math.max(1, k)
        V += k ? 0 : 1
      }
      const pol = envolvente(todos.flatMap((t) => t.pts))
      contornos.push({ tipo: 'red', trayectos: todos.map((t) => t.id), pol, caras: Math.max(1, E - V + 1) })
    }
  }
  for (const t of cerrados) if (!absorbidos.has(t.id)) contornos.push({ tipo: 'lazo', trayectos: [t.id], pol: t.pts })

  for (const k of contornos) {
    k.caja = caja(k.pol)
    k.area = Math.abs(areaConSigno(k.pol))
  }
  asignarProfundidad(contornos)
  return { contornos, abiertos: abiertosRes }
}

// Une los trayectos de un lazo simple en un solo polígono.
function encadenar(lista, rejilla) {
  const porNodo = new Map()
  for (const t of lista) {
    for (const n of [rejilla.indice(t.pts[0]), rejilla.indice(t.pts.at(-1))]) {
      if (!porNodo.has(n)) porNodo.set(n, [])
      porNodo.get(n).push(t)
    }
  }
  const usados = new Set()
  let actual = lista[0]
  let pol = [...actual.pts]
  usados.add(actual.id)
  while (usados.size < lista.length) {
    const fin = rejilla.indice(pol.at(-1))
    const sig = (porNodo.get(fin) || []).find((t) => !usados.has(t.id))
    if (!sig) break
    const alDerecho = rejilla.indice(sig.pts[0]) === fin
    const pts = alDerecho ? sig.pts : [...sig.pts].reverse()
    pol = pol.concat(pts.slice(1))
    usados.add(sig.id)
  }
  if (distancia(pol[0], pol.at(-1)) > 0) pol.push(pol[0])
  return pol
}

// Profundidad de anidamiento: 0 = contorno exterior, 1 = hueco, 2 = pieza dentro de un hueco…
function asignarProfundidad(contornos) {
  const orden = [...contornos].sort((a, b) => b.area - a.area)
  for (const k of orden) {
    k.padre = null
    k.profundidad = 0
    const muestra = k.pol[0]
    let mejor = null
    for (const o of orden) {
      if (o === k || o.area <= k.area) continue
      if (cajasSeparadas(o.caja, k.caja)) continue
      if (puntoEnPoligono(muestra, o.pol) && (!mejor || o.area < mejor.area)) mejor = o
    }
    if (mejor) {
      k.padre = mejor
      k.profundidad = mejor.profundidad + 1
    }
  }
}
