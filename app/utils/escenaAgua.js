// «How we work»: una estancia inundada, vista de frente, que se vacía con el scroll. Todo en un
// lienzo 2D (barato también en el móvil): el cerco que deja el agua en la pared, el agua con su
// superficie en movimiento, la luz que hace dentro (cáusticas), las burbujas, las gotas de la
// gotera con sus ondas, el aire de los ventiladores y el suelo mojado. La pared, el zócalo y el
// suelo son CSS (no cambian): esto pinta encima. Medidas en px CSS; alturas, en fracción del alto.

export const SUELO = 0.08     // alto del suelo (lo mismo que el CSS)
export const ZOCALO = 0.035   // alto del zócalo, encima del suelo

function semilla(n) {
  let s = n
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 }
}

// La luz que hace el agua por dentro: una red de líneas brillantes (los bordes de unas celdas de
// Voronoi) que se repite sin costuras. Se calcula una vez, en pequeño
function texturaCausticas(n = 128, puntos = 22) {
  const azar = semilla(11)
  const p = Array.from({ length: puntos }, () => [azar() * n, azar() * n])
  const img = new ImageData(n, n)
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      let d1 = 1e9
      let d2 = 1e9
      for (const [px, py] of p) {
        let dx = Math.abs(x - px)
        let dy = Math.abs(y - py)
        dx = Math.min(dx, n - dx)
        dy = Math.min(dy, n - dy)
        const d = dx * dx + dy * dy
        if (d < d1) { d2 = d1; d1 = d } else if (d < d2) d2 = d
      }
      const v = Math.max(0, 1 - (Math.sqrt(d2) - Math.sqrt(d1)) / 3)
      const i = (y * n + x) * 4
      img.data[i] = img.data[i + 1] = img.data[i + 2] = 255
      img.data[i + 3] = Math.round(v * v * 255)
    }
  }
  const c = document.createElement('canvas')
  c.width = c.height = n
  c.getContext('2d').putImageData(img, 0, 0)
  return c
}

// Un borde irregular pero fijo (el cerco no tiembla): suma de senos con fases fijas
const borde = (x) => Math.sin(x * 0.011 + 1.3) * 7 + Math.sin(x * 0.037 + 0.4) * 3 + Math.sin(x * 0.091 + 2.2) * 1.4

