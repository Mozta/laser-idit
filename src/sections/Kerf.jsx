import { motion } from 'motion/react'
import Seccion, { Bloque, Revelar } from '../components/Seccion.jsx'
import Tarjeta, { Acento, Aviso } from '../components/Tarjeta.jsx'
import Figura from '../components/Figura.jsx'
import Formula from '../components/Formula.jsx'
import CalculadoraKerf, { DiagramaPiezas, DiagramaMarco } from '../tools/CalculadoraKerf.jsx'
import CalculadoraRanura from '../tools/CalculadoraRanura.jsx'
import SimuladorEnsamble from '../tools/SimuladorEnsamble.jsx'
import GeneradorTira from '../tools/GeneradorTira.jsx'
import kerf from '../data/kerf.json'
import { formatear } from '../lib/numeros.js'
import '../tools/svg.css'
import './secciones.css'

const K = 10 // kerf exagerado para que se vea

function DiagramaRegla() {
  const vista = { once: true, margin: '-80px' }
  const t = { duration: 1.2, delay: 0.4, ease: 'easeInOut' }
  return (
    <svg viewBox="0 0 420 300" role="img" aria-labelledby="regla-t">
      <title id="regla-t">
        Una placa cuadrada con un hueco redondo. La línea punteada es tu dibujo. Después del corte, el contorno exterior queda más
        chico que el dibujo y el hueco queda más grande. El kerf está exagerado para que se note.
      </title>
      <motion.rect
        className="s-pieza"
        initial={{ attrX: 30, attrY: 30, width: 280, height: 220 }}
        whileInView={{ attrX: 30 + K / 2, attrY: 30 + K / 2, width: 280 - K, height: 220 - K }}
        viewport={vista}
        transition={t}
      />
      <motion.circle
        cx="170"
        cy="140"
        className="s-hueco"
        initial={{ r: 55 }}
        whileInView={{ r: 55 + K / 2 }}
        viewport={vista}
        transition={t}
      />
      <rect x="30" y="30" width="280" height="220" className="s-guia" style={{ stroke: 'var(--text)' }} />
      <circle cx="170" cy="140" r="55" className="s-guia" style={{ stroke: 'var(--text)' }} />
      <text x="30" y="280" className="s-texto-chico">Punteado: tu dibujo</text>
      <text x="326" y="60" className="s-texto" style={{ fill: 'var(--rose)' }}>afuera</text>
      <text x="326" y="80" className="s-texto-chico">se encoge</text>
      <text x="170" y="146" textAnchor="middle" className="s-texto" style={{ fill: 'var(--amber)' }}>
        adentro
      </text>
      <text x="170" y="164" textAnchor="middle" className="s-texto-chico">crece</text>
    </svg>
  )
}

