<script setup>
// La cinta de obra que abre cada capítulo de la página: la amarilla de precaución con la que
// se acordona una zona contaminada. Cruza la pared un poco torcida y su texto avanza despacio.
const props = defineProps({
  n: { type: String, required: true },         // «02»
  texto: { type: String, required: true },     // «How we work»
  inclinacion: { type: Number, default: -1.4 } // grados; alternar el signo entre capítulos
})

// Lo bastante repetido para llenar dos anchos de pantalla (la animación desplaza una mitad)
const trozo = computed(() => `${props.n} · ${props.texto}`)
const copias = 10
</script>

<template>
  <div class="cinta" :style="{ '--inclinacion': `${inclinacion}deg`, '--sentido': inclinacion < 0 ? 'normal' : 'reverse' }" aria-hidden="true">
    <div class="banda">
      <div class="pista">
        <span v-for="i in copias * 2" :key="i" class="trozo">{{ trozo }}<span class="marca">▲</span></span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cinta {
  position: relative;
  overflow: clip;
  padding: 28px 0;
  margin: 0 0 -12px;
  pointer-events: none;
}
.banda {
  width: 110%;
  margin-left: -5%;
  transform: rotate(var(--inclinacion));
  background: var(--obra);
  /* las rayas de peligro arriba y abajo */
  border-block: 5px solid transparent;
  border-image: repeating-linear-gradient(-45deg, var(--carbon) 0 9px, var(--obra) 9px 18px) 5;
  box-shadow: 0 6px 14px rgba(0, 0, 0, .18);
  overflow: hidden;
}
.pista {
  display: flex;
  width: max-content;
  animation: avanzar 60s linear infinite;
  animation-direction: var(--sentido);
}
.trozo {
  display: inline-flex;
  align-items: center;
  gap: 18px;
  padding: 9px 0 8px 18px;
  font-family: var(--fuente-datos);
  font-weight: 600;
  font-size: 14px;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: var(--carbon);
  white-space: nowrap;
}
.marca { font-size: 10px; }
@keyframes avanzar { to { transform: translateX(-50%); } }

@media (min-width: 900px) {
  .cinta { padding: 40px 0; }
  .trozo { font-size: 16px; padding: 11px 0 10px 22px; gap: 22px; }
}
</style>
