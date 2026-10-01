import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { validarDxf } from './validar.js'
import esperado from '../../../fixtures/esperado.json'

const DIR = new URL('../../../fixtures/dxf/', import.meta.url)
const leer = (nombre) => readFileSync(new URL(nombre, DIR), 'latin1')
const ids = (r, nivel) => r.hallazgos.filter((h) => h.nivel === nivel).map((h) => h.id).sort()
const hallazgo = (r, id) => r.hallazgos.find((h) => h.id === id)

describe('fixtures del validador', () => {
  it('cada fixture tiene su resultado esperado', () => {
    const archivos = readdirSync(DIR).filter((f) => f.endsWith('.dxf')).sort()
    expect(archivos).toEqual(Object.keys(esperado.archivos).sort())
  })

  for (const [nombre, e] of Object.entries(esperado.archivos)) {
    describe(nombre, () => {
      const r = validarDxf(leer(nombre), e.opciones || {})

      if (e.errores) it(`errores: [${e.errores}]`, () => expect(ids(r, 'error')).toEqual([...e.errores].sort()))
      if (e.avisos) it(`avisos: [${e.avisos}]`, () => expect(ids(r, 'aviso')).toEqual([...e.avisos].sort()))
      if (e.incluye)
        it(`incluye: [${e.incluye}]`, () => {
          const todos = r.hallazgos.map((h) => h.id)
          for (const id of e.incluye) expect(todos).toContain(id)
        })
      if (e.piezas != null) it(`${e.piezas} piezas`, () => expect(hallazgo(r, '9').piezas).toBe(e.piezas))
      if (e.huecos != null) it(`${e.huecos} huecos`, () => expect(hallazgo(r, '9').huecos).toBe(e.huecos))
      if (e.abiertos != null)
        it(`${e.abiertos} contorno abierto`, () => expect(r.analisis.abiertos).toHaveLength(e.abiertos))
      if (e.camas) it(`cabe en ${e.camas}`, () => expect(hallazgo(r, '3a').camas).toEqual(e.camas))
      if (e.caja)
        it(`caja ${e.caja}`, () => {
          const [x0, y0, x1, y1] = e.caja
          expect(r.caja.minX).toBeCloseTo(x0, 3)
          expect(r.caja.minY).toBeCloseTo(y0, 3)
          expect(r.caja.maxX).toBeCloseTo(x1, 3)
          expect(r.caja.maxY).toBeCloseTo(y1, 3)
        })
      if (e.ranuras != null)
        it(`${e.ranuras} ranuras detectadas`, () => expect(hallazgo(r, '11').marcas).toHaveLength(e.ranuras))
    })
  }
})

describe('casos generales', () => {
  it('resume el estado', () => {
    expect(validarDxf(leer('perfecto.dxf')).resumen.texto).toBe('Listo para cortar')
    expect(validarDxf(leer('sin-unidades.dxf')).resumen.texto).toBe('Revisa los avisos')
    expect(validarDxf(leer('abierto.dxf')).resumen.texto).toBe('Corrige los errores antes de cortar')
  })
  it('no lanza con basura, vacío o texto a medias', () => {
    for (const t of ['', 'hola', '0\nSECTION\n2\nENTITIES\n0\nLINE\n10\nabc', '\u0000\u0001\u0002', null]) {
      const r = validarDxf(t)
      expect(r.hallazgos[0].id).toBe('1')
    }
  })
  it('la tira de prueba de 600 × 600 cabe y no tiene errores', () => {
    const r = validarDxf(leer('tira-kerf-marco.dxf'), { material: { W: 600, H: 600 } })
    expect(r.resumen.errores).toBe(0)
  })
  it('las piezas a 0.3 mm son error', () => {
    const t = leer('piezas-juntas.dxf').replace(/\n10\n51\n/g, '\n10\n50.3\n').replace(/\n10\n101\n/g, '\n10\n100.3\n')
    const h = validarDxf(t).hallazgos.find((x) => x.id === '10')
    expect(h.nivel).toBe('error')
    expect(h.distancia).toBeCloseTo(0.3, 6)
  })
  it('estima el tiempo con la velocidad dada', () => {
    const h = validarDxf(leer('grande.dxf'), { velocidad: 20 }).hallazgos.find((x) => x.id === '13')
    expect(h.longitud).toBeCloseTo(2000, 6)
    expect(h.segundos).toBeCloseTo(100, 6)
  })
  it('sugiere pulgadas o cm si no hay unidades y el dibujo es chico', () => {
    const t = leer('sin-unidades.dxf').replace(/\n10\n100\n/g, '\n10\n4\n').replace(/\n20\n80\n/g, '\n20\n3\n')
    expect(validarDxf(t).hallazgos.find((x) => x.id === '2b').mensaje).toMatch(/pulgadas o en centímetros/)
  })
  it('la ranura del archivo perfecto coincide con t − k', () => {
    const h = validarDxf(leer('perfecto.dxf'), { espesor: 2.85, kerf: 0.2 }).hallazgos.find((x) => x.id === '11')
    expect(h.mensaje).toMatch(/2\.65 mm \(igual a lo esperado\)/)
  })
})
