import { useState } from 'react'
import { Herramienta, Campo, Resultado, Mensaje, MENSAJE_INVALIDO } from './comun.jsx'
import Formula from '../components/Formula.jsx'
import { calcularRanura } from '../lib/ranura.js'
import { formatearFijo, leerNumero, escrito } from '../lib/numeros.js'

export default function CalculadoraRanura() {
  const [t, setT] = useState('2.85')
  const [k, setK] = useState('0.2')
  const [D, setD] = useState('80')
  const [d, setd] = useState('12')

  const r = calcularRanura({ t: leerNumero(t), k: leerNumero(k), exterior: leerNumero(D), hueco: leerNumero(d) })
  const valido = r && !r.error
  const f = (v) => (valido && Number.isFinite(v) ? formatearFijo(v, 2) : '—')

  return (
    <Herramienta
      id="calculadora-ranura"
      titulo="Calculadora de ranura"
      descripcion="Mide tu MDF con vernier y usa tu kerf. Te dice cuánto dibujar la ranura y cuánto cambian tus piezas."
    >
      <Formula>{'ranura = {espesor} − {kerf}'}</Formula>
      <div className="campos">
        <Campo etiqueta="Espesor real medido (t)" valor={t} alCambiar={setT} />
        <Campo etiqueta="Kerf total (k)" valor={k} alCambiar={setK} />
      </div>
      {r?.error && <Mensaje>{r.error}</Mensaje>}
      {!r && [t, k].every(escrito) && <Mensaje tono="amber">{MENSAJE_INVALIDO}</Mensaje>}
      <div className="resultados" aria-live="polite">
        <Resultado etiqueta="Dibuja la ranura de" valor={f(r?.ranura)} destacado />
      </div>
      <h4 style={{ marginTop: 24 }}>¿Cuánto cambian tus piezas?</h4>
      <div className="campos">
        <Campo etiqueta="Contorno exterior dibujado" valor={D} alCambiar={setD} />
        <Campo etiqueta="Hueco dibujado" valor={d} alCambiar={setd} />
      </div>
      <div className="resultados" aria-live="polite">
        <Resultado etiqueta="El contorno sale de" valor={f(r?.exterior)} tono="rose" destacado />
        <Resultado etiqueta="El hueco sale de" valor={f(r?.hueco)} tono="amber" destacado />
      </div>
      <p className="nota-prueba">Afuera se encoge, adentro crece. Confírmalo cortando una pieza de prueba antes del proyecto.</p>
    </Herramienta>
  )
}
