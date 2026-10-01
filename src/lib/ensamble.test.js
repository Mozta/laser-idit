import { describe, it, expect } from 'vitest'
import { evaluarEnsamble } from './ensamble.js'

const casos = [
  { w: 3.0, real: 3.2, h: 0.35, estado: 'floja', etiqueta: 'Floja' },
  { w: 2.65, real: 2.85, h: 0, estado: 'justa', etiqueta: 'Justa, desliza' },
  { w: 2.5, real: 2.7, h: -0.15, estado: 'presion', etiqueta: 'Entra a presión' },
  { w: 2.3, real: 2.5, h: -0.35, estado: 'noEntra', etiqueta: 'No entra' },
]

describe('simulador de ensamble (t = 2.85, k = 0.2)', () => {
  it.each(casos)('w=$w → real $real, h $h, $etiqueta', (c) => {
    const r = evaluarEnsamble({ w: c.w, t: 2.85, k: 0.2 })
    expect(r.real).toBe(c.real)
    expect(r.holgura).toBe(c.h)
    expect(r.estado).toBe(c.estado)
    expect(r.etiqueta).toBe(c.etiqueta)
  })
  it('respeta los límites de cada estado', () => {
    expect(evaluarEnsamble({ w: 2.75, t: 2.85, k: 0.2 }).estado).toBe('justa') // h = 0.10
    expect(evaluarEnsamble({ w: 2.76, t: 2.85, k: 0.2 }).estado).toBe('floja') // h = 0.11
    expect(evaluarEnsamble({ w: 2.49, t: 2.85, k: 0.2 }).estado).toBe('noEntra') // h = −0.16
  })
})
