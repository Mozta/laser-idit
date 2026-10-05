import { distancia, distanciaContornos, unirCajas, cajasSeparadas, simplificar, areaConSigno } from './geometria.js'
import { TIPOS_TEXTO, TIPOS_SOBRANTES } from './normalizar.js'
import { laminaEnCama } from '../acomodo.js'
import { formatear } from '../numeros.js'

// Cada revisión recibe el contexto y regresa una lista de hallazgos:
// { id, nivel: 'error' | 'aviso' | 'info', titulo, mensaje, trayectos?: [ids], marcas?: [[x, y]] }

const f2 = (v) => formatear(v, 2)
const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`

const COLORES = { 1: 'rojo', 2: 'amarillo', 3: 'verde', 4: 'cian', 5: 'azul', 6: 'magenta', 7: 'blanco o negro', 8: 'gris oscuro', 9: 'gris claro' }
export const nombreColor = (ci) => COLORES[ci] || `color ${ci}`

const UNIDADES = { 0: 'sin unidades', 1: 'pulgadas', 2: 'pies', 4: 'milímetros', 5: 'centímetros', 6: 'metros' }

// 2. Unidades
export function revisarUnidades({ dxf, cajaTotal }) {
  const u = dxf.header?.$INSUNITS
  if (u === 4) return [{ id: '2', nivel: 'info', titulo: 'Unidades', mensaje: 'Unidades: milímetros.' }]
  if (u === 1)
    return [
      {
        id: '2a',
        nivel: 'error',
        titulo: 'Archivo en pulgadas',
        mensaje: `Está en pulgadas. Exporta en mm o escala × 25.4.${cajaTotal ? ` Convertido, tu dibujo mide ${f2(cajaTotal.ancho)} × ${f2(cajaTotal.alto)} mm.` : ''}`,
      },
    ]
  if (u == null || u === 0) {
    let mensaje = 'El archivo no dice en qué unidades está. SmartCarve lo leerá como milímetros.'
    if (cajaTotal && cajaTotal.ancho < 20 && cajaTotal.alto < 20)
      mensaje += ` Tu dibujo mide ${f2(cajaTotal.ancho)} × ${f2(cajaTotal.alto)}: puede que esté en pulgadas o en centímetros.`
    else mensaje += ' Revisa que las medidas sean las que esperas.'
    return [{ id: '2b', nivel: 'aviso', titulo: 'Unidades sin declarar', mensaje }]
  }
  const nombre = UNIDADES[u] || `código ${u}`
  const conv = cajaTotal && UNIDADES[u] ? ` Convertido, tu dibujo mide ${f2(cajaTotal.ancho)} × ${f2(cajaTotal.alto)} mm.` : ''
  return [{ id: '2b', nivel: 'aviso', titulo: 'Unidades distintas a mm', mensaje: `Unidades: ${nombre}. Exporta en milímetros.${conv}` }]
}

// 3 y 3a. Tamaño contra material y camas
export function revisarTamano({ cajaTotal, opciones }) {
  if (!cajaTotal) return []
  const { ancho: A, alto: B } = cajaTotal
  const { W, H } = opciones.material
  const r = []
  const cabe = (A <= W && B <= H) || (B <= W && A <= H)
  if (!cabe)
    r.push({
      id: '3',
      nivel: 'error',
      titulo: 'No cabe en tu material',
      mensaje: `Tu dibujo mide ${f2(A)} × ${f2(B)} mm y tu material ${f2(W)} × ${f2(H)} mm.`,
    })
  const camas = opciones.maquinas.filter((q) => laminaEnCama({ W: A, H: B }, q).cabe)
  r.push({
    id: '3a',
    nivel: 'info',
    titulo: 'Tamaño',
    mensaje: `Tu dibujo mide ${f2(A)} × ${f2(B)} mm. ${
      camas.length === opciones.maquinas.length
        ? 'Cabe en las tres camas.'
        : camas.length
          ? `Cabe en: ${camas.map((q) => q.corto).join(', ')}.`
          : 'No cabe en ninguna cama.'
    }`,
    camas: camas.map((q) => q.id),
  })
  return r
}

// 4. Contornos abiertos
export function revisarAbiertos({ analisis }) {
  const n = analisis.abiertos.length
  if (!n) return []
  return [
    {
      id: '4',
      nivel: 'error',
      titulo: 'Contornos abiertos',
      mensaje: `Hay ${plural(n, 'contorno abierto', 'contornos abiertos')}: ${n === 1 ? 'esa pieza no se va a separar' : 'esas piezas no se van a separar'}. Los puntos marcados son extremos sueltos.`,
      trayectos: analisis.abiertos.flatMap((a) => a.trayectos),
      marcas: analisis.abiertos.flatMap((a) => a.sueltos),
    },
  ]
}

// ¿Dos trayectos tienen la misma geometría, incluso al revés o empezando en otro punto?
function mismaGeometria(a, b, tol) {
  if (a.pts.length !== b.pts.length || Math.abs(a.longitud - b.longitud) > tol * 4) return false
  const p = a.pts
  const q = b.pts
  const n = p.length
  const iguales = (sec) => sec.every((pt, i) => distancia(pt, p[i]) <= tol)
  if (iguales(q) || iguales([...q].reverse())) return true
  if (a.cerrado && b.cerrado) {
    const base = q.slice(0, -1)
    for (let s = 1; s < n - 1; s++) {
      const rot = base.slice(s).concat(base.slice(0, s))
      rot.push(rot[0])
      if (iguales(rot) || iguales([...rot].reverse())) return true
    }
  }
  return false
}

// Pares de trayectos con la misma geometría (el segundo repite al primero).
export function buscarDuplicados(trayectos, tol) {
  const pares = []
  const orden = [...trayectos].sort((a, b) => a.caja.minX - b.caja.minX)
  for (let i = 0; i < orden.length; i++) {
    const a = orden[i]
    for (let j = i + 1; j < orden.length && orden[j].caja.minX <= a.caja.minX + tol; j++) {
      const b = orden[j]
      if (Math.abs(a.caja.minY - b.caja.minY) > tol || Math.abs(a.caja.maxX - b.caja.maxX) > tol) continue
      if (mismaGeometria(a, b, tol)) pares.push([Math.min(a.id, b.id), Math.max(a.id, b.id)])
    }
  }
  return pares
}

// 5 y 5a. Duplicados completos y segmentos encimados
export function revisarDuplicados({ trayectos, duplicados, opciones }) {
  const tol = opciones.tolerancia
  const r = []
  const dup = duplicados.map(([, b]) => b)
  const yaDuplicado = new Set(duplicados.flatMap(([a, b]) => [`${a}-${b}`, `${b}-${a}`]))

  // Segmentos rectos colineales que se enciman (aristas compartidas dibujadas dos veces).
  const segs = []
  for (const t of trayectos) {
    if (!t.recto) continue
    for (let i = 0; i < t.pts.length - 1; i++) {
      const a = t.pts[i]
      const b = t.pts[i + 1]
      const L = distancia(a, b)
      if (L <= tol) continue
      segs.push({ t: t.id, i, a, b, L, minX: Math.min(a[0], b[0]), maxX: Math.max(a[0], b[0]), minY: Math.min(a[1], b[1]), maxY: Math.max(a[1], b[1]) })
    }
  }
  segs.sort((s, u) => s.minX - u.minX)
  const completos = new Set()
  const parciales = new Set()
  const trayParciales = new Set()
  const marcas = []
  const marcasParciales = []
  for (let i = 0; i < segs.length; i++) {
    const s = segs[i]
    const ux = (s.b[0] - s.a[0]) / s.L
    const uy = (s.b[1] - s.a[1]) / s.L
    for (let j = i + 1; j < segs.length && segs[j].minX <= s.maxX + tol; j++) {
      const u = segs[j]
      if (u.minY > s.maxY + tol || u.maxY < s.minY - tol) continue
      if (u.t === s.t && Math.abs(u.i - s.i) <= 1) continue
      if (yaDuplicado.has(`${s.t}-${u.t}`)) continue
      // Colineal: los dos extremos de u a menos de tol de la recta de s.
      const dA = Math.abs((u.a[0] - s.a[0]) * uy - (u.a[1] - s.a[1]) * ux)
      const dB = Math.abs((u.b[0] - s.a[0]) * uy - (u.b[1] - s.a[1]) * ux)
      if (dA > tol || dB > tol) continue
      const pa = (u.a[0] - s.a[0]) * ux + (u.a[1] - s.a[1]) * uy
      const pb = (u.b[0] - s.a[0]) * ux + (u.b[1] - s.a[1]) * uy
      const enc = Math.min(s.L, Math.max(pa, pb)) - Math.max(0, Math.min(pa, pb))
      if (enc <= tol) continue
      const centro = [s.a[0] + ux * (Math.max(0, Math.min(pa, pb)) + enc / 2), s.a[1] + uy * (Math.max(0, Math.min(pa, pb)) + enc / 2)]
      if (Math.abs(enc - s.L) <= tol && Math.abs(enc - u.L) <= tol) {
        completos.add(`${Math.min(s.t, u.t)}:${s.i}:${u.i}`)
        dup.push(u.t)
        marcas.push(centro)
      } else {
        parciales.add(`${Math.min(s.t, u.t)}:${s.i}:${u.i}`)
        marcasParciales.push(centro)
        trayParciales.add(s.t).add(u.t)
      }
    }
  }

  const nDup = yaDuplicado.size / 2 + completos.size
  if (nDup)
    r.push({
      id: '5',
      nivel: 'error',
      titulo: 'Líneas repetidas',
      mensaje: `${plural(nDup, 'línea repetida', 'líneas repetidas')}: ${nDup === 1 ? 'se corta dos veces y quema' : 'se cortan dos veces y queman'} el borde.`,
      trayectos: [...new Set(dup)],
      marcas,
    })
  if (parciales.size)
    r.push({
      id: '5a',
      nivel: 'aviso',
      titulo: 'Líneas encimadas en parte',
      mensaje: `${plural(parciales.size, 'línea se encima', 'líneas se enciman')} en parte con otra: ese tramo se corta dos veces y quema el borde.`,
      trayectos: [...trayParciales],
      marcas: marcasParciales,
    })
  return r
}

// 6 y 6a. Cotas, texto y elementos que la máquina no usa
export function revisarElementos({ tipos }) {
  const r = []
  const texto = TIPOS_TEXTO.filter((t) => tipos[t])
  if (texto.length) {
    const n = texto.reduce((s, t) => s + tipos[t], 0)
    r.push({
      id: '6',
      nivel: 'error',
      titulo: 'Cotas o texto',
      mensaje: `Tu archivo trae cotas o texto (${texto.map((t) => `${tipos[t]} ${t}`).join(', ')}): la máquina intentará cortarlos. Bórralos de la versión para cortar. Si el texto es para grabar, conviértelo a curvas.`,
      cantidad: n,
    })
  }
  const sobran = TIPOS_SOBRANTES.filter((t) => tipos[t])
  if (sobran.length)
    r.push({
      id: '6a',
      nivel: 'aviso',
      titulo: 'Elementos que no se usan',
      mensaje: `Elementos que la máquina no usa (${sobran.map((t) => `${tipos[t]} ${t}`).join(', ')}); bórralos.`,
    })
  return r
}

// 7. Splines
export function revisarSplines({ trayectos }) {
  const n = trayectos.filter((t) => t.tipo === 'SPLINE').length
  if (!n) return []
  return [
    {
      id: '7',
      nivel: 'aviso',
      titulo: 'Curvas spline',
      mensaje: `${plural(n, 'curva spline', 'curvas spline')}: SmartCarve ${n === 1 ? 'la' : 'las'} aproxima. Revisa la vista previa allá.`,
      trayectos: trayectos.filter((t) => t.tipo === 'SPLINE').map((t) => t.id),
    },
  ]
}

// 8. Segmentos diminutos
export function revisarDiminutos({ trayectos }) {
  const LIMITE = 0.05
  const ids = new Set()
  let n = 0
  for (const t of trayectos)
    for (const L of t.segmentosOriginales) {
      if (L < LIMITE) {
        n++
        ids.add(t.id)
      }
    }
  if (n <= 50) return []
  return [
    {
      id: '8',
      nivel: 'aviso',
      titulo: 'Segmentos diminutos',
      mensaje: `${n} segmentos de menos de ${LIMITE} mm. Muchos segmentos diminutos: el corte puede salir con tirones.`,
      trayectos: [...ids],
    },
  ]
}

function contarPiezas(contornos) {
  let piezas = 0
  let huecos = 0
  for (const k of contornos) {
    if (k.tipo === 'red') piezas += k.caras
    else if (k.profundidad % 2 === 0) piezas++
    else huecos++
  }
  return { piezas, huecos }
}

// 9. Piezas y huecos
export function revisarPiezas({ analisis }) {
  const { piezas, huecos } = contarPiezas(analisis.contornos)
  if (!piezas && !huecos) return []
  const redes = analisis.contornos.filter((k) => k.tipo === 'red').length
  return [
    {
      id: '9',
      nivel: 'info',
      titulo: 'Piezas',
      mensaje: `${plural(piezas, 'pieza', 'piezas')}, ${plural(huecos, 'hueco', 'huecos')}.${
        redes ? ' Algunas piezas comparten líneas entre sí: se contaron por las áreas que encierran.' : ''
      }`,
      piezas,
      huecos,
    },
  ]
}

// 10. Distancia entre piezas
export function revisarSeparacion({ analisis }) {
  const MIN = 3
  const ERR = 0.5
  const exteriores = analisis.contornos.filter((k) => k.profundidad === 0)
  let peor = null
  const cercanas = []
  for (let i = 0; i < exteriores.length; i++)
    for (let j = i + 1; j < exteriores.length; j++) {
      const a = exteriores[i]
      const b = exteriores[j]
      if (cajasSeparadas(a.caja, b.caja, MIN)) continue
      const d = distanciaContornos(a.pol, b.pol, MIN)
      if (d.d < MIN) {
        const par = { a, b, d: d.d, marca: [(d.pa[0] + d.pb[0]) / 2, (d.pa[1] + d.pb[1]) / 2] }
        cercanas.push(par)
        if (!peor || par.d < peor.d) peor = par
      }
    }
  if (!peor) return []
  const nivel = peor.d < ERR ? 'error' : 'aviso'
  const extra = cercanas.length > 1 ? ` Hay ${cercanas.length} pares de piezas a menos de ${MIN} mm.` : ''
  return [
    {
      id: '10',
      nivel,
      titulo: 'Piezas muy juntas',
      mensaje: `Dos piezas a ${f2(peor.d)} mm: déjales al menos ${MIN} mm.${extra}`,
      distancia: peor.d,
      trayectos: [...new Set(cercanas.flatMap((c) => [...c.a.trayectos, ...c.b.trayectos]))],
      marcas: cercanas.map((c) => c.marca),
    },
  ]
}

// 11. Ranuras (heurística)
export function revisarRanuras({ analisis, opciones }) {
  const { espesor: t, kerf: k } = opciones
  if (!Number.isFinite(t) || !Number.isFinite(k)) return []
  const objetivo = t - k
  const encontradas = []
  const enRango = (w) => w >= t - 1 && w <= t + 1

  for (const c of analisis.contornos) {
    if (c.tipo !== 'lazo') continue
    const pol = simplificar(c.pol, 1e-4)
    // Hueco rectangular: 4 esquinas en ángulo recto.
    if (c.profundidad % 2 === 1 && pol.length === 4) {
      const lados = pol.map((p, i) => distancia(p, pol[(i + 1) % 4]))
      const recto = pol.every((p, i) => {
        const a = pol[(i + 3) % 4]
        const b = pol[(i + 1) % 4]
        const v1 = [p[0] - a[0], p[1] - a[1]]
        const v2 = [b[0] - p[0], b[1] - p[1]]
        return Math.abs(v1[0] * v2[0] + v1[1] * v2[1]) / (Math.hypot(...v1) * Math.hypot(...v2)) < 0.01
      })
      const ancho = Math.min(lados[0], lados[1])
      if (recto && enRango(ancho)) encontradas.push({ tipo: 'hueco', ancho, centro: centroide(pol), trayectos: c.trayectos })
    }
    // Muesca en un contorno: tres lados en U con las dos esquinas internas cóncavas.
    if (c.profundidad % 2 === 0 && pol.length >= 6) {
      const sentido = Math.sign(areaConSigno(pol))
      const giro = (a, b, c2) => Math.sign((b[0] - a[0]) * (c2[1] - b[1]) - (b[1] - a[1]) * (c2[0] - b[0])) * sentido
      const n = pol.length
      for (let i = 0; i < n; i++) {
        const p0 = pol[i]
        const p1 = pol[(i + 1) % n]
        const p2 = pol[(i + 2) % n]
        const p3 = pol[(i + 3) % n]
        const pm = pol[(i - 1 + n) % n]
        const p4 = pol[(i + 4) % n]
        if (giro(pm, p0, p1) > 0 && giro(p0, p1, p2) < 0 && giro(p1, p2, p3) < 0 && giro(p2, p3, p4) > 0) {
          const ancho = distancia(p1, p2)
          const v1 = [p1[0] - p0[0], p1[1] - p0[1]]
          const v3 = [p3[0] - p2[0], p3[1] - p2[1]]
          const paralelas = Math.abs(v1[0] * v3[1] - v1[1] * v3[0]) / (Math.hypot(...v1) * Math.hypot(...v3)) < 0.01
          if (paralelas && enRango(ancho))
            encontradas.push({ tipo: 'muesca', ancho, centro: [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2], trayectos: c.trayectos })
        }
      }
    }
  }
  if (!encontradas.length)
    return [
      {
        id: '11',
        nivel: 'info',
        titulo: 'Ranuras',
        mensaje: `No encontré ranuras rectangulares con un ancho cercano a tu espesor (${f2(t)} mm). La detección es aproximada.`,
      },
    ]
  const anchos = [...new Set(encontradas.map((e) => formatear(e.ancho, 2)))]
  const detalle = anchos
    .map((a) => {
      const dif = Number(a) - objetivo
      const comp = Math.abs(dif) < 0.005 ? 'igual a lo esperado' : `${f2(Math.abs(dif))} mm ${dif > 0 ? 'más ancha' : 'más angosta'}`
      return `${a} mm (${comp})`
    })
    .join('; ')
  return [
    {
      id: '11',
      nivel: 'info',
      titulo: 'Ranuras',
      mensaje: `${plural(encontradas.length, 'ranura detectada', 'ranuras detectadas')}. Con espesor ${f2(t)} y kerf ${formatear(k, 3)}, esperaba ${f2(objetivo)} mm. Medidas: ${detalle}. La detección es aproximada: revisa tú las que importan.`,
      trayectos: [...new Set(encontradas.flatMap((e) => e.trayectos))],
      marcas: encontradas.map((e) => e.centro),
    },
  ]
}

function centroide(pol) {
  const n = pol.length
  return [pol.reduce((s, p) => s + p[0], 0) / n, pol.reduce((s, p) => s + p[1], 0) / n]
}

const CAPAS_ANOTACION = /(^|[^a-z])(dim|cota|annot|anota|defpoints)/i

// 12. Capas y colores
export function revisarCapas({ trayectos, norm }) {
  const capas = new Map()
  for (const t of trayectos) {
    const c = capas.get(t.capa) || { nombre: t.capa, n: 0, colores: new Set() }
    c.n++
    c.colores.add(t.color)
    capas.set(t.capa, c)
  }
  for (const i of norm.ignoradas) {
    const c = capas.get(i.capa) || { nombre: i.capa, n: 0, colores: new Set() }
    c.n++
    capas.set(i.capa, c)
  }
  if (!capas.size) return []
  const lista = [...capas.values()]
  const r = [
    {
      id: '12',
      nivel: 'info',
      titulo: 'Capas y colores',
      mensaje: lista
        .map((c) => `${c.nombre}: ${plural(c.n, 'elemento', 'elementos')}${c.colores.size ? `, ${[...c.colores].map(nombreColor).join(', ')}` : ''}`)
        .join(' · '),
      capas: lista.map((c) => ({ nombre: c.nombre, n: c.n, colores: [...c.colores] })),
    },
  ]
  const anot = lista.filter((c) => CAPAS_ANOTACION.test(c.nombre) && c.n > 0)
  if (anot.length)
    r.push({
      id: '12a',
      nivel: 'aviso',
      titulo: 'Capas de anotación',
      mensaje: `Hay elementos en capas de cotas o anotaciones (${anot.map((c) => c.nombre).join(', ')}). Bórralos de la versión para cortar.`,
      trayectos: trayectos.filter((t) => anot.some((c) => c.nombre === t.capa)).map((t) => t.id),
    })
  return r
}

// 13. Longitud y tiempo
export function revisarTiempo({ trayectos, opciones }) {
  const L = trayectos.reduce((s, t) => s + t.longitud, 0)
  if (!L) return []
  const seg = L / opciones.velocidad
  const total = Math.round(seg)
  const min = Math.floor(total / 60)
  const s = total % 60
  return [
    {
      id: '13',
      nivel: 'info',
      titulo: 'Longitud y tiempo',
      mensaje: `Longitud de corte: ${formatear(L / 1000, 2)} m. A ${f2(opciones.velocidad)} mm/s son unos ${min ? `${min} min ` : ''}${s} s de corte. No incluye los desplazamientos del cabezal entre piezas.`,
      longitud: L,
      segundos: seg,
    },
  ]
}

export function cajaDeTrayectos(trayectos) {
  return trayectos.length ? unirCajas(trayectos.map((t) => t.caja)) : null
}
