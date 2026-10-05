import creditos from '../data/creditos.json'
import './Pie.css'

const AUTOR = { nombre: 'Rafael Pérez Aguirre', usuario: 'Mozta', url: 'https://github.com/Mozta' }

export default function Pie() {
  return (
    <footer className="pie">
      <div className="wrap">
        <div className="pie-rejilla">
          <div>
            <p className="pie-titulo">Corte láser en el IDIT</p>
            <p className="muted">
              IDIT, IBERO Puebla. Material de referencia para quien corta en las láseres del IDIT. Cada valor de potencia,
              velocidad o kerf es un punto de partida que confirmas con una prueba.
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

        <div className="pie-firma">
          <div className="pie-autor">
            <p className="pie-titulo">Diseño y desarrollo</p>
            <p className="pie-nombre">{AUTOR.nombre}</p>
            <a className="pie-usuario" href={AUTOR.url} target="_blank" rel="noreferrer" aria-label={`@${AUTOR.usuario} en GitHub (se abre en otra pestaña)`}>
              @{AUTOR.usuario}
              <span className="pie-flecha" aria-hidden="true">
                ↗
              </span>
            </a>
          </div>
          <p className="pie-origen kicker">Nació de su documentación de Fab Academy 2019</p>
        </div>
      </div>
    </footer>
  )
}
