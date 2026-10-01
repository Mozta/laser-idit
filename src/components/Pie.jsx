import creditos from '../data/creditos.json'
import './Pie.css'

export default function Pie() {
  return (
    <footer className="pie">
      <div className="wrap pie-rejilla">
        <div>
          <p className="pie-titulo">Corte láser en el IDIT</p>
          <p className="muted">
            IDIT, IBERO Puebla. Material de referencia para quien corta en las láseres del IDIT. Cada valor de potencia,
            velocidad o kerf es un punto de partida que confirmas con una prueba.
          </p>
          <p className="muted">
            Texto y sitio: Rafael Pérez Aguirre, a partir de su documentación de Fab Academy 2019.
          </p>
        </div>
        <div>
          <p className="pie-titulo">Fuentes y créditos de imágenes</p>
          <ul>
            {Object.values(creditos.fuentes).map((f) => (
              <li key={f.url}>
                <a href={f.url} target="_blank" rel="noreferrer">
                  {f.autor}, {f.obra}
                </a>
                {f.licencia.startsWith('CC') && <span className="muted"> · {f.licencia}</span>}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
