import Seccion from '../components/Seccion.jsx'
import PasoAPaso from '../tools/PasoAPaso.jsx'

export default function UsaMaquina() {
  return (
    <Seccion
      id="usa-la-maquina"
      numero={5}
      titulo="Usa la máquina"
      idea="Cinco fases, siempre en el mismo orden. Abre esta lista en tu celular y ve marcando."
    >
      <PasoAPaso />
    </Seccion>
  )
}
