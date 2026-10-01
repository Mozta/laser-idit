import DxfParser from 'dxf-parser'
import log from 'loglevel'

// dxf-parser avisa por consola de cada código que no conoce; aquí no hace falta.
log.setLevel('silent')

const BINARIO = 'AutoCAD Binary DXF'

// Cuenta los tipos de entidad de la sección ENTITIES leyendo pares código/valor.
// dxf-parser descarta en silencio los tipos que no maneja (HATCH, IMAGE…), y aquí sí importan.
export function contarTipos(texto) {
  const lineas = texto.split(/\r\n|\r|\n/)
  const tipos = {}
  let enEntidades = false
  let esperaNombre = false
  for (let i = 0; i + 1 < lineas.length; i += 2) {
    const codigo = lineas[i].trim()
    const valor = lineas[i + 1].trim()
    if (codigo === '2' && esperaNombre) {
      enEntidades = valor === 'ENTITIES'
      esperaNombre = false
      continue
    }
    if (codigo !== '0') continue
    if (valor === 'SECTION') esperaNombre = true
    else if (valor === 'ENDSEC') enEntidades = false
    else if (enEntidades) tipos[valor] = (tipos[valor] || 0) + 1
  }
  return tipos
}

// Lee el texto de un DXF. Nunca lanza: regresa { ok: false, motivo } si no se puede.
export function leerDxf(texto) {
  if (typeof texto !== 'string' || texto.trim() === '') return { ok: false, motivo: 'vacio' }
  if (texto.startsWith(BINARIO) || texto.slice(0, 64).includes('\u0000')) return { ok: false, motivo: 'binario' }
  let dxf
  try {
    dxf = new DxfParser().parseSync(texto)
  } catch {
    return { ok: false, motivo: 'ilegible' }
  }
  if (!dxf || !Array.isArray(dxf.entities)) return { ok: false, motivo: 'ilegible' }
  return { ok: true, dxf, tipos: contarTipos(texto) }
}
