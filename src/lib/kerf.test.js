import { describe, it, expect } from 'vitest'
import { kerfPiezasJuntas, kerfHuecoMarco, MENSAJES_KERF } from './kerf.js'
import { redondear } from './numeros.js'

describe('kerf, modo piezas juntas', () => {
  it('L=100, n=10, M=98.25 → 0.175 y 0.0875', () => {
    const r = kerfPiezasJuntas({ L: 100, n: 10, M: 98.25 })
    expect(redondear(r.kerf, 3)).toBe(0.175)
    expect(redondear(r.porLado, 4)).toBe(0.0875)
  })
  it('L=100, n=10, M=98.40 → 0.16 y 0.08', () => {
    const r = kerfPiezasJuntas({ L: 100, n: 10, M: 98.4 })
    expect(redondear(r.kerf, 3)).toBe(0.16)
    expect(redondear(r.porLado, 4)).toBe(0.08)
  })
  it('L=100, n=10, M=100 → error', () => {
    const r = kerfPiezasJuntas({ L: 100, n: 10, M: 100 })
    expect(r.ok).toBe(false)
    expect(r.error).toBe(MENSAJES_KERF.medidaMayor)
  })
  it('M mayor que L → error', () => {
    expect(kerfPiezasJuntas({ L: 100, n: 10, M: 101 }).ok).toBe(false)
  })
  it('avisa si el kerf pasa de 0.6', () => {
    const r = kerfPiezasJuntas({ L: 100, n: 10, M: 93 })
    expect(r.ok).toBe(true)
    expect(r.avisos).toContain(MENSAJES_KERF.kerfGrande)
  })
  it('no calcula con entradas vacías o no numéricas', () => {
    expect(kerfPiezasJuntas({ L: 100, n: 10, M: NaN })).toBeNull()
    expect(kerfPiezasJuntas({ L: NaN, n: 10, M: 98 })).toBeNull()
  })
})

describe('kerf, modo hueco en el marco', () => {
  it('n=10, g=1.75 → 0.1591 y 0.0795', () => {
    const r = kerfHuecoMarco({ n: 10, g: 1.75 })
    expect(redondear(r.kerf, 4)).toBe(0.1591)
    expect(redondear(r.porLado, 4)).toBe(0.0795)
    expect(r.avisos).toEqual([])
  })
  it('el hueco vale n + 1 kerfs', () => {
    expect(kerfHuecoMarco({ n: 10, g: 2.2 }).kerf).toBe(0.2)
  })
  it('no calcula sin hueco', () => {
    expect(kerfHuecoMarco({ n: 10, g: NaN })).toBeNull()
    expect(kerfHuecoMarco({ n: 10, g: 0 }).ok).toBe(false)
  })
})

describe('kerf, entradas inválidas', () => {
  it('el número de piezas tiene que ser entero', () => {
    expect(kerfPiezasJuntas({ L: 100, n: 2.5, M: 98 }).ok).toBe(false)
    expect(kerfHuecoMarco({ n: 0, g: 1 }).ok).toBe(false)
    expect(kerfHuecoMarco({ n: 2.5, g: 1 }).error).toBe(MENSAJES_KERF.piezas)
  })
})
