<script setup>
import { VALORES } from '~/utils/contenido'
</script>

<!-- Por qué ellos: su frase del dueño y sus cuatro valores («Why choose us?» de su web) -->
<template>
  <div class="porque">
    <blockquote v-aparecer class="aparece cita">
      <svg class="comillas" viewBox="0 0 32 24" aria-hidden="true"><path d="M0 24V14C0 6 4.5 1.5 12 0l1.5 3.5C9 5 7 8 7 12h6v12zm18 0V14c0-8 4.5-12.5 12-14l1.5 3.5C27 5 25 8 25 12h6v12z" fill="currentColor" /></svg>
      <p>I work directly with every customer from start to finish, ensuring clear communication and personal accountability.</p>
      <footer>
        <span class="avatar"><Icono nombre="persona" /></span>
        <span><b>The owner</b><small>Overland Restoration 24/7</small></span>
      </footer>
    </blockquote>
    <div class="valores">
      <div v-for="(v, i) in VALORES" :key="v.titulo" v-aparecer="i * 80" class="aparece valor">
        <span class="icono-circulo"><Icono :nombre="v.icono" /></span>
        <h3>{{ v.titulo }}</h3>
        <p>{{ v.texto }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.porque { display: grid; gap: 40px; }
.cita {
  position: relative;
  padding: 36px 32px 30px;
  border-radius: var(--radio);
  background: var(--azul);
  color: #fff;
  box-shadow: 0 16px 40px rgba(26, 100, 200, .25);
}
.comillas { width: 36px; color: rgba(255, 255, 255, .35); margin-bottom: 18px; }
.cita p { font-size: clamp(22px, 2.4vw, 30px); font-weight: 700; line-height: 1.3; letter-spacing: -.01em; }
.cita footer { display: flex; align-items: center; gap: 12px; margin-top: 26px; }
.avatar { display: grid; place-items: center; width: 44px; height: 44px; border-radius: 50%; background: rgba(255, 255, 255, .18); }
.avatar svg { width: 22px; height: 22px; }
.cita b { display: block; }
.cita small { display: block; color: rgba(255, 255, 255, .75); font-size: 14px; }
.valores { display: grid; gap: 28px; }
.valor { display: grid; gap: 10px; align-content: start; }
h3 { font-size: 19px; font-weight: 800; }
.valor p { color: var(--tinta-2); font-size: 16px; }
@media (min-width: 700px) { .valores { grid-template-columns: 1fr 1fr; } }
@media (min-width: 1000px) {
  .porque { grid-template-columns: 1fr 1.2fr; gap: 56px; align-items: center; }
}
</style>
