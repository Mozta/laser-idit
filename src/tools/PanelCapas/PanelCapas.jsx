import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Herramienta, Campo, Mensaje, Segmentado } from '../comun.jsx'
import { Palomita } from '../../components/Checklist.jsx'
import { ordenTrabajo, revisarCapas, progresoMisiones, capaSugerida, aplicarReferencia } from '../../lib/capas.js'
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
const OBJETOS_DE_MISION = { grabado: ['grabado'], huecos: ['redondo', 'ranura'], contorno: ['contorno'] }
const MODOS = [
  { valor: 'guiado', etiqueta: 'Guiado' },
  { valor: 'libre', etiqueta: 'Libre' },
]
const REFERENCIA = { corte: parametros.reportados[0], grabado: parametros.grabado[0] }

// Cada capa arranca con lo que dejó la sesión anterior, si se conoce.
const capasIniciales = () =>
  smartcarve.capas.map(({ heredados, ...c }) => ({
    ...c,
    procesar: true,
    max: heredados ? String(heredados.max) : '',
    min: heredados ? String(heredados.min) : '',
    vel: heredados ? String(heredados.vel) : '',
    heredado: !!heredados,
  }))
const objetosIniciales = () => OBJETOS.map((o) => ({ ...o, capa: 1 }))
const aNumeros = (capas) =>
  capas.map((c) => ({ ...c, prioridad: leerNumero(c.prioridad), max: leerNumero(c.max), min: leerNumero(c.min), vel: leerNumero(c.vel) }))
const esperar = (ms) => new Promise((r) => setTimeout(r, ms))

function Dibujo({ objetos, capas, seleccion, resaltados, alElegir, turnos, simulando }) {
  const color = (o) => capas.find((c) => c.id === o.capa).color
  const turnoDe = (o) => turnos.findIndex((t) => t.objetos.some((x) => x.id === o.id))
  return (
    <svg viewBox="0 0 240 160" className="pc-dibujo" role="img" aria-label="Área de trabajo con la pieza de ejemplo. Cada objeto se dibuja en el color de su capa.">
      <rect x="0" y="0" width="240" height="160" fill="#f4f4f2" />
      {objetos.map((o) => {
        const turno = turnoDe(o)
        const marcado = !simulando && (seleccion === o.id || resaltados.includes(o.id))
        return (
          <g key={o.id} onClick={() => alElegir(o.id)} className="pc-objeto">
            <path d={o.d} fill="none" stroke="transparent" strokeWidth="10" />
            {marcado && (
              <path
                d={o.d}
                fill="none"
                stroke="#ffdb2a"
                strokeWidth="5"
                strokeLinejoin="round"
                className={seleccion === o.id ? undefined : 'pc-pista-trazo'}
              />
            )}
            <motion.path
              key={`${o.id}-${simulando}`}
              d={o.d}
              fill="none"
              strokeWidth={o.tipo === 'grabado' ? 2.6 : 1.8}
              strokeOpacity={o.tipo === 'grabado' ? 0.45 : 1}
              strokeLinejoin="round"
              initial={simulando ? { pathLength: 0, opacity: turno < 0 ? 0.25 : 1, stroke: color(o) } : false}
              animate={{ pathLength: 1, opacity: turno < 0 && simulando ? 0.25 : 1, stroke: color(o) }}
              transition={{
                pathLength: { duration: 0.9, delay: simulando && turno >= 0 ? turno * 1.1 : 0, ease: 'easeInOut' },
                stroke: { duration: 0.35 },
              }}
            />
          </g>
        )
      })}
    </svg>
  )
}

