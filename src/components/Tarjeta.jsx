import './Tarjeta.css'

export default function Tarjeta({ acento = 'teal', titulo, children, className = '', as: Tag = 'div', nivel = 3 }) {
  const Titulo = `h${nivel}`
  return (
    <Tag className={`tarjeta ${className}`} style={{ '--acento': `var(--${acento})` }}>
      {titulo && <Titulo className="tarjeta-titulo">{titulo}</Titulo>}
      {children}
    </Tag>
  )
}

export function Acento({ children }) {
  return <div className="acento-seccion">{children}</div>
}

export function Aviso({ tono = 'amber', titulo, children }) {
  return (
    <div className="aviso" style={{ '--acento': `var(--${tono})` }} role="note">
      {titulo && <strong className="aviso-titulo">{titulo}</strong>}
      <div>{children}</div>
    </div>
  )
}
