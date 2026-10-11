<script setup>
import { SITIO } from '~/utils/sitio'
</script>

<!-- En el móvil, llamar está siempre a un toque -->
<template>
  <div class="barra-movil">
    <a class="llamar" :href="SITIO.telefonoEnlace">
      <span class="disponible" aria-hidden="true" />Call 24/7
    </a>
    <NuxtLink class="btn-sec" to="/contact#fotos"><Icono nombre="camara" />Send photos</NuxtLink>
  </div>
</template>

<style scoped>
.barra-movil {
  position: fixed;
  inset: auto 0 0;
  z-index: 50;
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 10px;
  padding: 10px 14px calc(10px + env(safe-area-inset-bottom));
  background: var(--blanco);
  border-top: 1px solid var(--linea);
}
.barra-movil a { min-height: 52px; font-size: 16px; }
.btn-sec svg { width: 20px; height: 20px; }
@media (min-width: 900px) {
  .barra-movil { display: none; }
}
</style>
