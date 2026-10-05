// Lógica del panel de capas de SmartCarve: orden de trabajo y revisión de la configuración.
// objetos: [{ id, nombre, tipo: 'grabado' | 'hueco' | 'contorno', capa }]
// capas:   [{ id, prioridad, procesar, max, min, vel, heredado }]
// heredado: la capa conserva los valores de la sesión anterior y nadie los ha revisado.

const esCorte = (o) => o.tipo === 'hueco' || o.tipo === 'contorno'
const lleno = (v) => Number.isFinite(v) && v > 0

// Turnos de trabajo: las capas que se procesan, de menor a mayor prioridad.
export function ordenTrabajo(objetos, capas) {
  const porId = new Map(capas.map((c) => [c.id, c]))
  const usadas = [...new Set(objetos.map((o) => o.capa))].map((id) => porId.get(id)).filter((c) => c && c.procesar)
  const p = (c) => (Number.isFinite(c.prioridad) ? c.prioridad : Infinity)
  usadas.sort((a, b) => p(a) - p(b) || a.id - b.id)
  return usadas.map((c) => ({ capa: c.id, prioridad: c.prioridad, objetos: objetos.filter((o) => o.capa === c.id) }))
}

export function revisarCapas(objetos, capas) {
  const porId = new Map(capas.map((c) => [c.id, c]))
  const h = []
  const prio = (o) => porId.get(o.capa).prioridad

  const apagados = objetos.filter((o) => !porId.get(o.capa).procesar)
  for (const o of apagados)
    h.push({ id: 'sin-procesar', nivel: 'error', objetos: [o.id], mensaje: `«${o.nombre}» está en la capa ${o.capa}, que no se procesa: no se va a cortar.` })

  const activos = objetos.filter((o) => porId.get(o.capa).procesar)
  const usadas = [...new Set(activos.map((o) => o.capa))].map((id) => porId.get(id))

  // Sin un número de prioridad no se puede saber el orden: nada de lo demás tiene sentido.
  const sinPrioridad = usadas.filter((c) => !Number.isFinite(c.prioridad))
  for (const c of sinPrioridad)
    h.push({
      id: 'sin-prioridad',
      nivel: 'error',
      capa: c.id,
      objetos: activos.filter((o) => o.capa === c.id).map((o) => o.id),
      mensaje: `La capa ${c.id} no tiene prioridad. Escribe un número en Prior: de él depende el orden de corte.`,
    })
  if (sinPrioridad.length) {
    const errores = h.filter((x) => x.nivel === 'error').length
    return { hallazgos: h, errores, avisos: 0, listo: false }
  }

  // Grabado y corte en la misma capa comparten potencia y velocidad.
  for (const c of usadas) {
    const enCapa = activos.filter((o) => o.capa === c.id)
    if (enCapa.some((o) => o.tipo === 'grabado') && enCapa.some(esCorte))
      h.push({
        id: 'mezcla',
        nivel: 'error',
        objetos: enCapa.map((o) => o.id),
        mensaje: `En la capa ${c.id} hay grabado y corte juntos. Con la misma potencia y velocidad, o el grabado atraviesa la pieza o el corte no la separa. Ponlos en capas distintas.`,
      })
  }

  // El grabado va antes que cualquier corte.
  const grabados = activos.filter((o) => o.tipo === 'grabado')
  const cortes = activos.filter(esCorte)
  for (const g of grabados) {
    const antes = cortes.filter((c) => c.capa !== g.capa && prio(c) < prio(g))
    if (antes.length)
      h.push({
        id: 'orden-grabado',
        nivel: 'error',
        objetos: [g.id, ...antes.map((c) => c.id)],
        mensaje: `«${g.nombre}» se graba después de cortar. Si la pieza ya se soltó, el grabado sale corrido. Dale al grabado la prioridad más baja.`,
      })
  }

  // Los huecos van antes que el contorno.
  const contornos = activos.filter((o) => o.tipo === 'contorno')
  const huecos = activos.filter((o) => o.tipo === 'hueco')
  for (const k of contornos) {
    const despues = huecos.filter((x) => x.capa !== k.capa && prio(x) > prio(k))
    if (despues.length)
      h.push({
        id: 'orden-contorno',
        nivel: 'error',
        objetos: [k.id, ...despues.map((x) => x.id)],
        mensaje: `El contorno se corta antes que ${despues.map((x) => `«${x.nombre}»`).join(' y ')}. La pieza se suelta y los huecos salen desplazados.`,
      })
    const empatados = huecos.filter((x) => x.capa === k.capa || prio(x) === prio(k))
    if (empatados.length)
      h.push({
        id: 'mismo-turno',
        nivel: 'aviso',
        objetos: [k.id, ...empatados.map((x) => x.id)],
        mensaje: `El contorno comparte turno con ${empatados.map((x) => `«${x.nombre}»`).join(' y ')}: no controlas cuál va primero. Pon el contorno en una capa con prioridad mayor.`,
      })
  }

  // Dos capas en uso con la misma prioridad.
  const vistas = new Map()
  for (const c of usadas) {
    if (vistas.has(c.prioridad))
      h.push({
        id: 'prioridad-repetida',
        nivel: 'aviso',
        objetos: activos.filter((o) => o.capa === c.id || o.capa === vistas.get(c.prioridad)).map((o) => o.id),
        mensaje: `Las capas ${vistas.get(c.prioridad)} y ${c.id} tienen la misma prioridad (${c.prioridad}). Dale a cada una un número distinto.`,
      })
    else vistas.set(c.prioridad, c.id)
  }

  // Parámetros de cada capa en uso.
  for (const c of usadas) {
    if (c.heredado)
      h.push({
        id: 'heredados',
        nivel: 'aviso',
        capa: c.id,
        mensaje: `La capa ${c.id} trae los valores de la sesión anterior (${c.max} / ${c.min} / ${c.vel}). Confírmalos o cámbialos según tu prueba.`,
      })
    if (![c.max, c.min, c.vel].every(lleno))
      h.push({ id: 'sin-parametros', nivel: 'aviso', capa: c.id, mensaje: `A la capa ${c.id} le falta potencia máxima, mínima o velocidad.` })
    if (Number.isFinite(c.min) && Number.isFinite(c.max) && c.min > c.max)
      h.push({ id: 'min-mayor', nivel: 'error', capa: c.id, mensaje: `En la capa ${c.id} la potencia mínima es mayor que la máxima.` })
    if ([c.max, c.min].some((v) => Number.isFinite(v) && v > 100))
      h.push({ id: 'fuera-rango', nivel: 'error', capa: c.id, mensaje: `En la capa ${c.id} la potencia pasa de 100 %.` })
  }

  const errores = h.filter((x) => x.nivel === 'error').length
  const avisos = h.filter((x) => x.nivel === 'aviso').length
  return { hallazgos: h, errores, avisos, listo: !errores && !avisos }
}

