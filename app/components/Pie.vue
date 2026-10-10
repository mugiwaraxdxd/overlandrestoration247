<script setup>
import { SITIO } from '~/utils/sitio'

const ZONAS = ['Cape Coral', 'Fort Myers', 'Lehigh Acres', 'North Fort Myers', 'Bonita Springs', 'Estero', 'San Carlos Park', 'Iona', 'Villas', 'Cypress Lake', 'Fort Myers Beach']
</script>

<!-- El pie: el único sitio con el logo entero, sobre oscuro como está hecho -->
<template>
  <footer id="zonas" class="pie">
    <img class="logo" src="/logo/logo-transparente.png" alt="Overland Restoration 24/7 · Water · Fire · Mold" width="1324" height="940" loading="lazy">
    <div class="columna">
      <p class="etiqueta-mono titulo">Contact</p>
      <a :href="SITIO.telefonoEnlace" class="tel">{{ SITIO.telefono }}</a>
      <p>{{ SITIO.direccion }}</p>
      <p>Open 24/7</p>
      <p class="etiqueta-mono licencia">FL Mold Remediation Contractor · {{ SITIO.licencia }}</p>
    </div>
    <div class="columna">
      <p class="etiqueta-mono titulo">Areas we serve</p>
      <ul><li v-for="z in ZONAS" :key="z">{{ z }}</li></ul>
    </div>
  </footer>
</template>

<style scoped>
.pie {
  position: relative;
  background: var(--carbon);
  color: #c9c9c9;
  padding: 72px var(--margen) calc(72px + var(--alto-barra-movil));
  display: grid;
  gap: 40px;
  font-size: 16px;
}
.logo { width: min(320px, 70vw); height: auto; }
.titulo { color: #8f8f8f; margin-bottom: 12px; }
.tel { display: block; font-family: var(--fuente-datos); font-size: 26px; color: var(--papel); text-decoration: none; margin-bottom: 8px; }
.licencia { margin-top: 14px; color: #8f8f8f; font-size: 11px; }
ul { list-style: none; padding: 0; columns: 2; column-gap: 24px; }
li { line-height: 1.9; }
@media (min-width: 900px) {
  .pie { grid-template-columns: 1.1fr 1fr 1fr; align-items: start; }
}
</style>
