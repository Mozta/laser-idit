import { leerDxf } from './leer.js'
import { normalizar } from './normalizar.js'
import { analizarContornos } from './contornos.js'
import * as R from './revisiones.js'
import maquinasPorDefecto from '../../data/maquinas.json'

export const TOLERANCIA = { defecto: 0.01, maxima: 0.05 }

export const OPCIONES_DEFECTO = {
  material: { W: 600, H: 600 },
  espesor: NaN,
  kerf: NaN,
  velocidad: 25,
  tolerancia: TOLERANCIA.defecto,
}

// Factor a mm según $INSUNITS. Sin unidades se toma como mm, igual que SmartCarve.
export const A_MM = { 1: 25.4, 2: 304.8, 4: 1, 5: 10, 6: 1000 }

const ORDEN_NIVEL = { error: 0, aviso: 1, info: 2 }

export function resumen(hallazgos) {
  const errores = hallazgos.filter((h) => h.nivel === 'error').length
  const avisos = hallazgos.filter((h) => h.nivel === 'aviso').length
  if (errores) return { estado: 'errores', texto: 'Corrige los errores antes de cortar', errores, avisos }
  if (avisos) return { estado: 'avisos', texto: 'Revisa los avisos', errores, avisos }
  return { estado: 'listo', texto: 'Listo para cortar', errores, avisos }
}

/**
 * Revisa el texto de un DXF. Nunca lanza.
 * Regresa { hallazgos, resumen, trayectos, caja, analisis } (trayectos en mm, para la vista previa).
 */
export function validarDxf(texto, opcionesUsuario = {}) {
  const opciones = {
    ...OPCIONES_DEFECTO,
    maquinas: maquinasPorDefecto,
    ...opcionesUsuario,
  }
  opciones.tolerancia = Math.min(TOLERANCIA.maxima, Math.max(1e-4, opciones.tolerancia || TOLERANCIA.defecto))
  if (!(opciones.velocidad > 0)) opciones.velocidad = OPCIONES_DEFECTO.velocidad

  const lectura = leerDxf(texto)
  if (!lectura.ok) {
    const h = [{ id: '1', nivel: 'error', titulo: 'No se pudo leer', mensaje: 'No pude leer el archivo. Exporta como DXF ASCII.', motivo: lectura.motivo }]
    return { hallazgos: h, resumen: resumen(h), trayectos: [], caja: null, analisis: null }
  }

  try {
    const escala = A_MM[lectura.dxf.header?.$INSUNITS] ?? 1
    const norm = normalizar(lectura.dxf, { tolUnion: opciones.tolerancia, escala })
    const trayectos = norm.trayectos
    // Los trayectos repetidos se reportan en la revisión 5 y no cuentan como piezas aparte.
    const duplicados = R.buscarDuplicados(trayectos, opciones.tolerancia)
    const repetidos = new Set(duplicados.map(([, b]) => b))
    const unicos = trayectos.filter((t) => !repetidos.has(t.id))
    const analisis = analizarContornos(unicos, opciones.tolerancia)
    const cajaTotal = R.cajaDeTrayectos(trayectos)
    const ctx = { dxf: lectura.dxf, tipos: lectura.tipos, norm, trayectos, duplicados, analisis, cajaTotal, opciones }

    const hallazgos = []
    if (!trayectos.length)
      hallazgos.push({ id: '1a', nivel: 'error', titulo: 'Sin dibujo', mensaje: 'El archivo no tiene líneas que cortar.' })
    if (norm.problemas.bloquesFaltantes.length || norm.problemas.anidadoProfundo)
      hallazgos.push({
        id: '1b',
        nivel: 'aviso',
        titulo: 'Bloques',
        mensaje: 'No pude expandir algunos bloques (INSERT). Explota los bloques en tu programa antes de exportar.',
      })

    for (const revision of [
      R.revisarUnidades,
      R.revisarTamano,
      R.revisarAbiertos,
      R.revisarDuplicados,
      R.revisarElementos,
      R.revisarSplines,
      R.revisarDiminutos,
      R.revisarPiezas,
      R.revisarSeparacion,
      R.revisarRanuras,
      R.revisarCapas,
      R.revisarTiempo,
    ]) {
      if (!trayectos.length && revision !== R.revisarUnidades && revision !== R.revisarElementos) continue
      hallazgos.push(...revision(ctx))
    }
    hallazgos.sort((a, b) => ORDEN_NIVEL[a.nivel] - ORDEN_NIVEL[b.nivel])
    return { hallazgos, resumen: resumen(hallazgos), trayectos, caja: cajaTotal, analisis }
  } catch (e) {
    const h = [{ id: '1', nivel: 'error', titulo: 'No se pudo leer', mensaje: 'No pude leer el archivo. Exporta como DXF ASCII.', motivo: String(e?.message || e) }]
    return { hallazgos: h, resumen: resumen(h), trayectos: [], caja: null, analisis: null }
  }
}
