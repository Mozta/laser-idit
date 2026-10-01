import { puntoEn, finContornos } from '../../lib/trabajoCorte.js'

export const COLORES = {
  fondo: '#23232F',
  teal: '#3CC8B4',
  amber: '#F5B841',
  rose: '#F0627E',
  madera: '#8A6A48',
  maderaClara: '#A9855E',
}

function trazo(x, p, hasta) {
  x.beginPath()
  x.moveTo(p[0][0], p[0][1])
  const a = puntoEn(p, hasta)
  for (let i = 1; i < a.i; i++) x.lineTo(p[i][0], p[i][1])
  x.lineTo(a.pt[0], a.pt[1])
  x.stroke()
}

function relleno(x, p, color) {
  x.fillStyle = color
  x.beginPath()
  p.forEach((q, i) => (i ? x.lineTo(q[0], q[1]) : x.moveTo(q[0], q[1])))
  x.closePath()
  x.fill()
}

// Dibuja el trabajo en el instante t (segundos de animación).
// escena: { W, H, lamina: [x, y, w, h], rieles: [x0, x1], desplazamiento: [dx, dy] }
export function crearDibujante(trabajo, escena) {
  const humo = []
  const cierres = finContornos(trabajo)
  const desp = escena.desplazamiento || [0, 0]
  const [lx, ly, lw, lh] = escena.lamina

  return function dibujar(x, t, dt = 0, { humo: conHumo = true } = {}) {
    x.clearRect(0, 0, escena.W, escena.H)
    x.fillStyle = COLORES.madera
    x.fillRect(lx, ly, lw, lh)
    x.strokeStyle = 'rgba(0,0,0,0.12)'
    x.lineWidth = 1
    for (let y = ly; y < ly + lh; y += 44) {
      x.beginPath()
      x.moveTo(lx, y)
      x.lineTo(lx + lw, y)
      x.stroke()
    }

    // Piezas sueltas: si el contorno se cerró antes que los huecos, la pieza se corre.
    const offset = trabajo.piezas.map((_, pi) => {
      if (trabajo.orden !== 'contorno' || t < cierres[pi]) return [0, 0]
      const u = Math.min(1, (t - cierres[pi]) / 0.35)
      const e = 1 - (1 - u) * (1 - u)
      return [desp[0] * e, desp[1] * e]
    })

    trabajo.piezas.forEach((pz, pi) => {
      if (t < cierres[pi]) return
      const [dx, dy] = offset[pi]
      relleno(x, pz.contorno, COLORES.fondo)
      x.save()
      x.translate(dx, dy)
      relleno(x, pz.contorno, COLORES.maderaClara)
      x.restore()
    })

    // Huecos terminados: se mueven con la pieza si se cortaron antes de soltarla.
    trabajo.ops.forEach((o) => {
      if (o.rol !== 'hueco' || t < o.t1) return
      const pegado = o.t1 <= cierres[o.pieza]
      const [dx, dy] = pegado ? offset[o.pieza] : [0, 0]
      x.save()
      x.translate(dx, dy)
      relleno(x, o.pts, COLORES.fondo)
      x.restore()
    })

    let cabeza = trabajo.inicio
    let cortando = false
    x.lineWidth = 4
    x.lineJoin = 'round'
    x.lineCap = 'round'
    trabajo.ops.forEach((o) => {
      if (t < o.t0) return
      const f = Math.min(1, (t - o.t0) / o.d)
      if (o.tipo === 'corte') {
        const pegado = o.rol === 'hueco' && o.t1 <= cierres[o.pieza]
        const [dx, dy] = pegado ? offset[o.pieza] : [0, 0]
        const malo = trabajo.orden === 'contorno' && o.rol === 'hueco'
        x.strokeStyle = malo ? COLORES.rose : COLORES.teal
        x.shadowColor = x.strokeStyle
        x.shadowBlur = 10
        x.save()
        x.translate(dx, dy)
        trazo(x, o.pts, f)
        x.restore()
        x.shadowBlur = 0
      }
      if (t < o.t1) {
        cabeza = puntoEn(o.pts, f).pt
        cortando = o.tipo === 'corte'
      }
    })
    if (t >= trabajo.total) cabeza = trabajo.inicio

    if (conHumo) {
      if (cortando && Math.random() < 0.7) {
        humo.push({ x: cabeza[0], y: cabeza[1], r: 4, a: 0.5, vx: (Math.random() - 0.5) * 20, vy: -25 - Math.random() * 20 })
      }
      for (let i = humo.length - 1; i >= 0; i--) {
        const s = humo[i]
        s.x += s.vx * dt
        s.y += s.vy * dt
        s.r += 12 * dt
        s.a -= 0.45 * dt
        if (s.a <= 0) {
          humo.splice(i, 1)
          continue
        }
        x.fillStyle = `rgba(200,198,210,${s.a})`
        x.beginPath()
        x.arc(s.x, s.y, s.r, 0, 7)
        x.fill()
      }
    }

    const [r0, r1] = escena.rieles
    x.fillStyle = '#4A4A62'
    x.fillRect(r0 + 10, cabeza[1] - 12, r1 - r0 - 20, 24)
    x.fillStyle = '#3A3A4E'
    x.fillRect(r0, ly - 40, 20, lh + 80)
    x.fillRect(r1 - 20, ly - 40, 20, lh + 80)
    x.fillStyle = '#8E8EA8'
    x.beginPath()
    x.roundRect(cabeza[0] - 26, cabeza[1] - 26, 52, 52, 10)
    x.fill()
    x.fillStyle = '#5A5A76'
    x.beginPath()
    x.arc(cabeza[0], cabeza[1], 13, 0, 7)
    x.fill()
    if (cortando) {
      const g = x.createRadialGradient(cabeza[0], cabeza[1], 0, cabeza[0], cabeza[1], 26)
      g.addColorStop(0, 'rgba(245,184,65,1)')
      g.addColorStop(0.35, 'rgba(245,184,65,0.6)')
      g.addColorStop(1, 'rgba(245,184,65,0)')
      x.fillStyle = g
      x.beginPath()
      x.arc(cabeza[0], cabeza[1], 26, 0, 7)
      x.fill()
    }
  }
}

export function prepararCanvas(canvas, W, H) {
  const d = window.devicePixelRatio || 1
  canvas.width = W * d
  canvas.height = H * d
  const x = canvas.getContext('2d')
  x.setTransform(d, 0, 0, d, 0, 0)
  return x
}

export function prefiereMenosMovimiento() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}
