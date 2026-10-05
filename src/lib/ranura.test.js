import { describe, it, expect } from 'vitest'
import { calcularRanura } from './ranura.js'
import { redondear } from './numeros.js'

const casos = [
  { t: 2.85, k: 0.2, ranura: 2.65, exterior: 79.8, hueco: 12.2 },
  { t: 3.0, k: 0.17, ranura: 2.83, exterior: 79.83, hueco: 12.17 },
]

describe('calculadora de ranura', () => {
  it.each(casos)('t=$t, k=$k → ranura $ranura, exterior 80 → $exterior, hueco 12 → $hueco', (c) => {
    const r = calcularRanura({ t: c.t, k: c.k, exterior: 80, hueco: 12 })
    expect(redondear(r.ranura, 2)).toBe(c.ranura)
    expect(redondear(r.exterior, 2)).toBe(c.exterior)
    expect(redondear(r.hueco, 2)).toBe(c.hueco)
  })
  it('no calcula sin espesor', () => {
    expect(calcularRanura({ t: NaN, k: 0.2 })).toBeNull()
  })
})

describe('ranura, entradas inválidas', () => {
  it('el kerf no puede ser igual o mayor que el espesor', () => {
    expect(calcularRanura({ t: 3, k: 3.5 }).error).toMatch(/menor que el espesor/)
    expect(calcularRanura({ t: 3, k: 3 }).error).toBeDefined()
    expect(calcularRanura({ t: 3, k: -0.1 })).toBeNull()
  })
})
