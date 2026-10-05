import Seccion, { Revelar } from '../components/Seccion.jsx'
import Figura from '../components/Figura.jsx'
import galeria from '../data/galeria.json'
import './secciones.css'

// Columnas para que ningún renglón quede cojo: hasta 4 en uno solo; más de 4, en renglones de 3 o 4.
const columnas = (n) => (n <= 4 ? n : n % 3 === 0 ? 3 : 4)

export default function Galeria() {
  return (
    <Seccion id="galeria" numero={8} titulo="Lo que ya salió de estas máquinas" idea="Trabajos de la comunidad, con su crédito. Esta galería crece con cada generación." alterna>
      <div className="galeria">
        {galeria.trabajos.map((t) => (
          <Revelar key={t.titulo} as="article" className="trabajo">
            <header>
              <h3>{t.titulo}</h3>
              <p className="muted">
                {t.autor} · {t.anio}
              </p>
            </header>
            <p>{t.descripcion}</p>
            <div className={`trabajo-fotos fotos-${Math.min(t.imagenes.length, 3)}`} style={{ '--cols': columnas(t.imagenes.length) }}>
              {t.imagenes.map((r) => (
                <Figura key={r} ruta={r} recorte="4 / 3" />
              ))}
            </div>
          </Revelar>
        ))}
      </div>
    </Seccion>
  )
}