export default function Kerf() {
  return (
    <Seccion
      id="kerf"
      numero={3}
      titulo="El láser se come un pedacito"
      idea="Y ese pedacito decide si tus piezas embonan."
    >
      <div className="rejilla-2 centrada">
        <div>
          <p>
            El <strong>kerf</strong> es el ancho de material que elimina el corte. En MDF anda en décimas de milímetro: parece
            nada, hasta que tu pestaña no entra en la ranura.
          </p>
          <p>
            El láser corta centrado sobre tu línea, así que <strong>cada borde pierde la mitad del kerf</strong>. Cuando alguien
            te diga un kerf, pregunta si es el total o por lado. En este sitio, kerf siempre significa el total.
          </p>
        </div>
        <figure className="diagrama">
          <DiagramaRegla />
        </figure>
      </div>

      <Revelar className="bloque">
        <Acento>
          <strong>Afuera se encoge, adentro crece.</strong>
          <p>
            Los contornos exteriores salen más chicos que tu dibujo. Los huecos y las ranuras salen más grandes. Si dibujas la
            ranura del mismo ancho que tu material, va a quedar floja.
          </p>
        </Acento>
      </Revelar>

      <Bloque titulo="La ranura para un ensamble ajustado">
        <Formula etiqueta="Ensamble a presión (press-fit)">{'ranura = {espesor real} − {kerf}'}</Formula>
        <Aviso titulo="Tu MDF de 3 mm casi nunca mide 3.00">
          <p>Mide cada lote con vernier en varios puntos de la hoja. Usa ese espesor real en tus cálculos.</p>
        </Aviso>
      </Bloque>

      <Bloque titulo="Cómo se mide">
        <p>
          Corta una tira de 10 rectángulos iguales dentro de un marco. Hay dos maneras de medirla y cada una lleva su divisor.
          Anota siempre cuál usaste.
        </p>
        <div className="rejilla-2">
          <Tarjeta titulo="1. Piezas juntas" acento="accent">
            <figure className="diagrama">
              <DiagramaPiezas />
            </figure>
            <p>Juntas las 10 piezas y mides su largo total. Cada pieza perdió un kerf completo, medio por cada lado.</p>
            <Formula>{'kerf = ({dibujado} − {medido}) / 10'}</Formula>
          </Tarjeta>
          <Tarjeta titulo="2. Hueco en el marco" acento="blue">
            <figure className="diagrama">
              <DiagramaMarco />
            </figure>
            <p>
              Regresas las piezas al marco, las empujas a un lado y mides el hueco que sobra. El marco también se agrandó, así que
              el hueco vale 11 kerfs.
            </p>
            <Formula>{'kerf = {hueco} / 11'}</Formula>
          </Tarjeta>
        </div>
        <div className="rejilla-fotos" style={{ marginTop: 20 }}>
          <Figura ruta="2019/rect.webp" />
          <Figura ruta="2019/20190206_171302.webp" />
          <Figura ruta="grupo/medicionesdeprueba.webp" />
        </div>
      </Bloque>

      <Bloque>
        <GeneradorTira />
        <CalculadoraKerf />
      </Bloque>

      <Bloque titulo="El kerf cambia">
        <p>
          Cuatro mediciones en las mismas máquinas, cuatro valores distintos. El kerf depende de la máquina, del tubo, de la
          velocidad, del lote de material y de la forma de medir. Por eso se mide antes de cada proyecto.
        </p>
        <div className="table-wrap">
          <table>
            <caption className="sr-only">Valores de kerf total reportados</caption>
            <thead>
              <tr>
                <th scope="col">Fuente</th>
                <th scope="col">Material</th>
                <th scope="col" className="num">Kerf total (mm)</th>
              </tr>
            </thead>
            <tbody>
              {kerf.reportados.map((r, i) => (
                <tr key={i}>
                  <td>
                    {r.autor}
                    <br />
                    <small className="muted">
                      {r.fuente}
                      {r.nota && ` · ${r.nota}`}
                    </small>
                  </td>
                  <td>{r.material}</td>
                  <td className="num">
                    {r.aproximado ? '≈ ' : ''}
                    {formatear(r.kerf, 3)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Bloque>

      <Bloque titulo="Cuando el kerf se aplica al revés">
        <div className="rejilla-2">
          <div>
            <p>
              Daniel Peña Cruz diseñó un kit de esferas con ranuras. Tomó en cuenta el kerf, pero lo restó donde tenía que
              sumarlo. Sus piezas no embonaban y necesitó <strong>9 cortes de prueba</strong> para llegar a un ajuste
              aceptable.
            </p>
            <p>
              Lo valioso es que lo documentó. Un error anotado te ahorra cortes a ti y al siguiente que use la máquina.
            </p>
            <p className="muted">
              Fuente:{' '}
              <a href="https://fabacademy.org/2026/labs/puebla/students/daniel-penyacruz/assignments/week03.html" target="_blank" rel="noreferrer">
                Daniel Peña Cruz, Fab Academy 2026
              </a>
              , CC BY-NC.
            </p>
          </div>
          <Figura ruta="daniel/cutter13.webp" />
        </div>
      </Bloque>

      <Bloque titulo="Calcula tu ranura y pruébala">
        <CalculadoraRanura />
        <SimuladorEnsamble />
        <div className="rejilla-2">
          <Figura ruta="grupo/pruebasdetolerancias.webp" />
          <p>
            Un peine de holguras te deja probar varias ranuras en un solo corte: dibuja ranuras de anchos distintos, rotula cada
            una y quédate con la que ajusta mejor con tu material.
          </p>
        </div>
      </Bloque>
    </Seccion>
  )
}
