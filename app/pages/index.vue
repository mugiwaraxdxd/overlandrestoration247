<script setup>
import { PREGUNTAS } from '~/utils/contenido'

useHead({ title: '' })
</script>

<template>
  <div>
    <!-- La única suciedad de la web: la pared que se limpia con el scroll -->
    <HeroLimpieza />
    <BandaConfianza />

    <section id="servicios" class="seccion seccion--bruma">
      <div class="envoltura">
        <div class="cabeza-seccion">
          <p v-aparecer class="aparece antetitulo">What happened?</p>
          <h2 v-aparecer="80" class="aparece titulo-2">Water, fire, storm or mold. We handle all of it.</h2>
          <p v-aparecer="140" class="aparece entradilla">Tell us what you're looking at and we take it from there, from the first call to the final repair.</p>
        </div>
        <TarjetasServicios />
      </div>
    </section>

    <section id="como-trabajamos" class="seccion">
      <div class="envoltura">
        <div class="cabeza-seccion">
          <p v-aparecer class="aparece antetitulo">How we work</p>
          <h2 v-aparecer="80" class="aparece titulo-2">From your call to a dry, restored home.</h2>
        </div>
        <Pasos />
      </div>
    </section>

    <BandaNoche />

    <section class="seccion">
      <div class="envoltura">
        <div class="cabeza-seccion">
          <p v-aparecer class="aparece antetitulo">Why Overland</p>
          <h2 v-aparecer="80" class="aparece titulo-2">One owner. No shortcuts.</h2>
        </div>
        <PorQueNosotros />
      </div>
    </section>

    <section class="seccion seccion--bruma">
      <div class="envoltura">
        <BloqueSeguro />
      </div>
    </section>

    <section class="seccion">
      <div class="envoltura">
        <div class="cabeza-seccion">
          <p v-aparecer class="aparece antetitulo">Areas we serve</p>
          <h2 v-aparecer="80" class="aparece titulo-2">Based in Cape Coral. Across Southwest Florida.</h2>
        </div>
        <ZonasChips />
      </div>
    </section>

    <section class="seccion seccion--bruma">
      <div class="envoltura preguntas">
        <div class="cabeza-seccion">
          <p v-aparecer class="aparece antetitulo">FAQ</p>
          <h2 v-aparecer="80" class="aparece titulo-2">Straight answers.</h2>
          <NuxtLink v-aparecer="140" to="/faq" class="aparece enlace-flecha">All questions <span>→</span></NuxtLink>
        </div>
        <PreguntasLista :preguntas="PREGUNTAS.slice(0, 5)" />
      </div>
    </section>

    <section class="seccion">
      <div class="envoltura">
        <Contacto />
      </div>
    </section>
  </div>
</template>

<style scoped>
@media (min-width: 1000px) {
  .preguntas { display: grid; grid-template-columns: 1fr 1.6fr; gap: 56px; align-items: start; }
}
</style>
