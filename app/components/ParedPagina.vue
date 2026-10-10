<script setup>
import { crearParedPagina, TIPOS_DANO } from '~/utils/paredPagina'
import { useLimpieza } from '~/composables/useLimpieza'

// La pared de toda la página (ver utils/paredPagina.js). Empieza donde acaba el hero
// (#hero) y queda limpia al llegar al botón final (#final). En la sección [data-oscuro]
// la pared está a oscuras y se ve con una linterna: el ratón, el dedo o, si nadie la mueve,
// una luz que se pasea sola.
const lienzo = ref(null)
const { progresoPagina } = useLimpieza()

let pared = null
let pendiente = false
let bloques = []
let seccionOscura = null
let reducido = false

// La linterna: donde está y adonde va (px CSS de pantalla)
const luz = { x: 0, y: 0, destinoX: 0, destinoY: 0, ultimoGesto: -1e9, colocada: false }
let bucle = 0

function buscarBloques() {
  // Los bloques con su daño detrás: [data-dano="agua|fuego|tormenta|moho"] (uno o varios) y su
  // fuerza, [data-fuerza] de 0 a 1 (baja a lo largo de la página)
  bloques = [...document.querySelectorAll('[data-dano]')].map(el => ({
    el,
    fuerza: el.dataset.fuerza ? Number(el.dataset.fuerza) : 1,
    tipos: el.dataset.dano.split(/\s+/).map(t => TIPOS_DANO[t]).filter(t => t !== undefined)
  }))
  seccionOscura = document.querySelector('[data-oscuro]')
}

function rectOscuro(vista) {
  if (!seccionOscura) return null
  const r = seccionOscura.getBoundingClientRect()
  if (r.bottom < 0 || r.top > vista) return null
  return { x0: r.left, y0: r.top, x1: r.right, y1: r.bottom }
}

// Si nadie la mueve en 2,5 s, la luz recorre la pared despacio
function moverLuz(oscuro, t) {
  const w = oscuro.x1 - oscuro.x0
  const visibleArriba = Math.max(oscuro.y0, 0)
  const visibleAbajo = Math.min(oscuro.y1, window.innerHeight)
  const h = Math.max(1, visibleAbajo - visibleArriba)
  if (t - luz.ultimoGesto > 2500) {
    luz.destinoX = oscuro.x0 + w * (0.62 + 0.3 * Math.sin(t * 0.00045))
    luz.destinoY = visibleArriba + h * (0.5 + 0.32 * Math.sin(t * 0.0007 + 1.3))
  }
  if (!luz.colocada) {
    luz.x = luz.destinoX
    luz.y = luz.destinoY
    luz.colocada = true
  }
  luz.x += (luz.destinoX - luz.x) * 0.12
  luz.y += (luz.destinoY - luz.y) * 0.12
  return { x: luz.x, y: luz.y, radio: Math.min(340, Math.max(150, Math.min(w, h) * 0.34)) }
}

function pintar(t = performance.now()) {
  pendiente = false
  if (!pared) return
  const hero = document.getElementById('hero')
  const final = document.getElementById('final')
  if (!hero || !final) return
  const vista = window.innerHeight
  const scroll = window.scrollY
  const inicio = hero.offsetTop + hero.offsetHeight
  const desde = inicio - vista
  const hasta = final.offsetTop + final.offsetHeight / 2 - vista / 2
  const p = reducido ? 1 : Math.min(1, Math.max(0, (scroll - desde) / Math.max(1, hasta - desde)))
  progresoPagina.value = p
  if (inicio - scroll > vista) return   // la pared aún no se ve: no se pinta

  // Solo los que tocan la pantalla (con margen: el borde de cada zona se difumina hacia fuera)
  const danos = []
  for (const { el, tipos, fuerza } of bloques) {
    const r = el.getBoundingClientRect()
    if (r.bottom < -200 || r.top > vista + 200 || r.width === 0) continue
    for (const tipo of tipos) danos.push({ x0: r.left, y0: r.top, x1: r.right, y1: r.bottom, tipo, fuerza })
  }
  const oscuro = rectOscuro(vista)
  const linterna = oscuro ? moverLuz(oscuro, t) : null
  // La franja de la noche está siempre a oscuras (con movimiento reducido, también)
  const noche = oscuro ? 1 : 0
  pared.dibujar({ scroll, inicio, p, danos, oscuro, luz: linterna, noche })

  // Con la noche a la vista, la linterna se mueve sola: se repinta cada fotograma
  if (oscuro && noche > 0 && !reducido) {
    bucle = requestAnimationFrame(pintar)
  } else {
    bucle = 0
  }
}

function pedirPintar() {
  if (pendiente || bucle) return
  pendiente = true
  requestAnimationFrame(pintar)
}

function alApuntar(e) {
  const punto = e.touches?.[0] ?? e
  if (!seccionOscura) return
  const r = seccionOscura.getBoundingClientRect()
  if (punto.clientY < r.top || punto.clientY > r.bottom) return
  luz.destinoX = punto.clientX
  luz.destinoY = punto.clientY
  luz.ultimoGesto = performance.now()
  pedirPintar()
}

function alCambiarTamano() {
  buscarBloques()
  pared?.medir()
  pedirPintar()
}

onMounted(() => {
  reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  pared = crearParedPagina(lienzo.value)
  if (!pared) document.documentElement.classList.add('sin-pared')
  buscarBloques()
  pedirPintar()
  window.addEventListener('scroll', pedirPintar, { passive: true })
  window.addEventListener('resize', alCambiarTamano)
  window.addEventListener('pointermove', alApuntar, { passive: true })
  window.addEventListener('touchmove', alApuntar, { passive: true })
})

onBeforeUnmount(() => {
  cancelAnimationFrame(bucle)
  window.removeEventListener('scroll', pedirPintar)
  window.removeEventListener('resize', alCambiarTamano)
  window.removeEventListener('pointermove', alApuntar)
  window.removeEventListener('touchmove', alApuntar)
  pared?.destruir()
})
</script>

<template>
  <canvas ref="lienzo" class="pared-pagina" aria-hidden="true" />
</template>

<style scoped>
.pared-pagina {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: -1;   /* detrás de todo, en el mismo contexto: así el texto de la noche puede mezclarse con ella */
  pointer-events: none;
  background: #ecebe6;
}
</style>
