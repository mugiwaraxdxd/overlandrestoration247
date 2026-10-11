<script setup>
import { SITIO } from '~/utils/sitio'
import { crearParedNoche } from '~/utils/paredNoche'
import { CITAS } from '~/utils/resenas'

// Las 2 a.m.: la pared a oscuras y una linterna (el ratón, el dedo o, si nadie la mueve, una luz que
// se pasea sola) que descubre los cercos de agua y el moho. El texto invierte su color donde le da
// la luz. El 24/7, con la hora de verdad en Cape Coral.
const hora = ref('')
const formato = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit', second: '2-digit' })
const tactil = ref(false)
const sinWebgl = ref(false)
const seccion = ref(null)
const lienzo = ref(null)
const lista = ref(false)

let temporizador = null
let pared = null
let visible = false
let reducido = false
let bucle = 0
let observador = null
let creando = null
let desmontado = false
const luz = { x: 0, y: 0, destinoX: 0, destinoY: 0, ultimoGesto: -1e9, colocada: false }

// Si nadie la mueve en 2,5 s, la luz recorre la parte visible de la sección despacio
function pintar(t = performance.now()) {
  bucle = 0
  if (!pared || !visible || !seccion.value) return
  const r = seccion.value.getBoundingClientRect()
  const arriba = Math.max(0, -r.top)
  const alto = Math.max(1, Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0))
  if (t - luz.ultimoGesto > 2500 && !reducido) {
    luz.destinoX = r.width * (0.66 + 0.26 * Math.sin(t * 0.00045))
    luz.destinoY = arriba + alto * (0.5 + 0.32 * Math.sin(t * 0.0007 + 1.3))
  }
  if (!luz.colocada) {
    luz.x = luz.destinoX
    luz.y = luz.destinoY
    luz.colocada = true
  }
  luz.x += (luz.destinoX - luz.x) * 0.12
  luz.y += (luz.destinoY - luz.y) * 0.12
  pared.dibujar({ x: luz.x, y: luz.y, radio: Math.min(330, Math.max(140, Math.min(r.width, alto) * 0.34)) })
  if (!reducido) bucle = requestAnimationFrame(pintar)
}

function alApuntar(e) {
  const punto = e.touches?.[0] ?? e
  if (!seccion.value) return
  const r = seccion.value.getBoundingClientRect()
  if (punto.clientY < r.top || punto.clientY > r.bottom) return
  luz.destinoX = punto.clientX - r.left
  luz.destinoY = punto.clientY - r.top
  luz.ultimoGesto = performance.now()
}

function alCambiarTamano() { pared?.medir() }

onMounted(() => {
  const poner = () => { hora.value = formato.format(new Date()) }
  poner()
  temporizador = setInterval(poner, 1000)
  tactil.value = window.matchMedia('(hover: none)').matches
  reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // La pared se pinta (una vez) cuando faltan cuatro pantallas para llegar, no al cargar la página
  // (su shader compila en segundo plano: en Chrome de Windows, unos segundos); y la luz solo se
  // mueve mientras se ve
  observador = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting
    if (visible && !creando) {
      creando = crearParedNoche(lienzo.value).then((p) => {
        if (desmontado) { p?.destruir(); return }
        if (!p) { sinWebgl.value = true; return }
        pared = p
        lista.value = true
        if (visible) bucle = requestAnimationFrame(pintar)
      })
    }
    cancelAnimationFrame(bucle)
    bucle = 0
    if (visible && pared) bucle = requestAnimationFrame(pintar)
  }, { rootMargin: '400% 0px' })
  observador.observe(seccion.value)
  window.addEventListener('pointermove', alApuntar, { passive: true })
  window.addEventListener('touchmove', alApuntar, { passive: true })
  window.addEventListener('resize', alCambiarTamano)
})

onBeforeUnmount(() => {
  desmontado = true
  clearInterval(temporizador)
  cancelAnimationFrame(bucle)
  observador?.disconnect()
  window.removeEventListener('pointermove', alApuntar)
  window.removeEventListener('touchmove', alApuntar)
  window.removeEventListener('resize', alCambiarTamano)
  pared?.destruir()
})
</script>

<template>
  <section ref="seccion" class="noche" :class="{ 'sin-webgl': sinWebgl, lista }">
    <canvas ref="lienzo" class="lienzo" aria-hidden="true" />
    <div class="envoltura contenido">
      <p v-aparecer class="aparece reloj">
        <span class="disponible" aria-hidden="true" />
        It's <b>{{ hora || '—' }}</b> in Cape Coral · we're on call
      </p>
      <h2 v-aparecer="80" class="aparece">2 a.m. and there's water on the floor?<br>Call. We pick up.</h2>
      <p v-aparecer="160" class="aparece texto">
        Water keeps moving while you wait, and mold can start in 24 to 48 hours.
        Night, weekend or holiday, you get the owner on the phone, not an answering service.
      </p>
      <CitaResena v-aparecer="200" class="aparece lo-dicen" :cita="CITAS.llamada" oscura />
      <a v-aparecer="240" class="aparece llamar" :href="SITIO.telefonoEnlace"><Icono nombre="telefono" />Call {{ SITIO.telefono }}</a>
    </div>
    <p v-if="!sinWebgl" class="pista" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="16" height="16"><path d="M9 3h6l-1 6H10zM10 9h4v11a2 2 0 0 1-4 0z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" /></svg>
      {{ tactil ? 'Drag to look around with the flashlight' : 'Move your flashlight to look around' }}
    </p>
  </section>
</template>

<style scoped>
.noche {
  position: relative;
  min-height: 110svh;
  color: #fff;
  background: #0b0d10;
  display: grid;
  align-content: center;
  padding: 120px 0 140px;
  overflow: hidden;
}
.lienzo { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; transition: opacity .8s var(--curva); }
.lista .lienzo { opacity: 1; }
.contenido { position: relative; display: grid; gap: 22px; justify-items: start; }
.reloj { display: inline-flex; align-items: center; gap: 10px; color: #cfd6e0; font-size: 15px; }
.reloj b { color: #fff; }
h2 {
  font-size: clamp(36px, 5.6vw, 76px);
  font-weight: 800;
  line-height: 1.04;
  letter-spacing: -.025em;
  max-width: 15ch;
}
.texto { color: #d9dee6; max-width: 54ch; font-size: 18px; }
.llamar { margin-top: 8px; }
.llamar svg { width: 20px; height: 20px; }

/* El texto invierte su color donde le da la linterna: blanco a oscuras, oscuro sobre la pared iluminada */
.reloj, h2, .texto, .pista, .lo-dicen { mix-blend-mode: difference; }
.sin-webgl .reloj, .sin-webgl h2, .sin-webgl .texto, .sin-webgl .lo-dicen { mix-blend-mode: normal; }
.lo-dicen { max-width: 46ch; }
.sin-webgl { background: var(--noche); }

.pista {
  position: absolute;
  right: var(--margen);
  bottom: 36px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #b9bec6;
}
@media (max-width: 899px) { .pista { left: var(--margen); right: auto; } }
</style>
