import { useId, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Herramienta, Campo, Mensaje } from '../comun.jsx'
import { leerNumero } from '../../lib/numeros.js'
import { useValidador } from './usarValidador.js'
import Vista from './Vista.jsx'
import '../../tools/svg.css'
import './ValidadorDxf.css'

const MAX_BYTES = 10 * 1024 * 1024
const NIVELES = [
  { nivel: 'error', titulo: 'Errores', tono: 'rose' },
  { nivel: 'aviso', titulo: 'Avisos', tono: 'amber' },
  { nivel: 'info', titulo: 'Información', tono: 'blue' },
]
const EJEMPLOS = [
  { archivo: 'prueba-kerf-100mm-10piezas-marco.dxf', ruta: 'dxf/', nombre: 'Tira de prueba' },
  { archivo: 'abierto.dxf', ruta: 'dxf/ejemplos/', nombre: 'Contorno abierto' },
  { archivo: 'duplicado.dxf', ruta: 'dxf/ejemplos/', nombre: 'Líneas repetidas' },
  { archivo: 'con-cotas.dxf', ruta: 'dxf/ejemplos/', nombre: 'Con cotas' },
  { archivo: 'piezas-juntas.dxf', ruta: 'dxf/ejemplos/', nombre: 'Piezas juntas' },
]

function Zona({ alCargar, cargando }) {
  const [encima, setEncima] = useState(false)
  const input = useRef(null)
  const id = useId()
  const recibir = (lista) => {
    const f = lista?.[0]
    if (f) alCargar(f)
  }
  return (
    <div
      className={`vdxf-zona${encima ? ' encima' : ''}`}
      onDragOver={(e) => {
        e.preventDefault()
        setEncima(true)
      }}
      onDragLeave={() => setEncima(false)}
      onDrop={(e) => {
        e.preventDefault()
        setEncima(false)
        recibir(e.dataTransfer.files)
      }}
    >
      <svg viewBox="0 0 48 48" aria-hidden="true" className="vdxf-icono">
        <path d="M12 6h17l9 9v27H12z" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M29 6v9h9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M25 37V22m-6 6 6-6 6 6" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="square" />
      </svg>
      <p className="vdxf-zona-texto">
        <strong>Arrastra tu archivo .dxf aquí</strong>
        <span className="muted">o elígelo de tu dispositivo (máx. 10 MB)</span>
      </p>
      <label htmlFor={id} className="btn btn-primary">
        {cargando ? 'Revisando…' : 'Elegir archivo'}
      </label>
      <input
        id={id}
        ref={input}
        type="file"
        accept=".dxf,application/dxf,image/vnd.dxf"
        className="sr-only"
        onChange={(e) => {
          recibir(e.target.files)
          e.target.value = ''
        }}
      />
    </div>
  )
}

