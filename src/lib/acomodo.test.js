import { describe, it, expect } from 'vitest'
import { acomodar, piezasPorEje, laminaEnCama, compararCamas } from './acomodo.js'
import maquinas from '../data/maquinas.json'

describe('acomodo en la lámina', () => {
  it('600 × 600 con piezas de 150 × 150 → 9', () => {
    expect(acomodar({ W: 600, H: 600, w: 150, h: 150 }).total).toBe(9)
  })
  it('600 × 600 con piezas de 80 × 60 → 63', () => {
    expect(acomodar({ W: 600, H: 600, w: 80, h: 60 }).total).toBe(63)
  })
  it('elige la orientación girada si caben más', () => {
    const r = acomodar({ W: 600, H: 300, w: 100, h: 280 })
    expect(r.normal.total).toBe(5)
    expect(r.girada.total).toBe(4)
    const r2 = acomodar({ W: 300, H: 600, w: 100, h: 280 })
    expect(r2.mejor.girada).toBe(true)
    expect(r2.total).toBe(5)
    expect(acomodar({ W: 600, H: 200, w: 190, h: 290 }).mejor.girada).toBe(true)
  })
  it('una división exacta no pierde piezas', () => {
    expect(piezasPorEje(100, 94, 3, 3)).toBe(1)
    expect(piezasPorEje(0.3 + 0.6 + 0.3, 0.3, 0, 0.3)).toBe(2)
  })
  it('no calcula con medidas inválidas', () => {
    expect(acomodar({ W: 600, H: 600, w: 0, h: 10 })).toBeNull()
    expect(acomodar({ W: NaN, H: 600, w: 10, h: 10 })).toBeNull()
  })
})

describe('comparador de camas', () => {
  const cma1200 = maquinas.find((m) => m.id === 'cma1200')

  it('600 × 600 en CMA1200 (1200 × 600): cabe, justo al límite', () => {
    const r = laminaEnCama({ W: 600, H: 600 }, cma1200)
    expect(r.cabe).toBe(true)
    expect(r.justo).toBe(true)
  })
  it('1220 × 1220 no cabe en ninguna', () => {
    expect(compararCamas({ W: 1220, H: 1220 }, maquinas).every((r) => !r.cabe)).toBe(true)
  })
  it('prueba la lámina girada', () => {
    const r = laminaEnCama({ W: 500, H: 1100 }, cma1200)
    expect(r.cabe).toBe(true)
    expect(r.girada).toBe(true)
  })
})
