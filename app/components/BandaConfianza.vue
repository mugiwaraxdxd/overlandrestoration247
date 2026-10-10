<script setup>
import { SITIO } from '~/utils/sitio'

// Lo que da confianza, de un vistazo (datos de su web)
const DATOS = [
  { icono: 'reloj', titulo: 'Open 24/7', texto: 'Nights, weekends, holidays' },
  { icono: 'persona', titulo: 'Owner-operated', texto: 'You deal with the owner' },
  { icono: 'escudo', titulo: 'Licensed mold remediator', texto: `Florida license ${SITIO.licencia}` },
  { icono: 'documento', titulo: 'Insurance claims', texto: 'We document everything' }
]
</script>

<template>
  <section class="confianza">
    <div class="envoltura rejilla">
      <div v-for="(d, i) in DATOS" :key="d.titulo" v-aparecer="i * 70" class="aparece dato">
        <span class="icono-circulo"><Icono :nombre="d.icono" /></span>
        <div>
          <b>{{ d.titulo }}</b>
          <span>{{ d.texto }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.confianza { padding: 40px 0; border-bottom: 1px solid var(--linea); background: var(--blanco); position: relative; }
.rejilla { display: grid; grid-template-columns: 1fr 1fr; gap: 24px 20px; }
.dato { display: flex; align-items: center; gap: 14px; }
.dato .icono-circulo { width: 48px; height: 48px; border-radius: 14px; }
.dato .icono-circulo svg { width: 24px; height: 24px; }
b { display: block; font-size: 16px; line-height: 1.3; }
.dato span:not(.icono-circulo) { display: block; font-size: 14px; color: var(--tinta-3); line-height: 1.35; }
@media (min-width: 900px) { .rejilla { grid-template-columns: repeat(4, 1fr); } }
</style>