function Resumen({ resumen, nombre }) {
  const tono = resumen.estado === 'errores' ? 'rose' : resumen.estado === 'avisos' ? 'amber' : 'teal'
  return (
    <motion.div
      className="vdxf-resumen"
      style={{ '--acento': `var(--${tono})` }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      role="status"
    >
      <strong>{resumen.texto}</strong>
      <span>
        {nombre} · {resumen.errores} {resumen.errores === 1 ? 'error' : 'errores'}, {resumen.avisos}{' '}
        {resumen.avisos === 1 ? 'aviso' : 'avisos'}
      </span>
    </motion.div>
  )
}

function Hallazgos({ hallazgos, seleccion, alElegir }) {
  return (
    <div className="vdxf-hallazgos">
      {NIVELES.map(({ nivel, titulo, tono }) => {
        const lista = hallazgos.filter((h) => h.nivel === nivel)
        if (!lista.length) return null
        return (
          <section key={nivel} style={{ '--acento': `var(--${tono})` }} aria-label={titulo}>
            <h4 className="vdxf-grupo">
              {titulo} <span>{lista.length}</span>
            </h4>
            <ul>
              {lista.map((h) => {
                const resaltable = !!(h.trayectos?.length || h.marcas?.length)
                const activo = seleccion === h
                return (
                  <li key={h.id}>
                    {resaltable ? (
                      <button
                        type="button"
                        className={`vdxf-hallazgo${activo ? ' activo' : ''}`}
                        aria-pressed={activo}
                        onClick={() => alElegir(activo ? null : h)}
                      >
                        <span className="vdxf-hallazgo-titulo">
                          {h.titulo}
                          <small>{activo ? 'Resaltado' : 'Ver en el dibujo'}</small>
                        </span>
                        <span className="vdxf-hallazgo-texto">{h.mensaje}</span>
                      </button>
                    ) : (
                      <div className="vdxf-hallazgo fijo">
                        <span className="vdxf-hallazgo-titulo">{h.titulo}</span>
                        <span className="vdxf-hallazgo-texto">{h.mensaje}</span>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
    </div>
  )
}

export default function ValidadorDxf() {
  const [archivo, setArchivo] = useState(null) // { nombre, texto }
  const [error, setError] = useState(null)
  const [seleccion, setSeleccion] = useState(null)
  const [t, setT] = useState('')
  const [k, setK] = useState('')
  const [W, setW] = useState('600')
  const [H, setH] = useState('600')
  const [v, setV] = useState('25')
  const [tol, setTol] = useState('0.01')
  const idTol = useId()

  const opciones = {
    espesor: leerNumero(t),
    kerf: leerNumero(k),
    material: { W: leerNumero(W) > 0 ? leerNumero(W) : 600, H: leerNumero(H) > 0 ? leerNumero(H) : 600 },
    velocidad: leerNumero(v) > 0 ? leerNumero(v) : 25,
    tolerancia: Number(tol),
  }
  const { cargando, resultado } = useValidador(archivo?.texto ?? null, opciones)

  const cargar = async (f) => {
    setSeleccion(null)
    if (!/\.dxf$/i.test(f.name)) {
      setError('Ese archivo no es .dxf. Exporta tu dibujo como DXF.')
      return
    }
    if (f.size > MAX_BYTES) {
      setError('El archivo pesa más de 10 MB. Revisa que no traiga imágenes, sombreados o geometría de más.')
      return
    }
    setError(null)
    const buf = await f.arrayBuffer()
    // latin1 conserva cada byte; así un DXF binario se reconoce por su encabezado.
    setArchivo({ nombre: f.name, texto: new TextDecoder('latin1').decode(buf) })
  }

  const cargarEjemplo = async (e) => {
    setSeleccion(null)
    setError(null)
    try {
      const r = await fetch(`${import.meta.env.BASE_URL}${e.ruta}${e.archivo}`)
      if (!r.ok) throw new Error()
      setArchivo({ nombre: e.archivo, texto: await r.text() })
    } catch {
      setError('No pude cargar el ejemplo. Revisa tu conexión.')
    }
  }

  return (
    <Herramienta
      id="validador-dxf"
      titulo="Revisa tu DXF antes de cortar"
      descripcion="Busca contornos abiertos, líneas repetidas, cotas, piezas muy juntas y más. Es un revisor que te avisa: al final, confirma siempre en SmartCarve con Go Scale."
    >
      <p className="vdxf-privacidad">Tu archivo no sale de tu navegador: nada se sube a ningún servidor.</p>

      <Zona alCargar={cargar} cargando={cargando} />

      <div className="vdxf-ejemplos">
        <span className="muted">¿Sin archivo a la mano? Prueba un ejemplo:</span>
        {EJEMPLOS.map((e) => (
          <button key={e.archivo} type="button" className="btn vdxf-chip" onClick={() => cargarEjemplo(e)}>
            {e.nombre}
          </button>
        ))}
      </div>

      <details className="vdxf-opciones">
        <summary>Opciones: espesor, kerf, material y velocidad</summary>
        <div className="campos">
          <Campo etiqueta="Espesor real (para ranuras)" valor={t} alCambiar={setT} placeholder="2.85" />
          <Campo etiqueta="Kerf total (para ranuras)" valor={k} alCambiar={setK} placeholder="0.2" />
          <Campo etiqueta="Material, ancho" valor={W} alCambiar={setW} />
          <Campo etiqueta="Material, alto" valor={H} alCambiar={setH} />
          <Campo etiqueta="Velocidad de corte" valor={v} alCambiar={setV} unidad="mm/s" />
          <div className="field">
            <label htmlFor={idTol}>Tolerancia de unión</label>
            <select id={idTol} value={tol} onChange={(e) => setTol(e.target.value)}>
              {[0.01, 0.02, 0.03, 0.05].map((x) => (
                <option key={x} value={x}>
                  {x} mm
                </option>
              ))}
            </select>
          </div>
        </div>
      </details>

      <AnimatePresence>{error && <Mensaje>{error}</Mensaje>}</AnimatePresence>

      {resultado && archivo && (
        <div className="vdxf-resultado" aria-busy={cargando}>
          <Resumen resumen={resultado.resumen} nombre={archivo.nombre} />
          <div className="vdxf-rejilla">
            <figure className="vdxf-vista">
              {resultado.trayectos.length ? (
                <Vista trayectos={resultado.trayectos} caja={resultado.caja} seleccion={seleccion} />
              ) : (
                <p className="muted vdxf-sin-vista">Sin dibujo que mostrar.</p>
              )}
              <figcaption className="muted">
                {seleccion ? `Resaltado: ${seleccion.titulo}. Toca otra vez para quitarlo.` : 'Toca un hallazgo para verlo en el dibujo.'}
              </figcaption>
            </figure>
            <Hallazgos hallazgos={resultado.hallazgos} seleccion={seleccion} alElegir={setSeleccion} />
          </div>
        </div>
      )}

      <details className="vdxf-limites">
        <summary>Lo que este revisor no ve</summary>
        <ul>
          <li>No detecta cruces de líneas dentro de un mismo contorno.</li>
          <li>La detección de ranuras es aproximada: busca huecos y muescas rectangulares con un ancho cercano a tu espesor.</li>
          <li>Las splines y elipses se aproximan con segmentos de 0.01 mm de error.</li>
          <li>No sustituye la revisión en SmartCarve: haz Go Scale antes de cortar.</li>
        </ul>
      </details>
    </Herramienta>
  )
}
