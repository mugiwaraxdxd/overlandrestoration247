// La pared de la sección de noche: la misma pared, a oscuras, y una linterna que descubre lo que hay
// (cercos de agua y moho). La pared no cambia nunca: es una foto ya horneada (PAREDES_NOCHE, la hace
// scripts/hornear-paredes.mjs; una ancha y otra alta, la que mejor cubra) y cada fotograma Canvas 2D
// la dibuja y le pone encima la oscuridad con un hueco de luz (dos rellenos con degradado: casi
// gratis, también en el móvil). Antes se calculaba con un shader: en un móvil salía en bloques.
import { PAREDES_NOCHE, cubrir } from './paredesHorneadas.js'

const OSCURO = [11, 13, 16]

const cargadas = new Map()
function cargarMuro(src) {
  if (!cargadas.has(src)) {
    const img = new Image()
    img.decoding = 'async'
    img.src = src
    cargadas.set(src, img.decode().then(() => img))
  }
  return cargadas.get(src)
}

// La foto que mejor cubre una caja: la de proporción más parecida
const muroPara = (ancho, alto) => PAREDES_NOCHE.reduce((mejor, m) =>
  Math.abs(Math.log((m.ancho / m.alto) / (ancho / alto))) < Math.abs(Math.log((mejor.ancho / mejor.alto) / (ancho / alto))) ? m : mejor)

// Promesa con { medir, dibujar, destruir } cuando la pared está cargada; null si no carga (entonces
// la sección es negra, sin linterna)
export async function crearParedNoche(canvas) {
  const ctx = canvas.getContext('2d', { alpha: false })
  if (!ctx) return null
  let escala = 1
  let elegido = null
  let muro = null
  let caja = null

  function medir() {
    escala = Math.min(window.devicePixelRatio || 1, 2)
    const w = Math.round(Math.max(1, canvas.clientWidth) * escala)
    const h = Math.round(Math.max(1, canvas.clientHeight) * escala)
    canvas.width = w
    canvas.height = h
    // al girar el móvil puede tocar la otra; mientras carga, la de antes recortada
    const m = muroPara(w, h)
    if (m !== elegido) {
      elegido = m
      cargarMuro(m.archivo).then((img) => {
        if (elegido !== m) return
        muro = img
        caja = cubrir(m.ancho / m.alto, canvas.width, canvas.height)
      }, () => {})
    }
    if (muro) caja = cubrir(muro.naturalWidth / muro.naturalHeight, w, h)
  }

  // luz: { x, y, radio } en px CSS de la sección
  function dibujar(luz) {
    const w = canvas.width
    const h = canvas.height
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    if (!muro) {
      ctx.fillStyle = `rgb(${OSCURO})`
      ctx.fillRect(0, 0, w, h)
      return
    }
    ctx.drawImage(muro, caja.x, caja.y, caja.w, caja.h)
    const x = luz.x * escala
    const y = luz.y * escala
    const r = luz.radio * escala
    // la oscuridad, con un hueco de luz que se apaga hacia el borde
    const g = ctx.createRadialGradient(x, y, r * 0.15, x, y, r)
    g.addColorStop(0, `rgba(${OSCURO}, 0)`)
    g.addColorStop(0.55, `rgba(${OSCURO}, .18)`)
    g.addColorStop(1, `rgba(${OSCURO}, 1)`)
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
    // el aro de la linterna
    ctx.strokeStyle = 'rgba(255, 238, 205, .06)'
    ctx.lineWidth = r * 0.12
    ctx.beginPath()
    ctx.arc(x, y, r * 0.8, 0, Math.PI * 2)
    ctx.stroke()
  }

  function destruir() {
    muro = null
    elegido = null
  }

  medir()
  try {
    muro = await cargarMuro(elegido.archivo)
  } catch {
    return null
  }
  caja = cubrir(muro.naturalWidth / muro.naturalHeight, canvas.width, canvas.height)
  return { medir, dibujar, destruir }
}
