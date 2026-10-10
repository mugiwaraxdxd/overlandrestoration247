<script setup>
import { SITIO } from '~/utils/sitio'
import { zonaDe } from '~/utils/contenido'

// La página de una ciudad. Con página propia en su web, sus textos sobre la ciudad (sin el relleno
// que dejaron publicado); sin ella, solo lo común: servicios, cómo trabajan y contacto
const route = useRoute()
const z = computed(() => zonaDe(route.params.slug))
if (!z.value) throw createError({ statusCode: 404, statusMessage: 'Area not found', fatal: true })

// Sus párrafos son muy largos: de cada uno, sus dos primeras frases, y como mucho tres
const dos = (t) => (t.match(/[^.!?]+[.!?]+/g) || [t]).slice(0, 2).join('').trim()
const textos = computed(() => {
  const w = z.value.web
  if (!w) return []
  return [w.intro[0], w.clima[0], w.retos[0] || w.intro[1]].filter(Boolean).map(dos)
})

useHead(() => ({ title: `Water, fire, storm & mold restoration in ${z.value.nombre}, FL` }))
</script>

<template>
  <div v-if="z">
    <section class="cabecera-pagina">
      <div class="envoltura">
        <NuxtLink to="/areas" class="migas">Areas</NuxtLink>
        <h1>Water, fire, storm &amp; mold restoration in {{ z.nombre }}, FL</h1>
        <p class="entradilla">
          {{ z.base ? 'Our home base.' : `Serving ${z.nombre} from Cape Coral.` }}
          Owner-operated and on call 24/7: you get the owner on the phone and a crew on the way.
        </p>
        <div class="acciones">
          <a class="llamar" :href="SITIO.telefonoEnlace"><Icono nombre="telefono" />Call 24/7 · {{ SITIO.telefono }}</a>
          <NuxtLink class="btn-sec" to="#fotos"><Icono nombre="camara" />Send photos</NuxtLink>
        </div>
      </div>
    </section>

    <section v-if="textos.length" class="seccion">
      <div class="envoltura dos-columnas">
        <div class="cabeza-seccion">
          <p class="antetitulo">{{ z.nombre }}, FL</p>
          <h2 class="titulo-2">Why fast action matters here</h2>
        </div>
        <div class="textos">
          <p v-for="(t, i) in textos" :key="i" v-aparecer="i * 60" class="aparece">{{ t }}</p>
        </div>
      </div>
    </section>

    <section class="seccion seccion--bruma">
      <div class="envoltura">
        <div class="cabeza-seccion">
          <p class="antetitulo">Services in {{ z.nombre }}</p>
          <h2 class="titulo-2">What we restore</h2>
        </div>
        <TarjetasServicios />
      </div>
    </section>

    <section v-if="z.web?.preguntas?.length" class="seccion">
      <div class="envoltura dos-columnas">
        <div class="cabeza-seccion">
          <p class="antetitulo">FAQ</p>
          <h2 class="titulo-2">Questions from {{ z.nombre }}</h2>
        </div>
        <PreguntasLista :preguntas="z.web.preguntas.slice(0, 6)" />
      </div>
    </section>

    <BandaNoche />

    <section class="seccion">
      <div class="envoltura">
        <Contacto />
      </div>
    </section>
  </div>
</template>

<style scoped>
.cabecera-pagina { padding: 56px 0 64px; background: linear-gradient(180deg, var(--azul-suave), var(--blanco)); }
.cabecera-pagina .envoltura { display: grid; gap: 18px; justify-items: start; }
.migas { font-size: 14px; font-weight: 600; color: var(--azul); text-decoration: none; }
.migas::after { content: ' /'; color: var(--tinta-3); }
h1 { font-size: clamp(32px, 4.6vw, 54px); font-weight: 800; line-height: 1.08; letter-spacing: -.025em; max-width: 20ch; }
.acciones { display: flex; flex-wrap: wrap; gap: 12px; }
.acciones svg { width: 20px; height: 20px; }
.textos { display: grid; gap: 16px; color: var(--tinta-2); }
@media (min-width: 1000px) {
  .dos-columnas { display: grid; grid-template-columns: 1fr 1.5fr; gap: 56px; align-items: start; }
}
</style>
