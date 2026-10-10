<script setup>
import { SERVICIOS } from '~/utils/contenido'

// Los cuatro servicios, en el orden de su web; cada uno lleva a su página.
// «menos»: el slug que no se enseña (en la página de un servicio, los otros tres)
const props = defineProps({ menos: { type: String, default: '' } })
const lista = computed(() => SERVICIOS.filter(s => s.slug !== props.menos))
</script>

<template>
  <div class="rejilla" :class="{ tres: lista.length === 3 }">
    <NuxtLink v-for="(s, i) in lista" :key="s.slug" v-aparecer="i * 80" :to="`/services/${s.slug}`" class="aparece tarjeta servicio">
      <span class="icono-circulo"><Icono :nombre="s.icono" /></span>
      <h3>{{ s.titulo }}</h3>
      <p>{{ s.corto }}</p>
      <ul>
        <li v-for="sub in s.sub.slice(0, 4)" :key="sub"><Icono nombre="check" />{{ sub }}</li>
      </ul>
      <span class="enlace-flecha">Learn more <span>→</span></span>
    </NuxtLink>
  </div>
</template>

<style scoped>
.rejilla { display: grid; gap: 20px; }
.servicio { display: grid; align-content: start; gap: 14px; padding: 28px 26px; }
h3 { font-size: 22px; font-weight: 800; line-height: 1.2; letter-spacing: -.01em; }
p { color: var(--tinta-2); font-size: 16px; }
ul { list-style: none; padding: 0; display: grid; gap: 6px; margin: 2px 0 6px; }
li { display: flex; align-items: center; gap: 8px; font-size: 15px; color: var(--tinta-2); }
li svg { width: 16px; height: 16px; color: var(--verde); stroke-width: 2.4; flex: none; }
@media (min-width: 700px) { .rejilla { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1100px) {
  .rejilla { grid-template-columns: repeat(4, 1fr); }
  .rejilla.tres { grid-template-columns: repeat(3, 1fr); }
  .servicio .enlace-flecha { margin-top: auto; }
}
</style>
