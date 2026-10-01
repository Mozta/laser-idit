import Seccion, { Bloque, Revelar } from '../components/Seccion.jsx'
import Tarjeta, { Aviso } from '../components/Tarjeta.jsx'
import Figura from '../components/Figura.jsx'
import parametros from '../data/parametros.json'
import '../tools/svg.css'
import './secciones.css'

function DiagramaFoco() {
  return (
    <svg viewBox="0 0 360 260" role="img" aria-labelledby="foco-t">
      <title id="foco-t">
        El cabezal enfoca el haz en un punto sobre el material. Entre la boquilla y el material hay 5 mm, que se ajustan con un
        calibrador.
      </title>
      <rect x="130" y="10" width="100" height="70" rx="10" fill="#a3aba7" />
      <path d="M150 80 L210 80 L195 130 L165 130 Z" fill="#4d5755" />
      <path d="M170 130 L190 130 L181 196 L179 196 Z" className="s-amber" opacity="0.9" />
      <circle cx="180" cy="196" r="5" className="s-amber" />
      <rect x="20" y="196" width="320" height="34" className="s-madera" />
      <line x1="250" y1="130" x2="250" y2="196" className="s-amber-trazo" />
      <line x1="242" y1="130" x2="258" y2="130" className="s-amber-trazo" />
      <line x1="242" y1="196" x2="258" y2="196" className="s-amber-trazo" />
      <text x="266" y="168" className="s-texto s-mono">{parametros.foco} mm</text>
      <text x="40" y="252" className="s-texto-chico">MDF</text>
      <text x="20" y="40" className="s-texto-chico">cabezal</text>
      <text x="20" y="120" className="s-texto-chico">boquilla</text>
    </svg>
  )
}

const CONTROLES = [
  {
    titulo: 'Foco',
    acento: 'accent',
    texto: `Distancia entre la boquilla y el material: ${parametros.foco} mm, ajustada con un calibrador de esa medida. Muy bajo quema; muy alto no corta.`,
  },
  {
    titulo: 'Potencia máxima (%)',
    acento: 'accent',
    texto: 'La que usa en tramos rectos. Decide si el láser atraviesa el material.',
  },
  {
    titulo: 'Potencia mínima (%)',
    acento: 'accent',
    texto:
      'La que usa en curvas y esquinas, donde el cabezal frena. Si es alta, quema las esquinas; si es baja, deja curvas sin cortar. Déjala de 10 a 20 % abajo de la máxima.',
  },
  {
    titulo: 'Velocidad (mm/s)',
    acento: 'blue',
    texto: 'Más lenta corta más hondo, pero quema más y ensancha el corte.',
  },
]

export default function ComoCorta() {
  const p = parametros.puntoDePartida
  return (
    <Seccion
      id="como-corta"
      numero={2}
      titulo="Luz que evapora"
      idea="Un haz invisible, concentrado en un punto, evapora el material."
      alterna
    >
      <div className="rejilla-2 centrada">
        <figure className="diagrama">
          <DiagramaFoco />
        </figure>
        <div>
          <p>
            Un tubo de CO₂ genera el haz. En el cabezal, una lente lo concentra en un punto muy pequeño. Ahí se junta tanta
            energía que el material se evapora y deja una línea de corte.
          </p>
          <p>Para que eso pase controlas cuatro cosas:</p>
        </div>
      </div>

      <div className="rejilla" style={{ marginTop: 24 }}>
        {CONTROLES.map((c) => (
          <Revelar key={c.titulo}>
            <Tarjeta titulo={c.titulo} acento={c.acento}>
              <p>{c.texto}</p>
            </Tarjeta>
          </Revelar>
        ))}
      </div>

      <Bloque titulo="Lo que otros usaron en MDF de 3 mm">
        <div className="table-wrap">
          <table>
            <caption className="sr-only">Valores de potencia y velocidad reportados para MDF de 3 mm</caption>
            <thead>
              <tr>
                <th scope="col">Fuente</th>
                <th scope="col" className="num">Máx. (%)</th>
                <th scope="col" className="num">Mín. (%)</th>
                <th scope="col" className="num">Velocidad (mm/s)</th>
              </tr>
            </thead>
            <tbody>
              {parametros.reportados.map((r) => (
                <tr key={r.fuente + r.autor}>
                  <td>
                    {r.autor}
                    <br />
                    <small className="muted">
                      {r.fuente}
                      {r.nota && ` · ${r.nota}`}
                    </small>
                  </td>
                  <td className="num">{r.max}</td>
                  <td className="num">{r.min}</td>
                  <td className="num">{r.velocidad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Aviso titulo="Punto de partida, no receta">
          <p>
            Empieza con máxima de {p.max}, mínima {p.min} y {p.velocidad}. Confírmalo con una prueba de potencia y velocidad en
            la máquina del día: el tubo, el lote de MDF y el foco cambian el resultado.
          </p>
        </Aviso>
      </Bloque>

      <Bloque titulo="Haz tu prueba de potencia y velocidad">
        <p>
          Corta una matriz de cuadritos, cada uno con otra combinación de potencia y velocidad, y quédate con la que atraviesa
          limpio y quema menos. La página grupal usó una plantilla de{' '}
          <a href="https://lasergridmaster.com/" target="_blank" rel="noreferrer">
            LaserGridMaster
          </a>{' '}
          para armar la matriz; también puedes dibujarla tú.
        </p>
        <div className="rejilla-fotos">
          <Figura ruta="2019/captura18.webp" />
          <Figura ruta="grupo/lasergrin.webp" />
          <Figura ruta="2019/team.webp" />
        </div>
      </Bloque>
    </Seccion>
  )
}
