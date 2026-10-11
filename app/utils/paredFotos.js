// La pared del hero en las pantallas táctiles: sus fotos ya horneadas (PARED_HERO, las hace
// scripts/hornear-paredes.mjs), fundidas con el scroll en un lienzo 2D. El móvil no calcula nada:
// cuando pintaba el shader del moho (aunque fuera una vez por foto), la GPU tardaba segundos en cada
// una, el driver las cortaba a medias (la pared salía en franjas) y la página se congelaba.
// Primero la sucia (la que se ve al entrar) y después las demás, sin prisa: la limpia y la del medio
// antes, y luego rellenando huecos; mientras falte alguna se funden las dos más cercanas que haya.
// Misma interfaz que crearParedDanada. La foto cubre el lienzo con cubrir() (centrada y apoyada
// abajo): el hero pone el enchufe y las anotaciones encima con la misma cuenta.
import { PARED_HERO, cubrir } from './paredesHorneadas.js'

// Orden en que se piden las fotos 1..n-1: la última, la del medio y cada hueco por la mitad
function ordenDeFotos(n) {
  const orden = [n - 1]
  const tramos = [[0, n - 1]]
  while (tramos.length) {
    const [a, b] = tramos.shift()
    if (b - a < 2) continue
    const m = (a + b) >> 1
    orden.push(m)
    tramos.push([a, m], [m, b])
  }
  return orden
}

function cargarFoto(src, prioridad) {
  const img = new Image()
  img.decoding = 'async'
  img.fetchPriority = prioridad
  img.src = src
  return img.decode().then(() => img)
}

// Promesa con { medir, dibujar, destruir } cuando la primera foto está lista; null si no carga
export async function crearParedFotos(canvas) {
  const ctx = canvas.getContext('2d', { alpha: false })
  if (!ctx) return null
  const N = PARED_HERO.cuadros
  const aspecto = PARED_HERO.ancho / PARED_HERO.alto
  const fotos = []
  let destruida = false
  let escala = 1
  let caja = { x: 0, y: 0, w: 1, h: 1 }
  let pUltimo = 0
  let pPintado = -1

  try {
    fotos[0] = await cargarFoto(PARED_HERO.archivo(0), 'high')
  } catch {
    return null
  }

  function pintar(p) {
    const x = Math.min(1, Math.max(0, p)) * (N - 1)
    let a = Math.floor(x)
    while (a > 0 && !fotos[a]) a--
    let b = Math.ceil(x)
    while (b < N - 1 && !fotos[b]) b++
    if (!fotos[b]) b = a
    const t = b > a ? (x - a) / (b - a) : 0
    ctx.globalAlpha = 1
    ctx.drawImage(fotos[a], caja.x, caja.y, caja.w, caja.h)
    if (t > 0.01) {
      ctx.globalAlpha = t
      ctx.drawImage(fotos[b], caja.x, caja.y, caja.w, caja.h)
      ctx.globalAlpha = 1
    }
    pPintado = p
  }

  function medir() {
    escala = Math.min(window.devicePixelRatio || 1, 2)
    const w = Math.max(1, canvas.clientWidth)
    const h = Math.max(1, canvas.clientHeight)
    const ancho = Math.round(w * escala)
    const alto = Math.round(h * escala)
    if (canvas.width !== ancho || canvas.height !== alto) {
      canvas.width = ancho
      canvas.height = alto
      ctx.imageSmoothingQuality = 'high'
    }
    caja = cubrir(aspecto, ancho, alto)
    pPintado = -1
  }

  function dibujar(p) {
    pUltimo = p
    if (Math.abs(p - pPintado) < 0.0005) return
    pintar(p)
  }

  function destruir() {
    destruida = true
    fotos.length = 0
  }

  // Las demás, una tras otra y con prioridad baja (no le quitan red al resto de la página)
  ;(async () => {
    for (const i of ordenDeFotos(N)) {
      if (destruida) return
      try {
        fotos[i] = await cargarFoto(PARED_HERO.archivo(i), 'low')
      } catch {
        continue
      }
      if (destruida) return
      pPintado = -1
      pintar(pUltimo)
    }
  })()

  medir()
  return { medir, dibujar, destruir }
}
