// Genera los DXF sintéticos de fixtures/dxf/ para probar el validador.
// Uso: node scripts/generar-fixtures.js
import { writeFileSync, mkdirSync } from 'node:fs'
import { generarTiraDxf } from '../src/lib/tiraKerf.js'

class Dxf {
  constructor({ unidades = 4 } = {}) {
    this.g = []
    this.bloques = []
    this.p(0, 'SECTION', 2, 'HEADER', 9, '$ACADVER', 1, 'AC1015')
    if (unidades != null) this.p(9, '$INSUNITS', 70, unidades)
    this.p(0, 'ENDSEC')
    this.ent = []
  }
  p(...pares) {
    this.g.push(...pares.map(String))
    return this
  }
  e(...pares) {
    this.ent.push(...pares.map(String))
    return this
  }
  linea(x1, y1, x2, y2, capa = 'CORTE') {
    return this.e(0, 'LINE', 8, capa, 10, x1, 20, y1, 30, 0, 11, x2, 21, y2, 31, 0)
  }
  // vertices: [[x, y, bulge?], …]
  polilinea(vertices, cerrada = true, capa = 'CORTE') {
    this.e(0, 'LWPOLYLINE', 8, capa, 90, vertices.length, 70, cerrada ? 1 : 0)
    for (const [x, y, b] of vertices) {
      this.e(10, x, 20, y)
      if (b) this.e(42, b)
    }
    return this
  }
  rect(x, y, w, h, capa) {
    return this.polilinea([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], true, capa)
  }
  circulo(cx, cy, r, capa = 'CORTE') {
    return this.e(0, 'CIRCLE', 8, capa, 10, cx, 20, cy, 30, 0, 40, r)
  }
  bloque(nombre, base, fn) {
    const sub = new Dxf()
    sub.ent = []
    fn(sub)
    this.bloques.push([nombre, base, sub.ent])
    return this
  }
  insertar(nombre, x, y, { escala = 1, rotacion = 0 } = {}) {
    return this.e(0, 'INSERT', 8, 'CORTE', 2, nombre, 10, x, 20, y, 30, 0, 41, escala, 42, escala, 50, rotacion)
  }
  texto() {
    const g = [...this.g]
    if (this.bloques.length) {
      g.push('0', 'SECTION', '2', 'BLOCKS')
      for (const [nombre, [bx, by], ent] of this.bloques) {
        g.push('0', 'BLOCK', '8', '0', '2', nombre, '70', '0', '10', String(bx), '20', String(by), '30', '0', '3', nombre, ...ent, '0', 'ENDBLK')
      }
      g.push('0', 'ENDSEC')
    }
    g.push('0', 'SECTION', '2', 'ENTITIES', ...this.ent, '0', 'ENDSEC', '0', 'EOF')
    return g.join('\n') + '\n'
  }
}

const archivos = {}

// Una placa de 100 × 80 con un hueco redondo y una ranura de 2.65 × 20.
archivos['perfecto.dxf'] = new Dxf().rect(0, 0, 100, 80).circulo(30, 40, 10).rect(60, 30, 2.65, 20)

// Rectángulo de cuatro líneas; la última se queda corta 1 mm.
archivos['abierto.dxf'] = new Dxf().linea(0, 0, 80, 0).linea(80, 0, 80, 50).linea(80, 50, 0, 50).linea(0, 50, 0, 1)

// El mismo rectángulo dos veces: la copia va al revés y empieza en otra esquina.
archivos['duplicado.dxf'] = new Dxf()
  .rect(0, 0, 60, 40)
  .polilinea([[60, 40], [60, 0], [0, 0], [0, 40]])

archivos['con-cotas.dxf'] = new Dxf()
  .rect(0, 0, 60, 40)
  .e(0, 'DIMENSION', 8, 'COTAS', 2, '*D1', 10, 0, 20, -10, 30, 0, 11, 30, 21, -10, 31, 0, 70, 0, 13, 0, 23, 0, 33, 0, 14, 60, 24, 0, 34, 0)
  .e(0, 'TEXT', 8, 'COTAS', 10, 0, 20, 45, 30, 0, 40, 3, 1, '60 mm')

