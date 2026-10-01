import { describe, it, expect } from 'vitest'
import { crearTrabajo, finContornos, longitud, puntoEn, rectangulo } from './trabajoCorte.js'

const pieza = { huecos: [rectangulo(20, 20, 40, 40), rectangulo(60, 20, 80, 40)], contorno: rectangulo(0, 0, 100, 60) }

describe('plan del trabajo de corte', () => {
  it('orden correcto: huecos antes que el contorno', () => {
    const t = crearTrabajo([pieza])
    const cortes = t.ops.filter((o) => o.tipo === 'corte').map((o) => o.rol)
    expect(cortes).toEqual(['hueco', 'hueco', 'contorno'])
  })
  it('contorno primero: el contorno va antes', () => {
    const t = crearTrabajo([pieza], { orden: 'contorno' })
    const cortes = t.ops.filter((o) => o.tipo === 'corte').map((o) => o.rol)
    expect(cortes).toEqual(['contorno', 'hueco', 'hueco'])
  })
  it('los tiempos son continuos y regresa al inicio', () => {
    const t = crearTrabajo([pieza], { inicio: [120, 0] })
    for (let i = 1; i < t.ops.length; i++) expect(t.ops[i].t0).toBe(t.ops[i - 1].t1)
    expect(t.ops.at(-1).pts.at(-1)).toEqual([120, 0])
    expect(finContornos(t)[0]).toBeLessThan(t.total)
  })
  it('mide y recorre trayectos', () => {
    expect(longitud(rectangulo(0, 0, 10, 5))).toBe(30)
    expect(puntoEn([[0, 0], [10, 0]], 0.5).pt).toEqual([5, 0])
  })
})
