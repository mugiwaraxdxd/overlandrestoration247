<script setup>
import { SITIO } from '~/utils/sitio'

// La sección de noche: la misma pared, a oscuras, con una linterna (la pinta ParedPagina).
// Aquí el moho sí pasa por detrás del texto: el texto invierte su color y se lee igual.
// El 24/7 contado con la hora de verdad en Cape Coral.
const hora = ref('')
const formato = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit', second: '2-digit' })
const tactil = ref(false)
let temporizador = null

onMounted(() => {
  const poner = () => { hora.value = formato.format(new Date()) }
  poner()
  temporizador = setInterval(poner, 1000)
  tactil.value = window.matchMedia('(hover: none)').matches
})
onBeforeUnmount(() => clearInterval(temporizador))
</script>

<template>
  <section class="noche" data-oscuro>
    <div class="contenido">
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
    </div>
    <p class="pista etiqueta-mono" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="16" height="16"><path d="M9 3h6l-1 6H10zM10 9h4v11a2 2 0 0 1-4 0z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" /></svg>
      {{ tactil ? 'Drag to look around with the flashlight' : 'Move your flashlight to look around' }}
    </p>
  </section>
</template>

<style scoped>
.noche {
  position: relative;
  min-height: 130svh;
  color: var(--papel);
  padding: 120px var(--margen) 140px;
  display: grid;
  align-content: center;
}
/* Sin WebGL no hay pared a oscuras: el fondo negro de siempre */
:global(.sin-pared) .noche { background: var(--carbon); }

.contenido { display: grid; gap: 22px; justify-items: start; max-width: 860px; }
.reloj { display: inline-flex; justify-self: start; align-items: center; gap: 10px; color: #b9b9b9; }
.hora { color: var(--papel); font-variant-numeric: tabular-nums; }
h2 {
  font-weight: 500;
  font-size: clamp(34px, 6vw, 88px);
  line-height: .98;
  letter-spacing: -.01em;
  text-transform: uppercase;
  max-width: 16ch;
  width: fit-content;
}
.texto { color: #d6d6d6; max-width: 52ch; font-size: 17px; }

/* El texto invierte su color donde le da la linterna: blanco a oscuras, oscuro sobre la pared iluminada */
.reloj, h2, .texto, .pista { mix-blend-mode: difference; }
.llamar { margin-top: 10px; }

.pista {
  position: absolute;
  right: var(--margen);
  bottom: 40px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #9a9a9a;
}
@media (max-width: 899px) { .pista { left: var(--margen); right: auto; } }
</style>
