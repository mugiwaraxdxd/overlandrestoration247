<script setup>
import { crearParedPagina } from '~/utils/paredPagina'
import { useLimpieza } from '~/composables/useLimpieza'

// La pared de toda la página (ver utils/paredPagina.js). Empieza donde acaba el hero
// (#hero) y queda limpia al llegar al botón final (#final).
const lienzo = ref(null)
const { progresoPagina } = useLimpieza()

let pared = null
let pendiente = false
let bloques = []
let reducido = false

function buscarBloques() {
  bloques = [...document.querySelectorAll('[data-limpio]')]
}

function pintar() {
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

  const rects = []
  for (const el of bloques) {
    const r = el.getBoundingClientRect()
    if (r.bottom < -60 || r.top > vista + 60 || r.width === 0) continue
    rects.push({ x0: r.left, y0: r.top, x1: r.right, y1: r.bottom })
  }
  pared.dibujar({ scroll, inicio, p, rects })
}

function pedirPintar() {
  if (pendiente) return
  pendiente = true
  requestAnimationFrame(pintar)
}

function alCambiarTamano() {
  buscarBloques()
  pared?.medir()
  pedirPintar()
}

onMounted(() => {
  reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  pared = crearParedPagina(lienzo.value)
  buscarBloques()
  pedirPintar()
  window.addEventListener('scroll', pedirPintar, { passive: true })
  window.addEventListener('resize', alCambiarTamano)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', pedirPintar)
  window.removeEventListener('resize', alCambiarTamano)
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
  z-index: 0;
  pointer-events: none;
  background: #ecebe6;
}
</style>
