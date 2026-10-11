// La pared del hero en el móvil. El shader del moho es demasiado para pintarlo en cada fotograma
// del scroll (12 fps en una GPU modesta), así que la limpieza se pre-calcula: N fotos de la pared,
// de sucia a limpia; la primera al momento y las demás en los ratos libres (primero la limpia y la
// del medio, luego rellenando huecos, para que pronto haya de todo). Al hacer scroll solo se funden
// las dos fotos más cercanas que ya haya en un Canvas 2D: casi gratis. Misma interfaz que
// crearParedDanada (una promesa: el shader compila en segundo plano).
import { crearParedDanada, CAPAS_HERO } from './paredDanada'

// Orden en que se hacen las fotos 1..n-1: la última, la del medio y cada hueco por la mitad
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

// pixeles: tope de px por foto (en una tableta, 1,25 px por px CSS serían 2 Mpx × 17 fotos)
export async function crearParedCacheada(canvas, { enchufe, capas = CAPAS_HERO, cuadros = 17, pixeles = 650000 } = {}) {
  const libre = window.requestIdleCallback || ((f) => setTimeout(f, 32))
  const cancelar = window.cancelIdleCallback || clearTimeout

  const medida = () => {
    const ancho = Math.max(1, canvas.clientWidth)
    const alto = Math.max(1, canvas.clientHeight)
    const escala = Math.min(window.devicePixelRatio || 1, 1.25, Math.sqrt(pixeles / (ancho * alto)))
    return { ancho, alto, escala }
  }
  let css = medida()
  const lienzoGl = document.createElement('canvas')
  const motor = await crearParedDanada(lienzoGl, { enchufe, capas, tamano: () => css })
  if (!motor) return null
  const ctx = canvas.getContext('2d', { alpha: false })
  if (!ctx) return null

  let fotos = []
  let cola = []
  let tarea = 0
  let pUltimo = 0
  let pPintado = -1

  // Pinta la limpieza de la foto i y la copia en el mismo turno (luego el WebGL se borra)
  function foto(i) {
    motor.dibujar(i / (cuadros - 1), true)
    const f = document.createElement('canvas')
    f.width = lienzoGl.width
    f.height = lienzoGl.height
    f.getContext('2d', { alpha: false }).drawImage(lienzoGl, 0, 0)
    fotos[i] = f
  }

  function siguiente() {
    tarea = 0
    const i = cola.shift()
    if (i == null) return
    foto(i)
    pPintado = -1
    pintar(pUltimo)
    if (cola.length) tarea = libre(siguiente, { timeout: 400 })
  }

  function soltarFotos() {
    // en iOS la memoria de un lienzo no se libera hasta dejarlo a 0
    for (const f of fotos) if (f) f.width = f.height = 0
    fotos = []
  }

  function preparar() {
    cancelar(tarea)
    soltarFotos()
    motor.medir()
    canvas.width = lienzoGl.width
    canvas.height = lienzoGl.height
    foto(0)
    cola = ordenDeFotos(cuadros)
    tarea = libre(siguiente, { timeout: 400 })
    pPintado = -1
  }

  function pintar(p) {
    if (!fotos[0]) return
    const x = Math.min(1, Math.max(0, p)) * (cuadros - 1)
    let a = Math.floor(x)
    while (a > 0 && !fotos[a]) a--
    let b = Math.ceil(x)
    while (b < cuadros - 1 && !fotos[b]) b++
    if (!fotos[b]) b = a
    const t = b > a ? (x - a) / (b - a) : 0
    ctx.globalAlpha = 1
    ctx.drawImage(fotos[a], 0, 0)
    if (t > 0.01) {
      ctx.globalAlpha = t
      ctx.drawImage(fotos[b], 0, 0)
      ctx.globalAlpha = 1
    }
    pPintado = p
  }

  function medir() {
    const nuevo = medida()
    // solo si cambia de verdad (girar el móvil), no por la barra del navegador
    if (Math.abs(nuevo.ancho - css.ancho) > 2 || Math.abs(nuevo.alto - css.alto) > 60) {
      css = nuevo
      preparar()
      pintar(pUltimo)
    }
  }

  function dibujar(p) {
    pUltimo = p
    if (Math.abs(p - pPintado) < 0.0005) return
    pintar(p)
  }

  function destruir() {
    cancelar(tarea)
    soltarFotos()
    motor.destruir()
  }

  css = medida()
  preparar()
  pintar(0)
  // si se empezó con la pared previa (sin motitas), al llegar la completa se rehacen las fotos
  motor.mejorada.then((si) => {
    if (!si || !fotos.length) return
    preparar()
    pintar(pUltimo)
  })
  return { medir, dibujar, destruir }
}
