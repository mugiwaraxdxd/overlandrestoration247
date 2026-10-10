<script setup>
import { SITIO } from '~/utils/sitio'
import { SERVICIOS, ZONAS } from '~/utils/contenido'
</script>

<!-- El pie: el único sitio con el logo entero, sobre oscuro como está hecho -->
<template>
  <footer class="pie">
    <div class="envoltura rejilla">
      <div class="marca">
        <img class="logo" src="/logo/logo-transparente.png" alt="Overland Restoration 24/7 · Water · Fire · Mold" width="1324" height="940" loading="lazy">
        <p>Owner-operated water, fire, storm and mold restoration in Cape Coral and Southwest Florida. On call 24/7.</p>
      </div>
      <div>
        <p class="titulo">Services</p>
        <ul>
          <li v-for="s in SERVICIOS" :key="s.slug"><NuxtLink :to="`/services/${s.slug}`">{{ s.titulo }}</NuxtLink></li>
        </ul>
      </div>
      <div>
        <p class="titulo">Areas</p>
        <ul class="dos">
          <li v-for="z in ZONAS.slice(0, 10)" :key="z.slug"><NuxtLink :to="`/areas/${z.slug}`">{{ z.nombre }}</NuxtLink></li>
        </ul>
        <NuxtLink to="/areas" class="todas">All areas →</NuxtLink>
      </div>
      <div>
        <p class="titulo">Contact</p>
        <a :href="SITIO.telefonoEnlace" class="tel">{{ SITIO.telefono }}</a>
        <p>{{ SITIO.direccion }}</p>
        <p>Open 24 hours, 7 days</p>
        <p class="licencia">Florida Licensed Mold Remediation Contractor · {{ SITIO.licencia }}</p>
        <p class="redes">
          <a href="https://yelp.com/biz/overland-restoration-24-7-cape-coral" target="_blank" rel="noopener">Yelp</a>
          <a href="https://facebook.com/profile.php?id=61561071407162" target="_blank" rel="noopener">Facebook</a>
          <a href="https://instagram.com/overlandrestoration247/" target="_blank" rel="noopener">Instagram</a>
        </p>
      </div>
    </div>
    <div class="envoltura legal">© {{ new Date().getFullYear() }} Overland Restoration 24/7 LLC</div>
  </footer>
</template>

<style scoped>
.pie {
  background: var(--noche);
  color: #b7c3d4;
  padding: 72px 0 calc(32px + var(--alto-barra-movil));
  font-size: 15px;
}
.rejilla { display: grid; gap: 40px; }
.marca { display: grid; gap: 18px; max-width: 340px; }
.logo { width: min(260px, 70vw); height: auto; }
.titulo { color: #fff; font-weight: 700; margin-bottom: 14px; }
ul { list-style: none; padding: 0; display: grid; gap: 8px; }
ul.dos { grid-template-columns: 1fr 1fr; column-gap: 20px; }
a { color: #b7c3d4; text-decoration: none; transition: color .2s var(--curva); }
a:hover { color: #fff; }
.todas { display: inline-block; margin-top: 12px; color: #fff; font-weight: 600; }
.tel { display: block; font-size: 24px; font-weight: 800; color: #fff; margin-bottom: 8px; }
.licencia { margin-top: 12px; font-size: 13px; color: #8a9bb2; }
.redes { display: flex; gap: 16px; margin-top: 14px; }
.legal { margin-top: 56px; padding-top: 24px; border-top: 1px solid rgba(255, 255, 255, .1); font-size: 13px; color: #8a9bb2; }
@media (min-width: 900px) {
  .rejilla { grid-template-columns: 1.3fr 1fr 1.2fr 1fr; }
}
</style>
