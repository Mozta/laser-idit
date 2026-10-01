// Genera la tira de prueba de kerf como DXF ASCII R12 en milímetros.
// Las aristas compartidas entre piezas se dibujan una sola vez.

function num(v) {
  return String(Math.round(v * 1e6) / 1e6)
}

export function lineasTira({ L = 100, n = 10, a = 20, marco = false, m = 10 }) {
  const ox = marco ? m : 0
  const oy = marco ? m : 0
  const lineas = [
    [ox, oy, ox + L, oy],
    [ox, oy + a, ox + L, oy + a],
  ]
  for (let i = 0; i <= n; i++) {
    const x = ox + (L * i) / n
    lineas.push([x, oy, x, oy + a])
  }
  if (marco) {
    const W = L + 2 * m
    const H = a + 2 * m
    lineas.push([0, 0, W, 0], [W, 0, W, H], [W, H, 0, H], [0, H, 0, 0])
  }
  return lineas
}

export function cajaLineas(lineas) {
  const xs = lineas.flatMap((l) => [l[0], l[2]])
  const ys = lineas.flatMap((l) => [l[1], l[3]])
  const minX = Math.min(...xs)
  const minY = Math.min(...ys)
  const maxX = Math.max(...xs)
  const maxY = Math.max(...ys)
  return { minX, minY, maxX, maxY, ancho: maxX - minX, alto: maxY - minY }
}

export function nombreTira({ L = 100, n = 10, marco = false }) {
  return `prueba-kerf-${num(L)}mm-${n}piezas${marco ? '-marco' : ''}.dxf`
}

export function validarOpcionesTira({ L, n, a, marco, m }) {
  if (![L, n, a].every(Number.isFinite)) return 'Escribe largo, número de piezas y alto.'
  if (L <= 0 || a <= 0) return 'El largo y el alto tienen que ser mayores que cero.'
  if (!Number.isInteger(n) || n < 2 || n > 50) return 'Usa entre 2 y 50 piezas, en número entero.'
  if (marco && (!Number.isFinite(m) || m <= 0)) return 'El margen del marco tiene que ser mayor que cero.'
  return null
}

export function generarTiraDxf(opciones) {
  const lineas = lineasTira(opciones)
  const caja = cajaLineas(lineas)
  const g = []
  const par = (codigo, valor) => g.push(String(codigo), String(valor))

  par(0, 'SECTION')
  par(2, 'HEADER')
  par(9, '$ACADVER')
  par(1, 'AC1009')
  par(9, '$INSUNITS')
  par(70, 4)
  par(9, '$EXTMIN')
  par(10, num(caja.minX))
  par(20, num(caja.minY))
  par(30, 0)
  par(9, '$EXTMAX')
  par(10, num(caja.maxX))
  par(20, num(caja.maxY))
  par(30, 0)
  par(0, 'ENDSEC')

  par(0, 'SECTION')
  par(2, 'TABLES')
  par(0, 'TABLE')
  par(2, 'LAYER')
  par(70, 1)
  par(0, 'LAYER')
  par(2, 'CORTE')
  par(70, 0)
  par(62, 1)
  par(6, 'CONTINUOUS')
  par(0, 'ENDTAB')
  par(0, 'ENDSEC')

  par(0, 'SECTION')
  par(2, 'ENTITIES')
  for (const [x1, y1, x2, y2] of lineas) {
    par(0, 'LINE')
    par(8, 'CORTE')
    par(62, 1)
    par(10, num(x1))
    par(20, num(y1))
    par(30, 0)
    par(11, num(x2))
    par(21, num(y2))
    par(31, 0)
  }
  par(0, 'ENDSEC')
  par(0, 'EOF')

  return { texto: g.join('\n') + '\n', lineas, caja, nombre: nombreTira(opciones) }
}
