import { describe, it, expect } from 'vitest'
import { ordenTrabajo, revisarCapas } from './capas.js'
import smartcarve from '../data/smartcarve.json'

const OBJETOS = [
  { id: 'g', nombre: 'Grabado', tipo: 'grabado' },
  { id: 'c', nombre: 'Hueco redondo', tipo: 'hueco' },
  { id: 'r', nombre: 'Ranura', tipo: 'hueco' },
  { id: 'k', nombre: 'Contorno', tipo: 'contorno' },
]
const PARAMS = { max: 60, min: 50, vel: 18 }
const capasBase = () => smartcarve.capas.map((c) => ({ ...c, procesar: true, ...PARAMS }))
const asignar = (mapa) => OBJETOS.map((o) => ({ ...o, capa: mapa[o.id] }))
const ids = (r) => r.hallazgos.map((h) => h.id).sort()

describe('panel de capas', () => {
  it('trae las 10 capas de la captura con prioridades distintas', () => {
    expect(smartcarve.capas).toHaveLength(10)
    expect(new Set(smartcarve.capas.map((c) => c.prioridad)).size).toBe(10)
  })

  it('todo en la capa 1: grabado y corte mezclados, contorno sin turno propio', () => {
    const r = revisarCapas(asignar({ g: 1, c: 1, r: 1, k: 1 }), capasBase())
    expect(ids(r)).toEqual(['mezcla', 'mismo-turno'])
    expect(r.listo).toBe(false)
  })

  it('configuración correcta con las prioridades de la captura', () => {
    // Prioridades: capa 3 → 1, capa 2 → 2, capa 5 → 3
    const objetos = asignar({ g: 3, c: 2, r: 2, k: 5 })
    const r = revisarCapas(objetos, capasBase())
    expect(r.hallazgos).toEqual([])
    expect(r.listo).toBe(true)
    expect(ordenTrabajo(objetos, capasBase()).map((t) => t.capa)).toEqual([3, 2, 5])
  })

  it('rojo para cortar y azul para grabar sale al revés con esas prioridades', () => {
    // Capa 3 (rojo) tiene prioridad 1 y capa 1 (azul) prioridad 5.
    const r = revisarCapas(asignar({ g: 1, c: 3, r: 3, k: 3 }), capasBase())
    expect(ids(r)).toContain('orden-grabado')
  })

  it('contorno antes que los huecos', () => {
    const r = revisarCapas(asignar({ g: 3, c: 5, r: 5, k: 2 }), capasBase())
    expect(ids(r)).toContain('orden-contorno')
  })

  it('capa sin procesar', () => {
    const capas = capasBase().map((c) => (c.id === 5 ? { ...c, procesar: false } : c))
    const objetos = asignar({ g: 3, c: 2, r: 2, k: 5 })
    const r = revisarCapas(objetos, capas)
    expect(ids(r)).toEqual(['sin-procesar'])
    expect(ordenTrabajo(objetos, capas).map((t) => t.capa)).toEqual([3, 2])
  })

  it('la capa 1 trae valores heredados de la captura', () => {
    expect(smartcarve.capas.find((c) => c.id === 1).heredados).toEqual({ max: 75, min: 70, vel: 30 })
    expect(smartcarve.capas.filter((c) => c.heredados)).toHaveLength(1)
  })

  it('avisa si una capa en uso conserva valores heredados sin revisar', () => {
    const capas = capasBase().map((c) => (c.id === 1 ? { ...c, max: 75, min: 70, vel: 30, heredado: true } : c))
    // Grabado en 3 (prioridad 1), huecos en 2 (2), contorno en 1 (5)
    const r = revisarCapas(asignar({ g: 3, c: 2, r: 2, k: 1 }), capas)
    expect(ids(r)).toEqual(['heredados'])
    expect(r.hallazgos[0].mensaje).toMatch(/75 \/ 70 \/ 30/)
    // Al revisarlos, desaparece el aviso
    const revisadas = capas.map((c) => ({ ...c, heredado: false }))
    expect(revisarCapas(asignar({ g: 3, c: 2, r: 2, k: 1 }), revisadas).listo).toBe(true)
  })

  it('una capa heredada que no se usa no avisa', () => {
    const capas = capasBase().map((c) => (c.id === 1 ? { ...c, heredado: true } : c))
    expect(revisarCapas(asignar({ g: 3, c: 2, r: 2, k: 5 }), capas).listo).toBe(true)
  })

  it('prioridad repetida, parámetros vacíos y mínima mayor que máxima', () => {
    const capas = capasBase().map((c) => {
      if (c.id === 2) return { ...c, prioridad: 1 }
      if (c.id === 5) return { ...c, max: NaN }
      if (c.id === 3) return { ...c, max: 20, min: 30 }
      return c
    })
    const r = revisarCapas(asignar({ g: 3, c: 2, r: 2, k: 5 }), capas)
    expect(ids(r)).toEqual(['min-mayor', 'prioridad-repetida', 'sin-parametros'])
  })
})
