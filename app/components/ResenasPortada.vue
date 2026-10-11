<script setup>
import { RESENAS, TOTAL_RESENAS, NOTA_MEDIA, POR_PLATAFORMA } from '~/utils/resenas'

// Sus reseñas en la portada: la nota (las estrellas se llenan de agua) y dos cintas con la frase de
// cada reseña que corren en sentidos opuestos al ritmo del scroll; la frase se subraya al entrar.
// Las cuentas salen de las reseñas (nada escrito a mano). Fuera de las cintas, la de Andre LaBau
// (lleva el apellido del dueño: en la página de reseñas está, aquí no se destaca)
const destacadas = RESENAS.filter(r => r.frase && !/labau/i.test(r.nombre))
const FILAS = [destacadas.filter((_, i) => i % 2 === 0), destacadas.filter((_, i) => i % 2 === 1)]
const todasCinco = RESENAS.every(r => r.estrellas === 5)
const nombranDanny = RESENAS.filter(r => /\bDann?y\b|\bDani\b/.test(r.texto)).length
const plataformas = Object.keys(POR_PLATAFORMA).join(' & ')

const seccion = ref(null)
const filas = ref([])
let pendiente = false
let visible = false
let observador = null
const RITMO = 0.35   // px que corre la cinta por px de scroll

function mover() {
  pendiente = false
  if (!seccion.value) return
  const r = seccion.value.getBoundingClientRect()
  const recorrido = window.innerHeight - r.top      // lo bajado desde que asomó la sección
  const total = (window.innerHeight + r.height) * RITMO
  const d = Math.min(total, Math.max(0, recorrido * RITMO))
  const [a, b] = filas.value
  if (a) a.style.transform = `translate3d(${(-d).toFixed(1)}px, 0, 0)`
  if (b) b.style.transform = `translate3d(${(d - total).toFixed(1)}px, 0, 0)`
}
function alMoverse() {
  if (!visible || pendiente) return
  pendiente = true
  requestAnimationFrame(mover)
}

onMounted(() => {
  mover()
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  observador = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting
    if (visible) alMoverse()
  })
  observador.observe(seccion.value)
  window.addEventListener('scroll', alMoverse, { passive: true })
})
onBeforeUnmount(() => {
  observador?.disconnect()
  window.removeEventListener('scroll', alMoverse)
})
</script>

<template>
  <section ref="seccion" class="seccion seccion--bruma resenas-portada">
    <div class="envoltura cabeza">
      <div>
        <p v-aparecer class="aparece antetitulo">Reviews</p>
        <h2 v-aparecer="80" class="aparece titulo-2">{{ TOTAL_RESENAS }} reviews.<template v-if="todasCinco"> All five stars.</template></h2>
        <p v-aparecer="140" class="aparece entradilla">{{ nombranDanny }} of the {{ RESENAS.length }} written reviews mention Danny, the owner, by name.</p>
      </div>
      <div v-aparecer="200" class="aparece nota">
        <b class="cifra">{{ NOTA_MEDIA.toFixed(1) }}</b>
        <div>
          <EstrellasAgua :nota="NOTA_MEDIA" class="estrellas-grandes" />
          <span class="de-donde">{{ TOTAL_RESENAS }} reviews on {{ plataformas }}</span>
        </div>
        <NuxtLink to="/reviews" class="todas">Read them all <span aria-hidden="true">→</span></NuxtLink>
      </div>
    </div>

    <div class="cintas" aria-label="What customers say">
      <div v-for="(fila, k) in FILAS" :key="k" :ref="(el) => { filas[k] = el }" class="fila">
        <NuxtLink v-for="r in fila" :key="r.id" v-aparecer :to="`/reviews#${r.id}`" class="aparece tarjeta-cita">
          <span class="estrellas" aria-hidden="true">{{ '★'.repeat(r.estrellas) }}</span>
          <q><mark>{{ r.frase }}</mark></q>
          <span class="quien"><b>{{ r.nombre }}</b> · {{ r.mes }} · {{ r.plataforma }}</span>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.resenas-portada { overflow: hidden; }
.cabeza { display: grid; gap: 28px; align-items: end; margin-bottom: 40px; }
.nota { display: flex; flex-wrap: wrap; align-items: center; gap: 12px 18px; }
.cifra { font-size: clamp(56px, 7vw, 84px); font-weight: 800; line-height: 1; letter-spacing: -.04em; color: var(--tinta); }
.estrellas-grandes { font-size: 30px; }
.de-donde { display: block; margin-top: 6px; font-size: 14px; color: var(--tinta-3); }
.todas { flex-basis: 100%; font-weight: 700; color: var(--azul); text-decoration: none; }
.todas:hover { text-decoration: underline; }

/* Las cintas: su posición la pone el scroll */
.cintas { display: grid; gap: 16px; }
.fila { display: flex; gap: 16px; width: max-content; padding: 0 var(--margen); will-change: transform; }
.tarjeta-cita {
  display: grid;
  grid-template-rows: auto 1fr auto;   /* quién, siempre al pie */
  gap: 10px;
  width: min(340px, 78vw);
  padding: 20px 22px;
  border: 1px solid var(--linea);
  border-radius: 20px;
  background: var(--blanco);
  box-shadow: var(--sombra);
  color: var(--tinta);
  text-decoration: none;
  transition: border-color .2s var(--curva), translate .2s var(--curva);
}
.tarjeta-cita:hover { border-color: #bcd3f2; translate: 0 -2px; }
.estrellas { font-size: 15px; letter-spacing: 3px; color: #f5b301; }
q { font-size: 17px; font-weight: 700; line-height: 1.45; quotes: '“' '”'; }
.quien { font-size: 13px; color: var(--tinta-3); }
.quien b { color: var(--tinta-2); }
/* La frase, subrayada con un trazo de rotulador que se dibuja al entrar la tarjeta */
mark {
  color: inherit;
  background: linear-gradient(transparent 60%, rgba(26, 100, 200, .2) 60%) no-repeat 0 0 / 0% 100%;
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
  transition: background-size 1s var(--curva) .3s;
}
.visto mark { background-size: 100% 100%; }

@media (min-width: 900px) {
  .cabeza { grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); gap: 48px; }
  .nota { justify-content: flex-end; }
  .todas { flex-basis: auto; }
}
</style>
