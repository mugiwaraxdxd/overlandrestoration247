<script setup>
// Una reseña real: sus estrellas, su texto (con su frase clave subrayada al entrar en pantalla),
// quién, cuándo y dónde. Las largas, plegadas con «Read more».
const props = defineProps({ resena: { type: Object, required: true } })

const LARGA = 300
const abierta = ref(false)
const larga = computed(() => props.resena.texto.length > LARGA)

// El texto en tres trozos: antes, la frase y después (para subrayar la frase)
const trozos = computed(() => {
  const { texto, frase } = props.resena
  const i = frase ? texto.indexOf(frase) : -1
  if (i < 0) return { antes: texto, frase: '', despues: '' }
  return { antes: texto.slice(0, i), frase, despues: texto.slice(i + frase.length) }
})
const inicial = computed(() => props.resena.nombre.trim()[0]?.toUpperCase() || '·')
</script>

<template>
  <article :id="resena.id" v-aparecer class="aparece resena" :class="{ larga: larga && !abierta }">
    <span class="estrellas" :aria-label="`${resena.estrellas} stars`">{{ '★'.repeat(resena.estrellas) }}</span>
    <p class="texto">{{ trozos.antes }}<mark v-if="trozos.frase">{{ trozos.frase }}</mark>{{ trozos.despues }}</p>
    <button v-if="larga" class="mas" type="button" @click="abierta = !abierta">{{ abierta ? 'Show less' : 'Read more' }}</button>
    <footer>
      <span class="inicial" aria-hidden="true">{{ inicial }}</span>
      <span><b>{{ resena.nombre }}</b><small>{{ resena.mes }} · {{ resena.plataforma }}</small></span>
      <span class="marca" :class="resena.plataforma.toLowerCase()" :title="resena.plataforma" aria-hidden="true">{{ resena.plataforma === 'Yelp' ? 'yelp' : 'G' }}</span>
    </footer>
  </article>
</template>

<style scoped>
.resena {
  display: grid;
  gap: 12px;
  padding: 22px;
  border: 1px solid var(--linea);
  border-radius: 20px;
  background: var(--blanco);
  box-shadow: var(--sombra);
  break-inside: avoid;
}
.estrellas { font-size: 16px; letter-spacing: 3px; color: #f5b301; }
.texto { font-size: 16px; line-height: 1.6; color: var(--tinta-2); }
.larga .texto {
  display: -webkit-box;
  -webkit-line-clamp: 7;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
/* La frase clave: un trazo de rotulador que se dibuja al entrar la tarjeta */
mark {
  color: var(--tinta);
  font-weight: 600;
  background: linear-gradient(transparent 58%, rgba(26, 100, 200, .2) 58%) no-repeat 0 0 / 0% 100%;
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
  transition: background-size 1.1s var(--curva) .35s;
}
.visto mark { background-size: 100% 100%; }
.mas { justify-self: start; padding: 0; border: 0; background: none; color: var(--azul); font: inherit; font-size: 14px; font-weight: 700; cursor: pointer; }
footer { display: flex; align-items: center; gap: 12px; padding-top: 4px; }
footer b { display: block; font-size: 15px; color: var(--tinta); }
footer small { display: block; font-size: 13px; color: var(--tinta-3); }
.inicial {
  flex: none;
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--azul-suave);
  color: var(--azul);
  font-weight: 800;
}
.marca { margin-left: auto; font-size: 15px; font-weight: 800; }
.marca.google { color: #4285f4; }
.marca.yelp { color: #d32323; font-size: 14px; }
</style>
