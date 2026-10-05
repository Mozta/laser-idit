import { describe, it, expect } from 'vitest'
import { redondear, formatear, formatearFijo, leerNumero } from './numeros.js'

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
  it('funciona con números muy chicos o muy grandes', () => {
    expect(redondear(1e-7, 2)).toBe(0)
    expect(redondear(4.4e-16, 6)).toBe(0)
    expect(redondear(1.23456e-5, 7)).toBe(0.0000123)
    expect(redondear(1e22 + 0.4, 2)).toBe(1e22)
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

describe('formatearFijo', () => {
  it('rellena con ceros hasta los decimales pedidos', () => {
    expect(formatearFijo(0.16, 3)).toBe('0.160')
    expect(formatearFijo(79.8, 2)).toBe('79.80')
    expect(formatearFijo(0.0875, 4)).toBe('0.0875')
    expect(formatearFijo(3, 2)).toBe('3.00')
    expect(formatearFijo(-0.35, 2)).toBe('−0.35')
    expect(formatearFijo(1.005, 2)).toBe('1.01')
    expect(formatearFijo(NaN)).toBe('—')
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
