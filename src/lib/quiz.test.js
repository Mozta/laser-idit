import { describe, it, expect } from 'vitest'
import { calificar } from './quiz.js'
import quiz from '../data/quiz.json'

describe('quiz de seguridad', () => {
  const correctas = quiz.preguntas.map((p) => p.correcta)

  it('tiene 8 preguntas con 4 opciones y una correcta válida', () => {
    expect(quiz.preguntas).toHaveLength(8)
    for (const p of quiz.preguntas) {
      expect(p.opciones).toHaveLength(4)
      expect(p.correcta).toBeGreaterThanOrEqual(0)
      expect(p.correcta).toBeLessThan(4)
    }
  })
  it('aprueba con 7 o más', () => {
    expect(calificar(quiz.preguntas, correctas, quiz.aprobado)).toMatchObject({ aciertos: 8, aprobado: true })
    const siete = [...correctas]
    siete[0] = (siete[0] + 1) % 4
    expect(calificar(quiz.preguntas, siete, quiz.aprobado)).toMatchObject({ aciertos: 7, aprobado: true })
    const seis = [...siete]
    seis[1] = (seis[1] + 1) % 4
    expect(calificar(quiz.preguntas, seis, quiz.aprobado)).toMatchObject({ aciertos: 6, aprobado: false })
  })
})
