import { useId } from 'react'
import { motion } from 'motion/react'
import './comun.css'

export function Herramienta({ titulo, descripcion, children, id }) {
  return (
    <div className="herramienta" id={id}>
      <div className="herramienta-cabeza">
        <p className="herramienta-etiqueta">Interactivo</p>
        <h3>{titulo}</h3>
        {descripcion && <p className="muted">{descripcion}</p>}
      </div>
      {children}
    </div>
  )
}

export function Campo({ etiqueta, valor, alCambiar, unidad = 'mm', ayuda, entero = false, ...resto }) {
  const id = useId()
  const idAyuda = ayuda ? `${id}-ayuda` : undefined
  return (
    <div className="field">
      <label htmlFor={id}>{etiqueta}</label>
      <div className="campo-unidad">
        <input
          id={id}
          type="text"
          inputMode={entero ? 'numeric' : 'decimal'}
          autoComplete="off"
          value={valor}
          onChange={(e) => alCambiar(e.target.value)}
          aria-describedby={idAyuda}
          {...resto}
        />
        {unidad && <span aria-hidden="true">{unidad}</span>}
      </div>
      {ayuda && (
        <small id={idAyuda} className="muted">
          {ayuda}
        </small>
      )}
    </div>
  )
}

export function Segmentado({ opciones, valor, alCambiar, etiqueta, grupo }) {
  return (
    <div className="segmented" role="group" aria-label={etiqueta}>
      {opciones.map((o) => (
        <button key={o.valor} type="button" aria-pressed={valor === o.valor} onClick={() => alCambiar(o.valor)}>
          {valor === o.valor && <motion.span layoutId={`seg-${grupo}`} className="seg-bg" transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }} />}
          <span className="seg-label">{o.etiqueta}</span>
        </button>
      ))}
    </div>
  )
}

export function Resultado({ etiqueta, valor, unidad = 'mm', destacado = false, tono }) {
  return (
    <div className={`resultado${destacado ? ' resultado-destacado' : ''}`} style={tono ? { '--acento': `var(--${tono})` } : undefined}>
      <span className="resultado-etiqueta">{etiqueta}</span>
      <span className="resultado-valor">
        <motion.span key={valor} initial={{ opacity: 0.3, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          {valor}
        </motion.span>
        {unidad && valor !== '—' && <small> {unidad}</small>}
      </span>
    </div>
  )
}

export function Mensaje({ tono = 'rose', children }) {
  return (
    <motion.p
      className="mensaje"
      style={{ '--acento': `var(--${tono})` }}
      role={tono === 'rose' ? 'alert' : 'status'}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
    >
      {children}
    </motion.p>
  )
}
