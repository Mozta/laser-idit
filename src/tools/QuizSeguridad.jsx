import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Herramienta } from './comun.jsx'
import { Palomita, Tache } from '../components/Checklist.jsx'
import { calificar } from '../lib/quiz.js'
import quiz from '../data/quiz.json'
import './QuizSeguridad.css'

const CLAVE = 'laser-idit:quiz-seguridad'

function leerGuardado() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE))
  } catch {
    return null
  }
}

function guardar(r) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify({ ...r, fecha: new Date().toISOString() }))
  } catch {
    /* sin almacenamiento disponible: el quiz funciona igual */
  }
}

const LETRAS = ['A', 'B', 'C', 'D']

// Recibe el foco cuando aparece. Como cada pregunta se monta hasta que termina de salir la anterior,
// así el foco llega al título nuevo y no se pierde en el que se va.
function EnfocarAlMontar({ as: Tag, children, ...resto }) {
  const ref = useRef(null)
  useEffect(() => {
    ref.current?.focus()
  }, [])
  return (
    <Tag ref={ref} tabIndex={-1} {...resto}>
      {children}
    </Tag>
  )
}

export default function QuizSeguridad() {
  const [actual, setActual] = useState(-1)
  const [respuestas, setRespuestas] = useState([])
  const [previo, setPrevio] = useState(null)
  const { preguntas, aprobado } = quiz

  useEffect(() => setPrevio(leerGuardado()), [])

  const terminado = actual >= preguntas.length
  const resultado = terminado ? calificar(preguntas, respuestas, aprobado) : null

  const siguiente = () => {
    if (actual + 1 === preguntas.length) {
      guardar(calificar(preguntas, respuestas, aprobado))
      setPrevio(leerGuardado())
    }
    setActual((a) => a + 1)
  }

  const empezar = () => {
    setRespuestas([])
    setActual(0)
  }

  const p = preguntas[actual]
  const elegida = respuestas[actual]
  const contestada = elegida !== undefined

  return (
    <Herramienta id="quiz" titulo="Quiz de seguridad" descripcion={`${preguntas.length} preguntas. Apruebas con ${aprobado} o más.`}>
      <p className="quiz-aviso">Este quiz te ayuda a repasar. No sustituye la inducción de seguridad del IDIT.</p>
      <AnimatePresence mode="wait">
        {actual === -1 && (
          <motion.div key="inicio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {previo && (
              <p className="muted">
                Tu último intento: {previo.aciertos} de {previo.total}
                {previo.aprobado ? ', aprobado.' : '.'}
              </p>
            )}
            <button type="button" className="btn btn-primary" onClick={empezar}>
              {previo ? 'Intentar de nuevo' : 'Empezar'}
            </button>
          </motion.div>
        )}

        {p && (
          <motion.div
            key={actual}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.2 }}
          >
            <div className="quiz-progreso" aria-hidden="true">
              <motion.div className="quiz-barra" animate={{ width: `${(actual / preguntas.length) * 100}%` }} />
            </div>
            <p className="muted quiz-cuenta">
              Pregunta {actual + 1} de {preguntas.length}
            </p>
            <EnfocarAlMontar as="h4" className="quiz-pregunta">
              {p.pregunta}
            </EnfocarAlMontar>
            <ul className="quiz-opciones">
              {p.opciones.map((o, i) => {
                const esCorrecta = i === p.correcta
                const estado = !contestada ? '' : esCorrecta ? 'correcta' : i === elegida ? 'incorrecta' : 'apagada'
                return (
                  <li key={i}>
                    <button
                      type="button"
                      className={`quiz-opcion ${estado}`}
                      disabled={contestada}
                      aria-pressed={i === elegida}
                      onClick={() => setRespuestas((r) => Object.assign([...r], { [actual]: i }))}
                    >
                      <span className="quiz-letra" aria-hidden="true">
                        {contestada && esCorrecta ? <Palomita /> : contestada && i === elegida ? <Tache /> : LETRAS[i]}
                      </span>
                      <span>{o}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
            <AnimatePresence>
              {contestada && (
                <motion.div
                  className={`quiz-retro ${elegida === p.correcta ? 'bien' : 'mal'}`}
                  role="status"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <strong>{elegida === p.correcta ? 'Correcto.' : 'No exactamente.'}</strong> {p.explicacion}
                </motion.div>
              )}
            </AnimatePresence>
            {contestada && (
              <button type="button" className="btn btn-primary quiz-siguiente" onClick={siguiente}>
                {actual + 1 < preguntas.length ? 'Siguiente' : 'Ver resultado'}
              </button>
            )}
          </motion.div>
        )}

        {resultado && (
          <motion.div key="fin" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
            <EnfocarAlMontar as="p" className={`quiz-puntaje ${resultado.aprobado ? 'teal' : 'rose'}`}>
              {resultado.aciertos} de {resultado.total}
            </EnfocarAlMontar>
            <p>
              {resultado.aprobado
                ? 'Aprobado. Llega a la máquina con estas reglas en la cabeza y con tu inducción hecha.'
                : `Te faltaron ${aprobado - resultado.aciertos} para aprobar. Repasa la sección de seguridad y vuelve a intentarlo.`}
            </p>
            <button type="button" className="btn btn-primary" onClick={empezar}>
              Intentar de nuevo
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </Herramienta>
  )
}
