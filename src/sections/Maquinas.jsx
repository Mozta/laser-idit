import Seccion, { Bloque, Revelar } from '../components/Seccion.jsx'
import Tarjeta from '../components/Tarjeta.jsx'
import Figura from '../components/Figura.jsx'
import Checklist from '../components/Checklist.jsx'
import AcomodoLamina from '../tools/AcomodoLamina.jsx'
import maquinas from '../data/maquinas.json'
import './secciones.css'

export default function Maquinas() {
  return (
    <Seccion id="maquinas" numero={1} titulo="Conoce a las tres" idea="Tres cortadoras, un mismo flujo de trabajo.">
      <div className="maquinas">
        {maquinas.map((q, i) => (
          <Revelar key={q.id} className="maquina">
            <Figura ruta={q.imagen} recorte="4 / 3" pie="" />
            <Tarjeta titulo={q.modelo} acento={['teal', 'amber', 'orange'][i]}>
              <p className="maquina-area">
                {q.ancho} × {q.alto} <small>mm</small>
              </p>
              <p className="muted">{q.notas}</p>
            </Tarjeta>
          </Revelar>
        ))}
      </div>

      <Bloque titulo="Lo que comparten">
        <div className="rejilla-2">
          <Checklist
            items={[
              <>Láser de CO₂ de <strong>100 W</strong>.</>,
              <>Se controlan con <strong>SmartCarve 4.3</strong>, que solo abre con su llave USB conectada.</>,
              <>Reciben archivos <strong>DXF</strong>.</>,
              <>Un switch inferior enciende los sistemas auxiliares, incluido el extractor de humo.</>,
            ]}
          />
          <Figura ruta="daniel/cutter.webp" />
        </div>
      </Bloque>

      <Bloque>
        <AcomodoLamina />
      </Bloque>
    </Seccion>
  )
}
