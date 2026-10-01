// Solo lo que la interfaz necesita: así el mensaje del worker es ligero y sin referencias circulares.
export function resultadoParaVista(r) {
  return {
    resumen: r.resumen,
    caja: r.caja,
    hallazgos: r.hallazgos,
    trayectos: r.trayectos.map((t) => ({ id: t.id, pts: t.pts, capa: t.capa, color: t.color, cerrado: t.cerrado })),
  }
}

// Reduce puntos para dibujar: a la escala de la vista no se ven detalles menores a `paso`.
export function puntosSvg(pts, paso) {
  let s = ''
  let ult = null
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i]
    if (ult && i < pts.length - 1 && Math.abs(p[0] - ult[0]) < paso && Math.abs(p[1] - ult[1]) < paso) continue
    s += `${Math.round(p[0] * 1000) / 1000},${Math.round(-p[1] * 1000) / 1000} `
    ult = p
  }
  return s
}
