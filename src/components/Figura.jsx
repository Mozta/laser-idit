import { useRef } from 'react'
import creditos from '../data/creditos.json'
import './Figura.css'

export const rutaImagen = (ruta) => `${import.meta.env.BASE_URL}img/${ruta}`

export function credito(ruta) {
  const img = creditos.imagenes[ruta]
  if (!img) throw new Error(`Imagen sin registro en creditos.json: ${ruta}`)
  return { ...img, fuente: creditos.fuentes[img.fuente] }
}

function Credito({ fuente }) {
  return (
    <span className="figura-credito">
      <a href={fuente.url} target="_blank" rel="noreferrer">
        {fuente.autor}
      </a>
      {fuente.licencia.startsWith('CC') ? `, ${fuente.licencia}` : ''}
    </span>
  )
}

export default function Figura({ ruta, pie, className = '', prioridad = false, recorte }) {
  const dialogo = useRef(null)
  const img = credito(ruta)
  const texto = pie ?? img.pie
  return (
    <figure className={`figura ${className}`}>
      <button
        type="button"
        className="figura-boton"
        onClick={() => dialogo.current?.showModal()}
        aria-label={`Ampliar: ${img.alt}`}
      >
        <img
          src={rutaImagen(ruta)}
          alt={img.alt}
          width={img.ancho}
          height={img.alto}
          loading={prioridad ? 'eager' : 'lazy'}
          decoding="async"
          style={recorte ? { aspectRatio: recorte, objectFit: 'cover' } : undefined}
        />
      </button>
      <figcaption>
        {texto && <span>{texto} </span>}
        <Credito fuente={img.fuente} />
      </figcaption>
      <dialog
        ref={dialogo}
        className="figura-dialogo"
        onClick={(e) => e.target === dialogo.current && dialogo.current.close()}
        aria-label={img.alt}
      >
        <img src={rutaImagen(ruta)} alt={img.alt} width={img.ancho} height={img.alto} />
        <p>
          {texto && <span>{texto} </span>}
          <Credito fuente={img.fuente} />
        </p>
        <button type="button" className="btn figura-cerrar" onClick={() => dialogo.current.close()}>
          Cerrar
        </button>
      </dialog>
    </figure>
  )
}
