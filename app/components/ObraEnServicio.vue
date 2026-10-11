<script setup>
import { fotosDe } from '~/utils/obras'

// En la página de un servicio, un trabajo real de ese tipo: unas copias en abanico (se enderezan al
// pasar por encima) y el enlace al expediente entero en /gallery
const props = defineProps({ obra: { type: Object, required: true } })

// La primera foto de cada paso (hasta cuatro): lo que encontraron, y cómo se resolvió
const muestra = props.obra.pasos.slice(0, 4).map(p => p.fotos[0])
const total = fotosDe(props.obra).length
const GIRO = [-7, 4, -3, 8]
</script>

<template>
  <div class="obra">
    <div class="texto">
      <p v-aparecer class="aparece antetitulo">From a real job</p>
      <h3 v-aparecer="60" class="aparece titulo-3">{{ obra.titulo }}</h3>
      <p v-aparecer="120" class="aparece resumen">{{ obra.resumen }}</p>
      <NuxtLink v-aparecer="180" :to="`/gallery#${obra.id}`" class="aparece ver">
        See the whole job, step by step ({{ total }} photos) <span aria-hidden="true">→</span>
      </NuxtLink>
    </div>
    <NuxtLink :to="`/gallery#${obra.id}`" class="abanico" :aria-label="`See ${obra.titulo}`">
      <figure
        v-for="(x, i) in muestra" :key="x.src" v-aparecer="i * 90"
        class="aparece copia" :style="{ '--giro': `${GIRO[i]}deg`, '--i': i, '--ancho': x.ancho, '--alto': x.alto }"
      >
        <img :src="x.src" :width="x.ancho" :height="x.alto" :alt="x.texto" loading="lazy" decoding="async">
      </figure>
    </NuxtLink>
  </div>
</template>

<style scoped>
.obra { display: grid; gap: 32px; align-items: center; margin-top: 64px; padding-top: 48px; border-top: 1px solid var(--linea); }
.texto { display: grid; gap: 12px; justify-items: start; }
.titulo-3 { font-size: clamp(24px, 2.6vw, 32px); font-weight: 800; line-height: 1.15; letter-spacing: -.015em; }
.resumen { color: var(--tinta-2); max-width: 50ch; }
.ver { font-weight: 700; color: var(--azul); text-decoration: none; }
.ver:hover { text-decoration: underline; }

/* Las copias, en abanico; al pasar por encima se enderezan y se abren */
.abanico { position: relative; display: flex; justify-content: center; height: 300px; }
.copia {
  position: absolute;
  top: 50%;
  left: 50%;
  width: min(calc(var(--ancho) * 1px), 190px);
  aspect-ratio: var(--ancho) / var(--alto);
  margin: 0;
  padding: 7px 7px 20px;
  box-sizing: content-box;
  background: #fff;
  border-radius: 3px;
  box-shadow: 0 1px 2px rgba(15, 36, 64, .12), 0 10px 26px rgba(15, 36, 64, .16);
  translate: calc(-50% + (var(--i) - 1.5) * 70px) -50%;
  rotate: var(--giro);
  transition: rotate .35s var(--curva), translate .35s var(--curva);
}
.copia img { display: block; width: 100%; height: 100%; object-fit: cover; background: #e9edf2; }
.abanico:hover .copia { rotate: calc(var(--giro) * .3); translate: calc(-50% + (var(--i) - 1.5) * 96px) -50%; }

@media (min-width: 900px) {
  .obra { grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr); gap: 48px; }
  .abanico { height: 360px; }
  .copia { width: min(calc(var(--ancho) * 1px), 210px); }
}
</style>
