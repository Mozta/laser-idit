import './Formula.css'

// Escribe variables entre llaves: "kerf = ({L} − {M}) / {n}".
export default function Formula({ children, etiqueta }) {
  const partes = String(children).split(/(\{[^}]+\})/g)
  return (
    <figure className="formula">
      {etiqueta && <figcaption>{etiqueta}</figcaption>}
      <code>
        {partes.map((p, i) =>
          p.startsWith('{') ? (
            <var key={i}>{p.slice(1, -1)}</var>
          ) : (
            <span key={i}>{p}</span>
          ),
        )}
      </code>
    </figure>
  )
}
