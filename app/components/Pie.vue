<script setup>
import { SITIO } from '~/utils/sitio'

</script>

<!-- El pie: el único sitio con el logo entero, sobre oscuro como está hecho -->
<template>
  <footer class="pie">
    <img class="logo" src="/logo/logo-transparente.png" alt="Overland Restoration 24/7 · Water · Fire · Mold" width="1324" height="940" loading="lazy">
    <div class="columna">
      <p class="etiqueta-mono titulo">Contact</p>
      <a :href="SITIO.telefonoEnlace" class="tel">{{ SITIO.telefono }}</a>
      <p>{{ SITIO.direccion }}</p>
      <p>Open 24/7</p>
      <p class="etiqueta-mono licencia">FL Mold Remediation Contractor · {{ SITIO.licencia }}</p>
    </div>
    <div class="columna">
      <p class="etiqueta-mono titulo">Find us</p>
      <p><a href="https://www.google.com/maps/place/Overland+Restoration+24%2F7" target="_blank" rel="noopener">Google Maps</a></p>
      <p><a href="https://yelp.com/biz/overland-restoration-24-7-cape-coral" target="_blank" rel="noopener">Yelp</a> · <a href="https://facebook.com/profile.php?id=61561071407162" target="_blank" rel="noopener">Facebook</a> · <a href="https://instagram.com/overlandrestoration247/" target="_blank" rel="noopener">Instagram</a></p>
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
.columna a { color: var(--papel); }
@media (min-width: 900px) {
  .pie { grid-template-columns: 1.1fr 1fr 1fr; align-items: start; }
}
</style>
