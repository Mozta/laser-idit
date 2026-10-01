// Genera los DXF de ejemplo que se descargan desde public/dxf/.
// Uso: node scripts/generar-dxf.js
import { writeFileSync, mkdirSync } from 'node:fs'
import { generarTiraDxf } from '../src/lib/tiraKerf.js'

mkdirSync('public/dxf', { recursive: true })
for (const marco of [false, true]) {
  const { texto, nombre } = generarTiraDxf({ L: 100, n: 10, a: 20, marco, m: 10 })
  writeFileSync(`public/dxf/${nombre}`, texto)
  console.log(`public/dxf/${nombre}`)
}
