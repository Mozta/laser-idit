import { motion } from 'motion/react'
import { SECCIONES } from '../data/secciones.js'
import './Seccion.css'

const aparecer = {
  oculto: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export function Revelar({ children, className, as = 'div' }) {
  const Tag = motion[as]
  return (
    <Tag className={className} variants={aparecer} initial="oculto" whileInView="visible" viewport={{ once: true, margin: '-60px' }}>
      {children}
    </Tag>
  )
}

export default function Seccion({ id, numero, titulo, idea, alterna = false, children }) {
  const etiqueta = SECCIONES.find((x) => x.id === id)?.corto
  return (
    <section id={id} className={`seccion${alterna ? ' seccion-alterna' : ''}`} aria-labelledby={`${id}-titulo`}>
      <div className="wrap">
        <Revelar as="header" className="seccion-cabeza">
          {numero && (
            <p className="seccion-kicker kicker">
              <span className="seccion-numero">{String(numero).padStart(2, '0')}</span>
              <span className="seccion-linea" aria-hidden="true" />
              <span>{etiqueta}</span>
            </p>
          )}
          <div>
            <h2 id={`${id}-titulo`}>{titulo}</h2>
            {idea && <p className="seccion-idea">{idea}</p>}
          </div>
        </Revelar>
        {children}
      </div>
    </section>
  )
}

export function Bloque({ titulo, children, id }) {
  return (
    <Revelar className="bloque">
      {titulo && <h3 id={id}>{titulo}</h3>}
      {children}
    </Revelar>
  )
}