archivos['pulgadas.dxf'] = new Dxf({ unidades: 1 }).rect(0, 0, 4, 3)

archivos['sin-unidades.dxf'] = new Dxf({ unidades: null }).rect(0, 0, 100, 80)

// Gota cerrada con una spline cúbica (empieza y termina en el mismo punto).
archivos['spline.dxf'] = (() => {
  const d = new Dxf()
  const ctrl = [[0, 0], [60, -20], [80, 40], [20, 70], [-30, 40], [0, 0]]
  const nudos = [0, 0, 0, 0, 1, 2, 3, 3, 3, 3]
  d.e(0, 'SPLINE', 8, 'CORTE', 70, 8, 71, 3, 72, nudos.length, 73, ctrl.length)
  for (const k of nudos) d.e(40, k)
  for (const [x, y] of ctrl) d.e(10, x, 20, y, 30, 0)
  return d
})()

// Dos piezas a 1 mm.
archivos['piezas-juntas.dxf'] = new Dxf().rect(0, 0, 50, 30).rect(51, 0, 50, 30)

archivos['grande.dxf'] = new Dxf().rect(0, 0, 700, 300)

// Un rectángulo en bloque, insertado tres veces: normal, girado 90° y al doble de tamaño.
archivos['bloques.dxf'] = new Dxf()
  .bloque('PIEZA', [10, 10], (b) => b.rect(10, 10, 40, 20))
  .insertar('PIEZA', 0, 0)
  .insertar('PIEZA', 100, 0, { rotacion: 90 })
  .insertar('PIEZA', 150, 0, { escala: 2 })

// Ranura con puntas redondas (bulges) de 60 × 20 con un óvalo adentro.
archivos['bulge.dxf'] = new Dxf()
  .polilinea([[10, 0, 0], [50, 0, 1], [50, 20, 0], [10, 20, 1]])
  .e(0, 'ELLIPSE', 8, 'CORTE', 10, 30, 20, 10, 30, 0, 11, 12, 21, 0, 31, 0, 40, 0.4, 41, 0, 42, 6.283185307179586)

// Dos rectángulos cerrados que comparten un lado completo: ese lado se corta dos veces.
archivos['lado-compartido.dxf'] = new Dxf().rect(0, 0, 40, 30).rect(40, 0, 40, 30)

// Un rectángulo encima de otro, recorrido: el lado común se encima solo en parte.
archivos['encimado-parcial.dxf'] = new Dxf().rect(0, 0, 50, 20).rect(20, 20, 50, 20)

// Placa con dos muescas en el borde para la revisión de ranuras (espesor 2.85, kerf 0.2 → 2.65).
archivos['muescas.dxf'] = new Dxf().polilinea([
  [0, 0], [100, 0], [100, 60],
  [70, 60], [70, 45], [67.35, 45], [67.35, 60],
  [32.65, 60], [32.65, 45], [30, 45], [30, 60],
  [0, 60],
])

mkdirSync('fixtures/dxf', { recursive: true })
for (const [nombre, d] of Object.entries(archivos)) writeFileSync(`fixtures/dxf/${nombre}`, d.texto())
for (const marco of [false, true]) {
  const { texto } = generarTiraDxf({ L: 100, n: 10, a: 20, marco, m: 10 })
  writeFileSync(`fixtures/dxf/tira-kerf${marco ? '-marco' : ''}.dxf`, texto)
}
// Un binario simulado: encabezado de DXF binario seguido de bytes.
writeFileSync('fixtures/dxf/binario.dxf', Buffer.concat([Buffer.from('AutoCAD Binary DXF\r\n\x1a\x00'), Buffer.from([0, 1, 2, 3, 255])]))
// Algunos fixtures se publican como ejemplos para probar el validador desde el sitio.
mkdirSync('public/dxf/ejemplos', { recursive: true })
for (const nombre of ['abierto.dxf', 'duplicado.dxf', 'con-cotas.dxf', 'piezas-juntas.dxf']) {
  writeFileSync(`public/dxf/ejemplos/${nombre}`, archivos[nombre].texto())
}
console.log(`${Object.keys(archivos).length + 3} fixtures en fixtures/dxf/ y 4 ejemplos en public/dxf/ejemplos/`)