// ---------- Modo guiado ----------

export const MISIONES = [
  { id: 'grabado', titulo: 'Grabado primero', texto: 'Pon el grabado en la capa que va primero: la de prioridad más baja.' },
  { id: 'huecos', titulo: 'Huecos después', texto: 'Pon los dos huecos en una capa que vaya después del grabado.' },
  { id: 'contorno', titulo: 'Contorno al final', texto: 'Pon el contorno en una capa que vaya después de los huecos.' },
  { id: 'parametros', titulo: 'Potencia y velocidad', texto: 'Revisa la potencia y la velocidad de cada capa que usas.' },
]

const lleno2 = (v) => Number.isFinite(v) && v > 0

// Revisa cada misión por separado. Las capas deben venir con números (prioridad, max, min, vel).
export function progresoMisiones(objetos, capas) {
  const porId = new Map(capas.map((c) => [c.id, c]))
  const capa = (o) => porId.get(o.capa)
  const g = objetos.filter((o) => o.tipo === 'grabado')
  const huecos = objetos.filter((o) => o.tipo === 'hueco')
  const k = objetos.filter((o) => o.tipo === 'contorno')
  const cortes = [...huecos, ...k]
  const activos = (lista) => lista.every((o) => capa(o).procesar)
  const capasDe = (lista) => new Set(lista.map((o) => o.capa))
  const separadas = (a, b) => [...capasDe(a)].every((id) => !capasDe(b).has(id))
  const maxP = (lista) => Math.max(...lista.map((o) => capa(o).prioridad))
  const minP = (lista) => Math.min(...lista.map((o) => capa(o).prioridad))

  const grabado = activos(g) && separadas(g, cortes) && maxP(g) < minP(cortes)
  const huecosOk = activos(huecos) && separadas(huecos, [...g, ...k]) && minP(huecos) > maxP(g)
  const contorno = activos(k) && separadas(k, [...g, ...huecos]) && minP(k) > maxP([...g, ...huecos])
  const usadas = [...capasDe(objetos)].map((id) => porId.get(id))
  const parametros =
    grabado &&
    huecosOk &&
    contorno &&
    usadas.every((c) => [c.max, c.min, c.vel].every(lleno2) && c.min <= c.max && c.max <= 100 && !c.heredado)

  const hechos = { grabado, huecos: huecosOk, contorno, parametros }
  const pasos = MISIONES.map((m) => ({ ...m, hecho: hechos[m.id] }))
  const actual = pasos.findIndex((p) => !p.hecho)
  return { pasos, actual, completo: actual === -1 }
}