function Misiones({ progreso, alPista, alMostrar, pista, ocupado, alSimular, notaContorno }) {
  const m = progreso.pasos[progreso.actual]
  return (
    <div className="pc-misiones">
      <ol className="pc-pasos">
        {progreso.pasos.map((p, i) => (
          <li key={p.id} className={p.hecho ? 'hecho' : i === progreso.actual ? 'actual' : ''}>
            <span className="pc-paso-num" aria-hidden="true">
              {p.hecho ? <Palomita /> : i + 1}
            </span>
            <span>
              {p.titulo}
              <span className="sr-only">{p.hecho ? ' (hecho)' : i === progreso.actual ? ' (ahora)' : ''}</span>
            </span>
          </li>
        ))}
      </ol>
      <AnimatePresence mode="wait">
        {progreso.completo ? (
          <motion.div key="fin" className="pc-mision" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} role="status">
            <p>
              <strong>Lo lograste.</strong> Grabado, huecos y contorno en orden, con potencia y velocidad revisadas. Simula el
              orden para verlo, o cambia a modo libre y prueba qué pasa si mueves algo.
            </p>
            <div className="pc-mision-botones">
              <button type="button" className="btn btn-primary" onClick={alSimular}>
                Simular orden
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div key={m.id} className="pc-mision" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} role="status">
            <p>
              <span className="pc-mision-num kicker">Paso {progreso.actual + 1} de 4</span> {m.texto}
              {m.id === 'parametros' && notaContorno && <span className="pc-mision-nota">{notaContorno}</span>}
            </p>
            <div className="pc-mision-botones">
              <button type="button" className="btn" aria-pressed={pista} onClick={alPista} disabled={ocupado}>
                {pista ? 'Ocultar pista' : 'Pista'}
              </button>
              <button type="button" className="btn" onClick={alMostrar} disabled={ocupado}>
                {ocupado ? 'Mostrando…' : 'Muéstrame'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function PanelCapas() {
  const [modo, setModo] = useState('guiado')
  const [capas, setCapas] = useState(capasIniciales)
  const [objetos, setObjetos] = useState(objetosIniciales)
  const [objSel, setObjSel] = useState('grabado')
  const [capaSel, setCapaSel] = useState(1)
  const [simulando, setSimulando] = useState(0)
  const [pista, setPista] = useState(false)
  const [ocupado, setOcupado] = useState(false)
  const [verTodos, setVerTodos] = useState(false)
  const [aviso, setAviso] = useState(null)
  const vivo = useRef(true)
  useEffect(() => {
    vivo.current = true
    return () => {
      vivo.current = false
    }
  }, [])

  const capasNum = useMemo(() => aNumeros(capas), [capas])
  const turnos = ordenTrabajo(objetos, capasNum)
  const revision = revisarCapas(objetos, capasNum)
  const progreso = progresoMisiones(objetos, capasNum)
  const guiado = modo === 'guiado'
  const mision = progreso.pasos[progreso.actual]
  const sugerida = guiado && !progreso.completo ? capaSugerida(mision.id, objetos, capasNum) : null
  const objetosPista = guiado && pista && mision ? OBJETOS_DE_MISION[mision.id] || [] : []
  const capa = capas.find((c) => c.id === capaSel)
  const obj = objetos.find((o) => o.id === objSel)

  // Al cambiar de misión se apaga la pista.
  useEffect(() => setPista(false), [progreso.actual])

  const cambiarCapa = (id, campo, valor) => setCapas((cs) => cs.map((c) => (c.id === id ? { ...c, [campo]: valor } : c)))
  // Editar un parámetro cuenta como revisarlo.
  const cambiarParametro = (id, campo, valor) =>
    setCapas((cs) => cs.map((c) => (c.id === id ? { ...c, [campo]: valor, heredado: false } : c)))
  const asignar = (objId, capaId) => {
    setObjetos((os) => os.map((o) => (o.id === objId ? { ...o, capa: capaId } : o)))
    setSimulando(0)
  }
  // Tocar un color aplica esa capa al objeto seleccionado, como clic derecho › Apply to picked object.
  const tocarColor = (capaId) => {
    setCapaSel(capaId)
    if (objSel) asignar(objSel, capaId)
  }
  const usarReferencia = () => {
    setCapas((cs) =>
      aplicarReferencia(objetos, aNumeros(cs), REFERENCIA).map((c, i) => {
        const original = cs[i]
        const cambio = c.max !== leerNumero(original.max) || c.heredado !== original.heredado
        return cambio ? { ...original, max: String(c.max), min: String(c.min), vel: String(c.vel), heredado: false } : original
      }),
    )
    setAviso('Valores de 2019 en MDF de 3 mm. Son un punto de partida: en la máquina se confirman con una prueba.')
  }
  const reiniciar = () => {
    setCapas(capasIniciales())
    setObjetos(objetosIniciales())
    setObjSel('grabado')
    setCapaSel(1)
    setSimulando(0)
    setAviso(null)
  }

  // Hace la misión actual paso a paso, para que se vea.
  const mostrar = async () => {
    if (!mision) return
    setOcupado(true)
    setPista(false)
    if (mision.id === 'parametros') {
      await esperar(300)
      if (vivo.current) usarReferencia()
    } else {
      const destino = sugerida
      for (const id of OBJETOS_DE_MISION[mision.id]) {
        if (!vivo.current || destino == null) break
        setObjSel(id)
        await esperar(600)
        setCapaSel(destino)
        await esperar(600)
        asignar(id, destino)
        await esperar(400)
      }
    }
    if (vivo.current) setOcupado(false)
  }

  // Explica por qué el paso 3 pudo cumplirse sin tocar el contorno.
  const contorno = objetos.find((o) => o.tipo === 'contorno')
  const capaContorno = capasNum.find((c) => c.id === contorno.capa)
  const notaContorno = `El contorno ya va al final: está en la capa ${capaContorno.id}, con prioridad ${capaContorno.prioridad}, mayor que la de los huecos.`

  const principal = revision.hallazgos[0]
  const resto = revision.hallazgos.length - 1

  return (
    <Herramienta
      id="panel-capas"
      titulo="Asigna capas como en SmartCarve"
      descripcion="Cada color es una capa con su prioridad, su potencia y su velocidad. Elige un objeto y toca el color de la capa (en SmartCarve es clic derecho en el color › Apply to picked object)."
    >
      <div className="pc-modo">
        <Segmentado grupo="pc-modo" etiqueta="Modo" opciones={MODOS} valor={modo} alCambiar={setModo} />
        <button type="button" className="btn" onClick={reiniciar} disabled={ocupado}>
          Reiniciar
        </button>
      </div>

      {guiado && (
        <Misiones
          progreso={progreso}
          pista={pista}
          ocupado={ocupado}
          alPista={() => setPista((v) => !v)}
          alMostrar={mostrar}
          alSimular={() => setSimulando((s) => s + 1)}
          notaContorno={notaContorno}
        />
      )}

      <div className="pc-rejilla">
        <div className="pc-izquierda">
          <p className="pc-titulo kicker">1 · Elige un objeto</p>
          <ul className="pc-objetos">
            {objetos.map((o) => {
              const c = capas.find((x) => x.id === o.capa)
              return (
                <li key={o.id}>
                  <button
                    type="button"
                    aria-pressed={objSel === o.id}
                    className={objetosPista.includes(o.id) ? 'pista' : undefined}
                    onClick={() => setObjSel(o.id)}
                    disabled={ocupado}
                  >
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
            <Dibujo
              objetos={objetos}
              capas={capas}
              seleccion={objSel}
              resaltados={objetosPista}
              alElegir={(id) => !ocupado && setObjSel(id)}
              turnos={turnos}
              simulando={simulando}
            />
            <figcaption className="muted">El grabado se ve tenue: marca la superficie sin atravesar. Toca un objeto para seleccionarlo.</figcaption>
          </figure>
        </div>

        <div className="pc-derecha">
          <p className="pc-titulo kicker">2 · Toca el color de la capa</p>
          <div className="pc-tabla" role="table" aria-label="Capas">
            <div className="pc-fila pc-cabeza" role="row">
              <span role="columnheader">ID</span>
              <span role="columnheader">Color</span>
              <span role="columnheader">Prior</span>
              <span role="columnheader">Process</span>
            </div>
            {capas.map((c) => (
              <div
                key={c.id}
                role="row"
                className={`pc-fila${capaSel === c.id ? ' activa' : ''}${pista && sugerida === c.id ? ' pista' : ''}`}
              >
                <span role="cell">
                  <button type="button" className="pc-elegir" aria-pressed={capaSel === c.id} onClick={() => setCapaSel(c.id)} aria-label={`Ver parámetros de la capa ${c.id}`} disabled={ocupado}>
                    {c.id}
                  </button>
                </span>
                <span role="cell">
                  <button
                    type="button"
                    className="pc-color"
                    style={{ background: c.color }}
                    onClick={() => tocarColor(c.id)}
                    aria-label={`Aplicar capa ${c.id} a «${obj?.nombre}»`}
                    title={`Aplicar capa ${c.id} a «${obj?.nombre}»`}
                    disabled={ocupado}
                  />
                </span>
                <span role="cell">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={c.prioridad}
                    onChange={(e) => cambiarCapa(c.id, 'prioridad', e.target.value)}
                    aria-label={`Prioridad de la capa ${c.id}`}
                    disabled={ocupado}
                  />
                </span>
                <span role="cell">
                  <button
                    type="button"
                    className={`pc-proceso${c.procesar ? '' : ' no'}`}
                    aria-pressed={c.procesar}
                    onClick={() => cambiarCapa(c.id, 'procesar', !c.procesar)}
                    aria-label={`Procesar capa ${c.id}`}
                    disabled={ocupado}
                  >
                    {c.procesar ? 'Yes' : 'No'}
                  </button>
                </span>
              </div>
            ))}
          </div>
          {pista && sugerida != null && (
            <p className="pc-pista-texto" role="status">
              Pista: la capa {sugerida} tiene prioridad {capas.find((c) => c.id === sugerida).prioridad}, la más baja disponible
              para este paso. Fíjate en el número de Prior, no en el color.
            </p>
          )}

          <div className={`pc-parametros${pista && mision?.id === 'parametros' ? ' pista' : ''}`}>
            <p className="pc-titulo kicker">
              3 · Layer Parameter · capa {capa.id} <span className="pc-muestra" style={{ background: capa.color }} aria-hidden="true" />
              {capa.heredado && <span className="pc-heredado">heredados</span>}
            </p>
            <div className="campos">
              <Campo etiqueta="Max. Power" unidad="%" valor={capa.max} alCambiar={(v) => cambiarParametro(capa.id, 'max', v)} />
              <Campo etiqueta="Min. Power" unidad="%" valor={capa.min} alCambiar={(v) => cambiarParametro(capa.id, 'min', v)} />
              <Campo etiqueta="Work Speed" unidad="mm/s" valor={capa.vel} alCambiar={(v) => cambiarParametro(capa.id, 'vel', v)} />
            </div>
            {capa.heredado && (
              <div className="pc-aviso-heredado">
                <p>Estos valores los dejó la sesión anterior. En la máquina, nunca cortes sin revisarlos.</p>
                <button type="button" className="btn" onClick={() => cambiarCapa(capa.id, 'heredado', false)}>
                  Confirmar valores
                </button>
              </div>
            )}
            <button type="button" className="btn btn-ajustable pc-referencia" onClick={usarReferencia} disabled={ocupado}>
              Usar valores de referencia en las capas que usas
            </button>
            <p className="nota-prueba">
              Referencia de 2019 en MDF de 3 mm: corte {REFERENCIA.corte.max} / {REFERENCIA.corte.min} / {REFERENCIA.corte.velocidad}, grabado{' '}
              {REFERENCIA.grabado.max} / {REFERENCIA.grabado.min} / {REFERENCIA.grabado.velocidad}. Son puntos de partida: tu prueba manda.
            </p>
            {aviso && <Mensaje tono="amber">{aviso}</Mensaje>}
          </div>
        </div>
      </div>

      <div className="pc-acciones">
        <button type="button" className="btn btn-ajustable" onClick={() => objSel && asignar(objSel, capaSel)} disabled={ocupado}>
          Aplicar capa {capaSel} a «{obj?.nombre}»
        </button>
        <button type="button" className="btn btn-primary" onClick={() => setSimulando((s) => s + 1)} disabled={ocupado}>
          Simular orden
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
          <Mensaje tono="teal">Orden correcto: grabado, huecos y al final el contorno. En la máquina, confirma con Go Scale.</Mensaje>
        ) : (
          <>
            <Mensaje tono={principal.nivel === 'error' ? 'rose' : 'amber'}>{principal.mensaje}</Mensaje>
            {resto > 0 && (
              <button type="button" className="pc-ver-todos" aria-expanded={verTodos} onClick={() => setVerTodos((v) => !v)}>
                {verTodos ? 'Ocultar' : `Ver ${resto === 1 ? 'el otro detalle' : `los otros ${resto} detalles`}`}
              </button>
            )}
            {verTodos &&
              revision.hallazgos.slice(1).map((h, i) => (
                <Mensaje key={`${h.id}-${i}`} tono={h.nivel === 'error' ? 'rose' : 'amber'}>
                  {h.mensaje}
                </Mensaje>
              ))}
          </>
        )}
      </div>

      <p className="nota-prueba">
        Las prioridades de inicio y los valores de la capa 1 son los que muestra una captura de SmartCarve en el IDIT: el rojo (capa
        3) va primero y el azul (capa 1) en quinto lugar. SmartCarve conserva lo que dejó la sesión anterior: revisa prioridades y
        parámetros cada vez. Si grabas rellenos o imágenes, SmartCarve usa otro modo de proceso: ponlos en una capa aparte de las
        líneas de corte.
      </p>
    </Herramienta>
  )
}
