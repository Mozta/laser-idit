import Seccion, { Bloque, Revelar } from '../components/Seccion.jsx'
import Tarjeta, { Aviso } from '../components/Tarjeta.jsx'
import Figura from '../components/Figura.jsx'
import materiales from '../data/materiales.json'
import './secciones.css'

const GRUPO = 'https://fabacademy.org/2026/labs/puebla/students/itzeleunice-moreno/assignments/groupassignment1.html'

function Lista({ items, tono }) {
  return (
    <ul className="materiales" style={{ '--acento': `var(--${tono})` }}>
      {items.map((m) => (
        <li key={m.nombre} className={m.cuidado ? 'cuidado' : ''}>
          <strong>{m.nombre}</strong>
          <span>{m.nota}</span>
        </li>
      ))}
    </ul>
  )
}

export default function Materiales() {
  return (
    <Seccion id="materiales" numero={7} titulo="Materiales y juntas" idea="Qué entra a la máquina y cómo se unen las piezas.">
      <div className="rejilla-materiales">
        <Tarjeta titulo="Se cortan" acento="teal">
          <Lista items={materiales.cortar} tono="teal" />
        </Tarjeta>
        <Tarjeta titulo="Se graban" acento="amber">
          <Lista items={materiales.grabar} tono="amber" />
        </Tarjeta>
        <Tarjeta titulo="Prohibidos" acento="rose" className="prohibidos">
          <Lista items={materiales.prohibidos} tono="rose" />
        </Tarjeta>
      </div>
      <p className="muted" style={{ marginTop: 12 }}>
        Listas basadas en la{' '}
        <a href={GRUPO} target="_blank" rel="noreferrer">
          página grupal de Itzel Eunice Moreno Rodríguez y equipo
        </a>{' '}
        (CC BY-NC). Cualquier material nuevo empieza con una prueba.
      </p>

      <Bloque titulo="Tipos de junta">
        <div className="juntas">
          {materiales.juntas.map((j) => (
            <Revelar key={j.nombre} className="junta">
              {j.imagen && <Figura ruta={j.imagen} pie="" recorte="16 / 10" />}
              <h4>{j.nombre}</h4>
              <p>{j.descripcion}</p>
            </Revelar>
          ))}
        </div>
        <p style={{ marginTop: 16 }}>
          Los archivos de estas juntas los comparte el grupo:{' '}
          <a href="https://fabacademy.org/2026/labs/puebla/students/itzeleunice-moreno/downlan/joints.zip">joints.zip</a> (CC
          BY-NC, Itzel Eunice Moreno Rodríguez y equipo).
        </p>
      </Bloque>

      <Bloque titulo="Compra tu material">
        <div className="rejilla-2">
          <Tarjeta titulo="MDF crudo de 3 mm" acento="teal">
            <p>
              La hoja mide 1.22 × 2.44 m. Pídela cortada en piezas de <strong>60 × 60 cm</strong>: salen 8 por hoja.
            </p>
            <p>Media hoja no cabe en ninguna máquina.</p>
            <p>
              Para saber cuántas láminas comprar, calcula cuántas piezas te salen por lámina en{' '}
              <a href="#acomodo-lamina">Prepara tu archivo</a>.
            </p>
          </Tarjeta>
          <Aviso tono="rose" titulo="Revisa antes de comprar">
            <p>Sin melamina, sin pintura y sin pandeo. Una hoja pandeada cambia el foco de un lado a otro.</p>
          </Aviso>
        </div>
      </Bloque>
    </Seccion>
  )
}
