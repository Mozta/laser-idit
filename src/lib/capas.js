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
  usadas.sort((a, b) => a.prioridad - b.prioridad || a.id - b.id)
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
    else if (c.min > c.max)
      h.push({ id: 'min-mayor', nivel: 'error', capa: c.id, mensaje: `En la capa ${c.id} la potencia mínima es mayor que la máxima.` })
    if ([c.max, c.min].some((v) => Number.isFinite(v) && v > 100))
      h.push({ id: 'fuera-rango', nivel: 'error', capa: c.id, mensaje: `En la capa ${c.id} la potencia pasa de 100 %.` })
  }

  const errores = h.filter((x) => x.nivel === 'error').length
  const avisos = h.filter((x) => x.nivel === 'aviso').length
  return { hallazgos: h, errores, avisos, listo: !errores && !avisos }
}