// Capa que sugiere la pista para la misión dada (o null si no aplica).
export function capaSugerida(mision, objetos, capas) {
  const porId = new Map(capas.map((c) => [c.id, c]))
  const disponibles = capas.filter((c) => c.procesar && Number.isFinite(c.prioridad)).sort((a, b) => a.prioridad - b.prioridad || a.id - b.id)
  const prio = (tipo) => objetos.filter((o) => o.tipo === tipo).map((o) => porId.get(o.capa).prioridad)
  const ocupadas = (tipos) => new Set(objetos.filter((o) => tipos.includes(o.tipo)).map((o) => o.capa))

  if (mision === 'grabado') {
    const conCorte = ocupadas(['hueco', 'contorno'])
    // La de prioridad más baja que no tenga cortes; si los cortes ocupan la más baja, igual se sugiere la siguiente libre.
    return disponibles.find((c) => !conCorte.has(c.id))?.id ?? null
  }
  if (mision === 'huecos') {
    const pg = Math.max(...prio('grabado'))
    const ocup = ocupadas(['grabado', 'contorno'])
    return disponibles.find((c) => c.prioridad > pg && !ocup.has(c.id))?.id ?? null
  }
  if (mision === 'contorno') {
    const pmax = Math.max(...prio('grabado'), ...prio('hueco'))
    const ocup = ocupadas(['grabado', 'hueco'])
    return disponibles.find((c) => c.prioridad > pmax && !ocup.has(c.id))?.id ?? null
  }
  return null
}

// Llena las capas en uso con valores de referencia: grabado si la capa solo graba, corte en otro caso.
export function aplicarReferencia(objetos, capas, { corte, grabado }) {
  const usadas = new Map()
  for (const o of objetos) {
    const previo = usadas.get(o.capa)
    usadas.set(o.capa, previo === 'corte' || o.tipo !== 'grabado' ? 'corte' : 'grabado')
  }
  return capas.map((c) => {
    if (!usadas.has(c.id)) return c
    const v = usadas.get(c.id) === 'grabado' ? grabado : corte
    return { ...c, max: v.max, min: v.min, vel: v.velocidad, heredado: false }
  })
}
