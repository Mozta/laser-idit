import { Herramienta } from './comun.jsx'

// Lugar reservado mientras llega una herramienta que se carga aparte. Conserva el id para que los enlaces funcionen.
export default function Cargando({ id, titulo }) {
  return (
    <Herramienta id={id} titulo={titulo}>
      <p className="muted" role="status" style={{ minHeight: 240 }}>
        Cargando…
      </p>
    </Herramienta>
  )
}
