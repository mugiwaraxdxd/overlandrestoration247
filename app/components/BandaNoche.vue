<script setup>
import { SITIO } from '~/utils/sitio'

// El 24/7, contado con la hora de verdad en Cape Coral
const hora = ref('')
const formato = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit', second: '2-digit' })
let temporizador = null
onMounted(() => {
  const poner = () => { hora.value = formato.format(new Date()) }
  poner()
  temporizador = setInterval(poner, 1000)
})
onBeforeUnmount(() => clearInterval(temporizador))
</script>

<template>
  <section class="noche">
    <div class="envoltura contenido">
      <div>
        <p v-aparecer class="aparece reloj">
          <span class="disponible" aria-hidden="true" />
          It's <b>{{ hora || '—' }}</b> in Cape Coral · we're on call
        </p>
        <h2 v-aparecer="80" class="aparece titulo-2">2 a.m. and there's water on the floor? Call. We pick up.</h2>
        <p v-aparecer="140" class="aparece texto">
          Water keeps moving while you wait, and mold can start in 24 to 48 hours.
          Night, weekend or holiday, you get the owner on the phone, not an answering service.
        </p>
      </div>
      <div v-aparecer="200" class="aparece accion">
        <a class="llamar" :href="SITIO.telefonoEnlace"><Icono nombre="telefono" />Call {{ SITIO.telefono }}</a>
        <span class="nota">The owner answers, day or night</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.noche {
  background: var(--noche);
  background-image: radial-gradient(circle at 85% 20%, rgba(26, 100, 200, .35), transparent 50%);
  color: #fff;
  padding: 88px 0;
}
.contenido { display: grid; gap: 32px; align-items: center; }
.reloj { display: inline-flex; align-items: center; gap: 10px; color: #b7c3d4; font-size: 15px; margin-bottom: 14px; }
.reloj b { color: #fff; }
.texto { color: #b7c3d4; margin-top: 16px; max-width: 56ch; font-size: 18px; }
.accion { display: grid; gap: 10px; justify-items: start; }
.llamar svg { width: 20px; height: 20px; }
.nota { font-size: 14px; color: #8a9bb2; }
@media (min-width: 900px) {
  .noche { padding: 104px 0; }
  .contenido { grid-template-columns: 1.6fr 1fr; }
  .accion { justify-items: end; }
}
</style>