export function crearAgua(canvas) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  const textura = texturaCausticas()
  const patron = ctx.createPattern(textura, 'repeat')
  let w = 1
  let h = 1
  let escala = 1
  const azar = semilla(5)
  const burbujas = Array.from({ length: 16 }, () => ({ x: azar(), y: azar(), r: 1.5 + azar() * 3, v: 30 + azar() * 50, f: azar() * 6 }))
  let gota = null
  let siguienteGota = 0.6
  const ondas = []

  function medir() {
    escala = Math.min(window.devicePixelRatio || 1, 1.5)
    w = Math.max(1, canvas.clientWidth)
    h = Math.max(1, canvas.clientHeight)
    canvas.width = Math.round(w * escala)
    canvas.height = Math.round(h * escala)
  }

  // La superficie del agua en x: tres olas que se cruzan
  function ola(x, y0, t, a) {
    return y0 + a * (Math.sin(x * 0.012 + t * 1.5) * 0.6 + Math.sin(x * 0.027 - t * 2.2) * 0.3 + Math.sin(x * 0.053 + t * 3.1) * 0.1)
  }

  function trazarAgua(y0, t, a, desfase = 0) {
    ctx.beginPath()
    ctx.moveTo(0, h)
    for (let x = 0; x <= w + 12; x += 12) ctx.lineTo(x, ola(x + desfase, y0, t, a))
    ctx.lineTo(w, h)
    ctx.closePath()
  }

  function trazarSuperficie(y0, t, a) {
    ctx.beginPath()
    for (let x = 0; x <= w + 12; x += 12) {
      const y = ola(x, y0, t, a)
      if (x) ctx.lineTo(x, y)
      else ctx.moveTo(x, y)
    }
  }

  // El cerco de la pared: la mancha hasta donde llegó el agua («marca»), su línea y lo que trepó
  // por encima. «pintado»: hasta dónde ha pasado ya la pintura nueva (0..1, de izquierda a derecha)
  function pintarMancha(e) {
    const yMarca = h * (1 - e.marca)
    const ySuelo = h * (1 - SUELO)
    const desde = e.pintado * w
    if (desde >= w) return
    ctx.save()
    ctx.beginPath()
    ctx.rect(desde, 0, w - desde, h)
    ctx.clip()
    ctx.globalAlpha = e.mancha
    // la mancha
    ctx.beginPath()
    ctx.moveTo(0, ySuelo)
    for (let x = 0; x <= w + 8; x += 8) ctx.lineTo(x, yMarca + borde(x))
    ctx.lineTo(w, ySuelo)
    ctx.closePath()
    const g = ctx.createLinearGradient(0, yMarca - 10, 0, ySuelo)
    g.addColorStop(0, 'rgba(150, 118, 76, .22)')
    g.addColorStop(1, 'rgba(120, 96, 64, .12)')
    ctx.fillStyle = g
    ctx.fill()
    // la línea del cerco, y otra más vieja debajo
    ctx.lineWidth = 2.2
    ctx.strokeStyle = 'rgba(128, 92, 52, .55)'
    ctx.beginPath()
    for (let x = 0; x <= w + 8; x += 8) ctx.lineTo(x, yMarca + borde(x))
    ctx.stroke()
    ctx.lineWidth = 1.4
    ctx.strokeStyle = 'rgba(128, 92, 52, .25)'
    ctx.beginPath()
    for (let x = 0; x <= w + 8; x += 8) ctx.lineTo(x, yMarca + 9 + borde(x + 300) * 0.6)
    ctx.stroke()
    // lo que trepó por la pared por encima del cerco
    for (const [fx, fr] of [[0.18, 0.09], [0.55, 0.07], [0.84, 0.1]]) {
      const cx = fx * w
      const r = fr * Math.max(w, h) * 0.6
      const m = ctx.createRadialGradient(cx, yMarca, 0, cx, yMarca, r)
      m.addColorStop(0, 'rgba(150, 118, 76, .16)')
      m.addColorStop(1, 'rgba(150, 118, 76, 0)')
      ctx.fillStyle = m
      ctx.fillRect(cx - r, yMarca - r, r * 2, r)
    }
    // la mancha de la gotera, arriba
    const gx = w * 0.72
    const mg = ctx.createRadialGradient(gx, 0, 0, gx, 0, 70)
    mg.addColorStop(0, 'rgba(128, 92, 52, .35)')
    mg.addColorStop(1, 'rgba(128, 92, 52, 0)')
    ctx.fillStyle = mg
    ctx.fillRect(gx - 70, 0, 140, 70)
    ctx.restore()
    // el borde de la pintura nueva, que brilla al pasar
    if (e.pintado > 0 && e.pintado < 1) {
      const b = ctx.createLinearGradient(desde - 70, 0, desde + 4, 0)
      b.addColorStop(0, 'rgba(255, 255, 255, 0)')
      b.addColorStop(1, 'rgba(255, 255, 255, .7)')
      ctx.fillStyle = b
      ctx.fillRect(desde - 70, 0, 74, h * (1 - SUELO - ZOCALO))
    }
  }

  function pintarAgua(e, t) {
    const y0 = h * (1 - e.nivel)
    if (y0 >= h - 1) return
    const a = (4 + e.agitacion * 9) * Math.min(1, e.nivel * 12)
    // la ola de atrás, más clara: da fondo a la superficie
    trazarAgua(y0 - 4, t * 0.8, a * 0.8, 180)
    ctx.fillStyle = 'rgba(120, 180, 236, .35)'
    ctx.fill()
    // el agua
    trazarAgua(y0, t, a)
    const g = ctx.createLinearGradient(0, y0 - a, 0, h)
    g.addColorStop(0, 'rgba(84, 156, 226, .62)')
    g.addColorStop(0.35, 'rgba(38, 112, 196, .74)')
    g.addColorStop(1, 'rgba(14, 62, 128, .88)')
    ctx.fillStyle = g
    ctx.fill()
    ctx.save()
    ctx.clip()
    // la luz que hace dentro: dos capas que se mueven en sentidos distintos
    ctx.globalCompositeOperation = 'lighter'
    for (const [s, vx, vy, alfa] of [[2.6, 14, 6, 0.16], [3.8, -10, 9, 0.1]]) {
      patron.setTransform(new DOMMatrix().translate(t * vx, t * vy).scale(s))
      ctx.globalAlpha = alfa
      ctx.fillStyle = patron
      ctx.fillRect(0, y0 - a, w, h - y0 + a)
    }
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'
    // la franja clara bajo la superficie
    const f = ctx.createLinearGradient(0, y0 - a, 0, y0 + 26)
    f.addColorStop(0, 'rgba(255, 255, 255, .22)')
    f.addColorStop(1, 'rgba(255, 255, 255, 0)')
    ctx.fillStyle = f
    ctx.fillRect(0, y0 - a, w, a + 26)
    // las burbujas
    ctx.strokeStyle = 'rgba(255, 255, 255, .5)'
    ctx.lineWidth = 1.2
    for (const b of burbujas) {
      const x = b.x * w + Math.sin(t * 2 + b.f) * 4
      const y = h - b.y * (h - y0)
      ctx.beginPath()
      ctx.arc(x, y, b.r, 0, Math.PI * 2)
      ctx.stroke()
    }
    ctx.restore()
    // la línea de la superficie, con su brillo
    trazarSuperficie(y0, t, a)
    ctx.strokeStyle = 'rgba(255, 255, 255, .8)'
    ctx.lineWidth = 1.8
    ctx.stroke()
  }

  // La gotera: una gota que cae y, al tocar el agua, sus ondas
  function pintarGotas(e, t, dt) {
    const y0 = h * (1 - e.nivel)
    const gx = w * 0.72
    if (e.goteo) {
      siguienteGota -= dt
      if (!gota && siguienteGota <= 0) { gota = { y: 0, v: 0 }; siguienteGota = 1.7 }
    }
    if (gota) {
      gota.v += 1600 * dt
      gota.y += gota.v * dt
      const ySup = e.nivel > 0.01 ? ola(gx, y0, t, 4) : h * (1 - SUELO)
      if (gota.y >= ySup) {
        ondas.push({ x: gx, r: 2, a: 0.9 }, { x: gx, r: -10, a: 0.6 })
        gota = null
      } else {
        ctx.fillStyle = 'rgba(120, 180, 236, .9)'
        ctx.beginPath()
        ctx.ellipse(gx, gota.y, 2.6, 4.2, 0, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    for (let i = ondas.length - 1; i >= 0; i--) {
      const o = ondas[i]
      o.r += 70 * dt
      o.a -= 0.75 * dt
      if (o.a <= 0) { ondas.splice(i, 1); continue }
      if (o.r <= 0 || e.nivel <= 0.01) continue
      ctx.strokeStyle = `rgba(255, 255, 255, ${o.a.toFixed(3)})`
      ctx.lineWidth = 1.4
      ctx.beginPath()
      ctx.ellipse(o.x, ola(o.x, y0, t, 4) + 2, o.r, o.r * 0.18, 0, 0, Math.PI * 2)
      ctx.stroke()
    }
  }

  // El suelo mojado cuando el agua ya se ha ido, y el aire de los ventiladores secando
  function pintarSecado(e, t) {
    const ySuelo = h * (1 - SUELO)
    if (e.sueloMojado > 0.01) {
      ctx.fillStyle = `rgba(30, 64, 110, ${(0.3 * e.sueloMojado).toFixed(3)})`
      ctx.fillRect(0, ySuelo, w, h - ySuelo)
      ctx.fillStyle = `rgba(255, 255, 255, ${(0.35 * e.sueloMojado).toFixed(3)})`
      ctx.fillRect(0, ySuelo + 2, w, 2)
    }
    if (e.aire > 0.01) {
      ctx.lineCap = 'round'
      for (let i = 0; i < 8; i++) {
        const largo = 110 + (i % 3) * 50
        const vuelta = w + largo + 200
        const x = ((t * (240 + i * 23) + i * 197) % vuelta) - largo - 100
        const y = h * (0.42 + (i % 4) * 0.11) + Math.sin(t * 1.4 + i) * 6
        const g = ctx.createLinearGradient(x, 0, x + largo, 0)
        g.addColorStop(0, 'rgba(26, 100, 200, 0)')
        g.addColorStop(1, `rgba(26, 100, 200, ${(0.28 * e.aire).toFixed(3)})`)
        ctx.strokeStyle = g
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.quadraticCurveTo(x + largo * 0.5, y - 8, x + largo, y)
        ctx.stroke()
      }
    }
  }

  // Dónde está la superficie en x en el último fotograma (para cortar el texto por la línea del agua)
  let ultima = { y0: Infinity, t: 0, a: 0 }
  const superficie = (x) => (ultima.y0 === Infinity ? Infinity : ola(x, ultima.y0, ultima.t, ultima.a))

  let antes = 0
  // e: { nivel, marca, agitacion, mancha, pintado, sueloMojado, aire, goteo }; t: segundos
  function dibujar(e, t) {
    const dt = Math.min(0.05, Math.max(0, t - antes))
    antes = t
    for (const b of burbujas) {
      b.y += (b.v * dt) / Math.max(60, h * e.nivel)
      if (b.y > 1) { b.y = 0; b.x = azar() }
    }
    const y0 = h * (1 - e.nivel)
    ultima = y0 >= h - 1 ? { y0: Infinity, t, a: 0 } : { y0, t, a: (4 + e.agitacion * 9) * Math.min(1, e.nivel * 12) }
    ctx.setTransform(escala, 0, 0, escala, 0, 0)
    ctx.clearRect(0, 0, w, h)
    if (e.mancha > 0.01) pintarMancha(e)
    pintarSecado(e, t)
    pintarAgua(e, t)
    pintarGotas(e, t, dt)
  }

  // Si queda algo moviéndose solo (para saber si hace falta seguir pintando)
  const quedaMovimiento = () => gota !== null || ondas.length > 0

  medir()
  return { medir, dibujar, quedaMovimiento, superficie }
}
