import { describe, it, expect } from 'vitest'
import { generarTiraDxf, lineasTira, nombreTira, validarOpcionesTira } from './tiraKerf.js'

function contarLineas(texto) {
  const g = texto.split('\n')
  let n = 0
  for (let i = 0; i < g.length - 1; i += 2) if (g[i] === '0' && g[i + 1] === 'LINE') n++
  return n
}

function clave([x1, y1, x2, y2]) {
  const a = `${x1},${y1}`
  const b = `${x2},${y2}`
  return a < b ? `${a}|${b}` : `${b}|${a}`
}

describe('generador de la tira de prueba', () => {
  it('L=100, n=10, a=20, sin marco → 13 LINE, caja 100 × 20', () => {
    const r = generarTiraDxf({ L: 100, n: 10, a: 20, marco: false })
    expect(contarLineas(r.texto)).toBe(13)
    expect(r.caja.ancho).toBe(100)
    expect(r.caja.alto).toBe(20)
  })
  it('L=100, n=10, a=20, marco m=10 → 17 LINE, caja 120 × 40', () => {
    const r = generarTiraDxf({ L: 100, n: 10, a: 20, marco: true, m: 10 })
    expect(contarLineas(r.texto)).toBe(17)
    expect(r.caja.ancho).toBe(120)
    expect(r.caja.alto).toBe(40)
  })
  it('no repite aristas', () => {
    const lineas = lineasTira({ L: 100, n: 10, a: 20, marco: true, m: 10 })
    expect(new Set(lineas.map(clave)).size).toBe(lineas.length)
  })
  it('declara milímetros, capa CORTE en rojo y formato R12', () => {
    const { texto } = generarTiraDxf({ L: 100, n: 10, a: 20 })
    expect(texto).toContain('$INSUNITS\n70\n4\n')
    expect(texto).toContain('$ACADVER\n1\nAC1009\n')
    expect(texto).toMatch(/LINE\n8\nCORTE\n62\n1\n/)
    expect(texto.trimEnd().endsWith('0\nEOF')).toBe(true)
  })
  it('nombra el archivo con sus opciones', () => {
    expect(nombreTira({ L: 100, n: 10 })).toBe('prueba-kerf-100mm-10piezas.dxf')
    expect(nombreTira({ L: 100, n: 10, marco: true })).toBe('prueba-kerf-100mm-10piezas-marco.dxf')
  })
  it('valida las opciones', () => {
    expect(validarOpcionesTira({ L: 100, n: 10, a: 20 })).toBeNull()
    expect(validarOpcionesTira({ L: 100, n: 1.5, a: 20 })).not.toBeNull()
    expect(validarOpcionesTira({ L: NaN, n: 10, a: 20 })).not.toBeNull()
  })
})
