import { describe, it, expect } from 'vitest'
import { puntosBulge, puntosArco, areaConSigno, puntoEnPoligono, distanciaSegmentos, simplificar, longitud } from './geometria.js'

describe('geometría', () => {
  it('un bulge de 1 es medio círculo en sentido antihorario', () => {
    const pts = puntosBulge([0, 0], [10, 0], 1)
    const masBajo = Math.min(...pts.map((p) => p[1]))
    expect(Math.abs(masBajo + 5)).toBeLessThanOrEqual(0.011)
    expect(longitud(pts)).toBeCloseTo(Math.PI * 5, 1)
    expect(pts.at(-1)).toEqual([10, 0])
  })
  it('un bulge negativo va hacia el otro lado', () => {
    const pts = puntosBulge([0, 0], [10, 0], -1)
    expect(Math.abs(Math.max(...pts.map((p) => p[1])) - 5)).toBeLessThanOrEqual(0.011)
  })
  it('discretiza arcos con error de cuerda menor a la tolerancia', () => {
    const r = 50
    const pts = puntosArco(0, 0, r, 0, 2 * Math.PI, 0.01)
    for (let i = 1; i < pts.length; i++) {
      const m = [(pts[i][0] + pts[i - 1][0]) / 2, (pts[i][1] + pts[i - 1][1]) / 2]
      expect(r - Math.hypot(...m)).toBeLessThanOrEqual(0.01 + 1e-9)
    }
  })
  it('área, punto en polígono y distancias', () => {
    const cuad = [[0, 0], [10, 0], [10, 10], [0, 10]]
    expect(areaConSigno(cuad)).toBe(100)
    expect(puntoEnPoligono([5, 5], cuad)).toBe(true)
    expect(puntoEnPoligono([15, 5], cuad)).toBe(false)
    expect(distanciaSegmentos([0, 0], [10, 0], [0, 3], [10, 3])).toBe(3)
    expect(distanciaSegmentos([0, 0], [10, 10], [0, 10], [10, 0])).toBe(0)
  })
  it('simplifica vértices colineales', () => {
    expect(simplificar([[0, 0], [5, 0], [10, 0], [10, 10], [0, 10], [0, 0]])).toHaveLength(4)
  })
})
