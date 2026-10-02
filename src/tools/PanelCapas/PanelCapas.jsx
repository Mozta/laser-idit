import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { Herramienta, Campo, Mensaje } from '../comun.jsx'
import { ordenTrabajo, revisarCapas } from '../../lib/capas.js'
import { leerNumero } from '../../lib/numeros.js'
import smartcarve from '../../data/smartcarve.json'
import parametros from '../../data/parametros.json'
import './PanelCapas.css'

// La pieza de ejemplo: un grabado, dos huecos y el contorno exterior.
const OBJETOS = [
  { id: 'grabado', nombre: 'Grabado', tipo: 'grabado', d: 'M114 70h32v32h-32z M130 80a6 6 0 1 0 0.01 0' },
  { id: 'redondo', nombre: 'Hueco redondo', tipo: 'hueco', d: 'M70 64a22 22 0 1 0 0.01 0' },
  { id: 'ranura', nombre: 'Ranura', tipo: 'hueco', d: 'M172 58h8v62h-8z' },
  { id: 'contorno', nombre: 'Contorno', tipo: 'contorno', d: 'M20 20H100V32H140V20H220V140H20Z' },
]

const TIPO = { grabado: 'grabar', hueco: 'cortar', contorno: 'cortar' }

const capasIniciales = () => smartcarve.capas.map((c) => ({ ...c, procesar: true, max: '', min: '', vel: '' }))

function Dibujo({ objetos, capas, seleccion, alElegir, turnos, simulando }) {
  const color = (o) => capas.find((c) => c.id === o.capa).color
  const turnoDe = (o) => turnos.findIndex((t) => t.objetos.some((x) => x.id === o.id))
  return (
    <svg viewBox="0 0 240 160" className="pc-dibujo" role="img" aria-label="Área de trabajo con la pieza de ejemplo. Cada objeto se dibuja en el color de su capa.">
      <rect x="0" y="0" width="240" height="160" fill="#f4f4f2" />
      {objetos.map((o) => {
        const turno = turnoDe(o)
        const activo = seleccion === o.id
        return (
          <g key={o.id} onClick={() => alElegir(o.id)} className="pc-objeto">
            <path d={o.d} fill="none" stroke="transparent" strokeWidth="10" />
            {activo && <path d={o.d} fill="none" stroke="#ffdb2a" strokeWidth="5" strokeLinejoin="round" />}
            <motion.path
              key={`${o.id}-${simulando}`}
              d={o.d}
              fill="none"
              stroke={color(o)}
              strokeWidth={o.tipo === 'grabado' ? 1.4 : 1.8}
              strokeDasharray={o.tipo === 'grabado' ? '2 1.5' : undefined}
              strokeLinejoin="round"
              initial={simulando ? { pathLength: 0, opacity: turno < 0 ? 0.25 : 1 } : false}
              animate={{ pathLength: 1, opacity: turno < 0 && simulando ? 0.25 : 1 }}
              transition={{ duration: 0.9, delay: simulando && turno >= 0 ? turno * 1.1 : 0, ease: 'easeInOut' }}
            />
          </g>
        )
      })}
    </svg>
  )
}

