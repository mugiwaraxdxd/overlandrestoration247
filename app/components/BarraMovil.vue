<script setup>
import { SITIO } from '~/utils/sitio'
</script>

<!-- En el móvil, llamar está siempre a un toque -->
<template>
  <div class="barra-movil">
    <a class="llamar" :href="SITIO.telefonoEnlace">
      <span class="disponible" aria-hidden="true" />Call 24/7
    </a>
    <a class="fotos" href="#fotos">Send photos</a>
  </div>
</template>

<style scoped>
.barra-movil {
  position: fixed;
  inset: auto 0 0;
  z-index: 50;
  display: grid;
  grid-template-columns: 1.35fr 1fr;
  gap: 8px;
  padding: 10px 12px calc(10px + env(safe-area-inset-bottom));
  background: var(--papel);
  border-top: 1px solid var(--hormigon);
  box-shadow: 0 -4px 16px rgba(0, 0, 0, .1);
}
.barra-movil a {
  justify-content: center;
  height: 52px;
  border-radius: var(--radio);
  font-size: 16px;
}
.fotos {
  display: flex;
  align-items: center;
  background: var(--carbon);
  color: var(--papel);
  font-weight: 500;
  text-decoration: none;
}
.fotos:active { transform: scale(.97); }

@media (min-width: 900px) {
  .barra-movil { display: none; }
}
</style>
