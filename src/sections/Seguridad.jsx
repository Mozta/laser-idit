import Seccion, { Bloque, Revelar } from '../components/Seccion.jsx'
import Tarjeta, { Acento } from '../components/Tarjeta.jsx'
import Figura from '../components/Figura.jsx'
import QuizSeguridad from '../tools/QuizSeguridad.jsx'
import './secciones.css'

const REGLAS = [
  { t: 'Inducción primero', d: 'No operas sin la inducción de seguridad del IDIT.', a: 'rose' },
  { t: 'La tapa se queda cerrada', d: 'Nunca abras la tapa con el láser activo. El haz no se ve.', a: 'rose' },
  { t: 'Nunca la dejes sola', d: 'Vigila todo el corte. Papel y cartón se incendian.', a: 'rose' },
  {
    t: 'Extractor siempre encendido',
    d: 'El humo del MDF lleva compuestos de las resinas, como formaldehído.',
    a: 'amber',
  },
  { t: 'Mucho humo, algo anda mal', d: 'Mucho humo significa que no está cortando bien: detén y revisa.', a: 'amber' },
  { t: 'Plásticos desconocidos, no', d: 'PVC y vinil liberan cloro. Si no sabes qué plástico es, no se corta.', a: 'rose' },
  { t: 'Ubica el paro y el extintor', d: 'Antes de empezar, localiza el paro de emergencia y el extintor.', a: 'amber' },
]

export default function Seguridad() {
  return (
    <Seccion id="seguridad" numero={6} titulo="Lo que no se negocia" idea="Siete reglas. Todas, siempre." alterna>
      <div className="rejilla">
        {REGLAS.map((r, i) => (
          <Revelar key={r.t}>
            <Tarjeta acento={r.a} titulo={`${i + 1}. ${r.t}`}>
              <p>{r.d}</p>
            </Tarjeta>
          </Revelar>
        ))}
      </div>

      <Revelar className="bloque">
        <Acento>
          <strong>El haz no se ve.</strong>
          <p>
            La luz del láser de CO₂ no se ve a simple vista. Por eso la tapa se abre solo con el botón Laser apagado y después
            de que el extractor sacó el humo.
          </p>
        </Acento>
      </Revelar>

      <Bloque>
        <div className="rejilla-2">
          <QuizSeguridad />
          <div className="pila">
            <Figura ruta="grupo/extractordehumo.webp" />
            <Figura ruta="grupo/parodeemergencia.webp" />
          </div>
        </div>
      </Bloque>
    </Seccion>
  )
}