export default function PanelCapas() {
  const [capas, setCapas] = useState(capasIniciales)
  const [objetos, setObjetos] = useState(() => OBJETOS.map((o) => ({ ...o, capa: 1 })))
  const [objSel, setObjSel] = useState('contorno')
  const [capaSel, setCapaSel] = useState(3)
  const [simulando, setSimulando] = useState(0)

  const capasNum = useMemo(
    () => capas.map((c) => ({ ...c, prioridad: leerNumero(c.prioridad), max: leerNumero(c.max), min: leerNumero(c.min), vel: leerNumero(c.vel) })),
    [capas],
  )
  const turnos = ordenTrabajo(objetos, capasNum)
  const revision = revisarCapas(objetos, capasNum)
  const capa = capas.find((c) => c.id === capaSel)
  const obj = objetos.find((o) => o.id === objSel)

  const cambiarCapa = (id, campo, valor) => setCapas((cs) => cs.map((c) => (c.id === id ? { ...c, [campo]: valor } : c)))
  const aplicar = () => {
    setObjetos((os) => os.map((o) => (o.id === objSel ? { ...o, capa: capaSel } : o)))
    setSimulando(0)
  }
  const reiniciar = () => {
    setCapas(capasIniciales())
    setObjetos(OBJETOS.map((o) => ({ ...o, capa: 1 })))
    setSimulando(0)
  }
  const corte = parametros.reportados[0]
  const grabado = parametros.grabado[0]

  return (
    <Herramienta
      id="panel-capas"
      titulo="Asigna capas como en SmartCarve"
      descripcion="Cada color es una capa con su prioridad, su potencia y su velocidad. Elige un objeto, elige un color y aplícalo (en SmartCarve es clic derecho en el color › Apply to picked object). Luego simula el orden en que va a trabajar la máquina."
    >
      <div className="pc-rejilla">
        <div className="pc-izquierda">
          <p className="pc-titulo kicker">Objetos</p>
          <ul className="pc-objetos">
            {objetos.map((o) => {
              const c = capas.find((x) => x.id === o.capa)
              return (
                <li key={o.id}>
                  <button type="button" aria-pressed={objSel === o.id} onClick={() => setObjSel(o.id)}>
                    <span className="pc-muestra" style={{ background: c.color }} aria-hidden="true" />
                    <span>{o.nombre}</span>
                    <small>
                      capa {o.capa} · {TIPO[o.tipo]}
                    </small>
                  </button>
                </li>
              )
            })}
          </ul>
          <figure className="pc-area">
            <Dibujo objetos={objetos} capas={capas} seleccion={objSel} alElegir={setObjSel} turnos={turnos} simulando={simulando} />
            <figcaption className="muted">Grabado en línea punteada. Toca un objeto para seleccionarlo.</figcaption>
          </figure>
        </div>

        <div className="pc-derecha">
          <p className="pc-titulo kicker">Control Panel › Layer</p>
          <div className="pc-tabla" role="table" aria-label="Capas">
            <div className="pc-fila pc-cabeza" role="row">
              <span role="columnheader">ID</span>
              <span role="columnheader">Color</span>
              <span role="columnheader">Prior</span>
              <span role="columnheader">Process</span>
            </div>
            {capas.map((c) => (
              <div key={c.id} role="row" className={`pc-fila${capaSel === c.id ? ' activa' : ''}`}>
                <span role="cell">
                  <button type="button" className="pc-elegir" aria-pressed={capaSel === c.id} onClick={() => setCapaSel(c.id)} aria-label={`Elegir capa ${c.id}`}>
                    {c.id}
                  </button>
                </span>
                <span role="cell">
                  <button type="button" className="pc-color" style={{ background: c.color }} onClick={() => setCapaSel(c.id)} aria-label={`Color de la capa ${c.id}`} />
                </span>
                <span role="cell">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={c.prioridad}
                    onChange={(e) => cambiarCapa(c.id, 'prioridad', e.target.value)}
                    aria-label={`Prioridad de la capa ${c.id}`}
                  />
                </span>
                <span role="cell">
                  <button
                    type="button"
                    className={`pc-proceso${c.procesar ? '' : ' no'}`}
                    aria-pressed={c.procesar}
                    onClick={() => cambiarCapa(c.id, 'procesar', !c.procesar)}
                    aria-label={`Procesar capa ${c.id}`}
                  >
                    {c.procesar ? 'Yes' : 'No'}
                  </button>
                </span>
              </div>
            ))}
          </div>

          <div className="pc-parametros">
            <p className="pc-titulo kicker">
              Layer Parameter · capa {capa.id} <span className="pc-muestra" style={{ background: capa.color }} aria-hidden="true" />
            </p>
            <div className="campos">
              <Campo etiqueta="Max. Power" unidad="%" valor={capa.max} alCambiar={(v) => cambiarCapa(capa.id, 'max', v)} />
              <Campo etiqueta="Min. Power" unidad="%" valor={capa.min} alCambiar={(v) => cambiarCapa(capa.id, 'min', v)} />
              <Campo etiqueta="Work Speed" unidad="mm/s" valor={capa.vel} alCambiar={(v) => cambiarCapa(capa.id, 'vel', v)} />
            </div>
            <p className="nota-prueba">
              Como referencia, en 2019 el corte fue {corte.max} / {corte.min} / {corte.velocidad} y el grabado {grabado.max} /{' '}
              {grabado.min} / {grabado.velocidad} en MDF de 3 mm. Son puntos de partida: tu prueba manda.
            </p>
          </div>
        </div>
      </div>

      <div className="pc-acciones">
        <button type="button" className="btn btn-primary btn-ajustable" onClick={aplicar}>
          Aplicar capa {capaSel} a «{obj.nombre}»
        </button>
        <button type="button" className="btn" onClick={() => setSimulando((s) => s + 1)}>
          Simular orden
        </button>
        <button type="button" className="btn" onClick={reiniciar}>
          Reiniciar
        </button>
      </div>

      <div className="pc-resultado" aria-live="polite">
        <ol className="pc-turnos">
          {turnos.map((t, i) => (
            <li key={t.capa}>
              <span className="pc-num">{i + 1}</span>
              <span className="pc-muestra" style={{ background: capas.find((c) => c.id === t.capa).color }} aria-hidden="true" />
              <span>
                Capa {t.capa} (prioridad {t.prioridad}): {t.objetos.map((o) => o.nombre).join(', ')}
              </span>
            </li>
          ))}
        </ol>
        {revision.listo ? (
            <Mensaje tono="teal" key="listo">
              Orden correcto: grabado, huecos y al final el contorno. En la máquina, confirma con Go Scale.
            </Mensaje>
          ) : (
            revision.hallazgos.map((h, i) => (
              <Mensaje key={`${h.id}-${i}`} tono={h.nivel === 'error' ? 'rose' : 'amber'}>
                {h.mensaje}
              </Mensaje>
            ))
          )}
      </div>

      <p className="nota-prueba">
        Las prioridades de inicio son las que muestra una captura de SmartCarve en el IDIT: el rojo (capa 3) va primero y el azul
        (capa 1) en quinto lugar. En la máquina pueden estar distintas; revísalas cada vez. Si grabas rellenos o imágenes,
        SmartCarve usa otro modo de proceso: ponlos en una capa aparte de las líneas de corte.
      </p>
    </Herramienta>
  )
}
