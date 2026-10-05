import { useMemo } from 'react'
import { motion } from 'motion/react'
import { puntosSvg } from './vista.js'

// Vista previa del dibujo. El eje Y del DXF va hacia arriba; en SVG se invierte.
export default function Vista({ trayectos, caja, seleccion }) {
  const marco = useMemo(() => {
    if (!caja) return null
    const lado = Math.max(caja.ancho, caja.alto, 1)
    const pad = lado * 0.05
    return { x: caja.minX - pad, y: -caja.maxY - pad, w: caja.ancho + 2 * pad, h: caja.alto + 2 * pad, paso: lado / 1500 }
  }, [caja])

  const lineas = useMemo(
    () => (marco ? trayectos.map((t) => ({ id: t.id, d: puntosSvg(t.pts, marco.paso) })) : []),
    [trayectos, marco],
  )

  if (!marco) return null
  const resaltados = new Set(seleccion?.trayectos || [])
  const hayResaltado = resaltados.size > 0
  const radio = Math.max(marco.w, marco.h) / 70
  const tono = seleccion ? `var(--${seleccion.nivel === 'error' ? 'rose' : seleccion.nivel === 'aviso' ? 'amber' : 'blue'})` : 'var(--accent)'

  return (
    <svg
      className="vdxf-svg"
      viewBox={`${marco.x} ${marco.y} ${marco.w} ${marco.h}`}
      role="img"
      aria-label={`Vista previa del dibujo: ${trayectos.length} trayectos, ${Math.round(caja.ancho * 100) / 100} por ${Math.round(caja.alto * 100) / 100} mm.${
        seleccion ? ` Resaltado: ${seleccion.titulo}.` : ''
      }`}
    >
      <g fill="none" strokeLinejoin="round" strokeLinecap="round">
        {lineas.map((l) => {
          const activo = resaltados.has(l.id)
          return (
            <polyline
              key={l.id}
              points={l.d}
              vectorEffect="non-scaling-stroke"
              stroke={activo ? tono : 'var(--text)'}
              strokeWidth={activo ? 3 : 1.4}
              opacity={hayResaltado && !activo ? 0.3 : 1}
            />
          )
        })}
      </g>
      {(seleccion?.marcas || []).map((m, i) => (
        <motion.circle
          key={`${seleccion.id}-${i}`}
          cx={m[0]}
          cy={-m[1]}
          r={radio}
          fill="none"
          stroke={tono}
          strokeWidth={2.5}
          vectorEffect="non-scaling-stroke"
          initial={{ opacity: 0, scale: 2.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, delay: Math.min(i, 20) * 0.03 }}
        />
      ))}
    </svg>
  )
}
