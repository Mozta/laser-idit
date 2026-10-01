import { MotionConfig } from 'motion/react'
import Navegacion from './components/Navegacion.jsx'
import Pie from './components/Pie.jsx'
import Portada from './tools/cortadora/Portada.jsx'
import Maquinas from './sections/Maquinas.jsx'
import ComoCorta from './sections/ComoCorta.jsx'
import Kerf from './sections/Kerf.jsx'
import Archivo from './sections/Archivo.jsx'
import UsaMaquina from './sections/UsaMaquina.jsx'
import Seguridad from './sections/Seguridad.jsx'
import Materiales from './sections/Materiales.jsx'
import Galeria from './sections/Galeria.jsx'

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <Navegacion />
      <main id="contenido">
        <Portada />
        <Maquinas />
        <ComoCorta />
        <Kerf />
        <Archivo />
        <UsaMaquina />
        <Seguridad />
        <Materiales />
        <Galeria />
      </main>
      <Pie />
    </MotionConfig>
  )
}
