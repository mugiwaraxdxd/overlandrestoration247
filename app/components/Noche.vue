<script setup>
import { SITIO } from '~/utils/sitio'

// La única sección oscura: el 24/7 contado con la hora de verdad en Cape Coral
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
    <p v-aparecer class="aparece reloj etiqueta-mono">
      <span class="disponible" aria-hidden="true" />
      Cape Coral · <span class="hora">{{ hora || '—' }}</span> · On call right now
    </p>
    <h2 v-aparecer="80" class="aparece">2 a.m. and there's water on the floor?<br>Call. We pick up.</h2>
    <p v-aparecer="160" class="aparece texto">
      Water keeps moving while you wait, and mold can start in 24 to 48 hours.
      Night, weekend or holiday, you get the owner on the phone, not an answering service.
    </p>
    <a v-aparecer="240" class="aparece llamar" :href="SITIO.telefonoEnlace">
      <span class="disponible" aria-hidden="true" />
      <span>Call now</span>
      <span class="numero">{{ SITIO.telefono }}</span>
    </a>
  </section>
</template>

<style scoped>
.noche {
  position: relative;
  z-index: 1;
  background: var(--carbon);
  color: var(--papel);
  padding: 96px var(--margen) 112px;
  display: grid;
  gap: 22px;
  justify-items: start;
}
.reloj {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #b9b9b9;
}
.hora { color: var(--papel); font-variant-numeric: tabular-nums; }
h2 {
  font-weight: 500;
  font-size: clamp(34px, 6vw, 88px);
  line-height: .98;
  letter-spacing: -.01em;
  text-transform: uppercase;
  max-width: 16ch;
}
.texto { color: #c9c9c9; max-width: 52ch; font-size: 17px; }
.llamar { margin-top: 10px; }
</style>
