// Puntaje: número de respuestas iguales a la correcta.
export function calificar(preguntas, respuestas, aprobado) {
  const aciertos = preguntas.reduce((s, p, i) => s + (respuestas[i] === p.correcta ? 1 : 0), 0)
  return { aciertos, total: preguntas.length, aprobado: aciertos >= aprobado }
}
