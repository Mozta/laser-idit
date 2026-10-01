import { describe, it, expect } from 'vitest'
import { redondear, formatear, leerNumero } from './numeros.js'

describe('redondear', () => {
  it('evita errores de punto flotante', () => {
    expect(redondear(1.005, 2)).toBe(1.01)
    expect(redondear(0.1 + 0.2, 2)).toBe(0.3)
    expect(redondear((100 - 98.4) / 10, 3)).toBe(0.16)
  })
  it('redondea negativos de forma simétrica', () => {
    expect(redondear(-1.005, 2)).toBe(-1.01)
    expect(redondear(-0.00001, 2)).toBe(0)
  })
  it('regresa NaN con valores no finitos', () => {
    expect(redondear(NaN)).toBeNaN()
    expect(redondear(Infinity)).toBeNaN()
  })
})

describe('formatear', () => {
  it('muestra sin ceros sobrantes', () => {
    expect(formatear(0.16, 3)).toBe('0.16')
    expect(formatear(0.0875, 4)).toBe('0.0875')
    expect(formatear(NaN)).toBe('—')
  })
})

describe('leerNumero', () => {
  it('acepta punto o coma decimal', () => {
    expect(leerNumero('98.25')).toBe(98.25)
    expect(leerNumero('2,85')).toBe(2.85)
  })
  it('rechaza vacío o texto', () => {
    expect(leerNumero('')).toBeNaN()
    expect(leerNumero('   ')).toBeNaN()
    expect(leerNumero('abc')).toBeNaN()
    expect(leerNumero('3mm')).toBeNaN()
    expect(leerNumero(null)).toBeNaN()
  })
})
