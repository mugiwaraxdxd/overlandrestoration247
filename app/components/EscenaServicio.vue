<script setup>
// La animación de un servicio (agua, fuego, tormenta o moho). Decide cuándo se «restaura»:
// - en el ordenador, al pasar el ratón por su tarjeta (o por ella misma);
// - en el móvil, cuando está bien a la vista;
// - con «ciclo» (cabecera de su página), sola: dañada, restaurada, y vuelta a empezar.
// Con movimiento reducido, restaurada y quieta.
import AnimAgua from './anim/AnimAgua.vue'
import AnimFuego from './anim/AnimFuego.vue'
import AnimTormenta from './anim/AnimTormenta.vue'
import AnimMoho from './anim/AnimMoho.vue'

const props = defineProps({
  tipo: { type: String, required: true },   // agua | fuego | tormenta | moho
  ciclo: { type: Boolean, default: false }
})

const COMPONENTES = { agua: AnimAgua, fuego: AnimFuego, tormenta: AnimTormenta, moho: AnimMoho }

const raiz = ref(null)
const activo = ref(false)
const visible = ref(false)
const tactil = ref(false)
const reducido = ref(false)

let observador = null
let tarjeta = null
let reloj = null

const entrar = () => { if (!tactil.value && !props.ciclo) activo.value = true }
const salir = () => { if (!tactil.value && !props.ciclo) activo.value = false }

function cicloSiguiente() {
  clearTimeout(reloj)
  if (!props.ciclo || !visible.value) return
  activo.value = !activo.value
  reloj = setTimeout(cicloSiguiente, activo.value ? 5200 : 2600)
}

onMounted(() => {
  tactil.value = window.matchMedia('(hover: none)').matches
  reducido.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reducido.value) { activo.value = true; return }

  tarjeta = raiz.value.closest('.tarjeta') || raiz.value
  tarjeta.addEventListener('pointerenter', entrar)
  tarjeta.addEventListener('pointerleave', salir)

  observador = new IntersectionObserver(([e]) => {
    visible.value = e.isIntersecting
    if (props.ciclo) {
      clearTimeout(reloj)
      if (e.isIntersecting) reloj = setTimeout(cicloSiguiente, 1600)
    } else if (tactil.value) {
      // en el móvil: bien a la vista, se restaura; al irse, vuelve a estar dañada
      activo.value = e.intersectionRatio >= 0.65
    }
  }, { threshold: [0, 0.65, 1] })
  observador.observe(raiz.value)
})

onBeforeUnmount(() => {
  clearTimeout(reloj)
  observador?.disconnect()
  tarjeta?.removeEventListener('pointerenter', entrar)
  tarjeta?.removeEventListener('pointerleave', salir)
})
</script>

<template>
  <div ref="raiz" class="escena">
    <component :is="COMPONENTES[tipo]" :activo="activo" :visible="visible" :interactivo="!tactil && !ciclo" />
  </div>
</template>

<style scoped>
.escena {
  position: relative;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  border-radius: 16px;
  isolation: isolate;
}
</style>
