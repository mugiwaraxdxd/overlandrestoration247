<script setup>
// Todos los servicios de su web que caen en este grupo, cada uno con su ficha (su texto, lo que
// incluye) y su ancla: el menú y sus URLs de siempre llevan directo a ella
defineProps({ servicio: { type: Object, required: true } })

const frases = (t = '', n = 2) => (t.match(/[^.!?]+[.!?]+/g) || [t]).slice(0, n).join('').trim()
const resto = (t = '') => (t.match(/[^.!?]+[.!?]+/g) || []).slice(2).join('').trim()
</script>

<template>
  <div class="catalogo">
    <article
      v-for="(x, i) in servicio.catalogo" :id="x.ancla" :key="x.ancla"
      v-aparecer="(i % 2) * 80" class="aparece tarjeta item"
    >
      <header>
        <span class="numero">{{ String(i + 1).padStart(2, '0') }}</span>
        <h3>{{ x.titulo }}</h3>
      </header>
      <p class="resumen">{{ frases(x.intro[0]) }}</p>
      <ul v-if="x.puntos.length" class="incluye">
        <li v-for="pt in x.puntos" :key="pt.titulo"><Icono nombre="check" />{{ pt.titulo }}</li>
      </ul>
      <details v-if="resto(x.intro[0]) || x.intro[1]">
        <summary>Read more <Icono nombre="mas" /></summary>
        <p v-if="resto(x.intro[0])">{{ resto(x.intro[0]) }}</p>
        <p v-if="x.intro[1]">{{ x.intro[1] }}</p>
      </details>
    </article>
  </div>
</template>

<style scoped>
.catalogo { display: grid; gap: 20px; }
.item { display: grid; gap: 14px; align-content: start; padding: 26px; scroll-margin-top: calc(var(--alto-cabecera) + 20px); }
header { display: flex; align-items: center; gap: 12px; }
.numero {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: var(--azul-suave);
  color: var(--azul);
  font-weight: 800;
  font-size: 14px;
  flex: none;
}
h3 { font-size: 20px; font-weight: 800; line-height: 1.25; }
.resumen { color: var(--tinta-2); }
.incluye { list-style: none; padding: 0; display: flex; flex-wrap: wrap; gap: 6px; }
.incluye li {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px 5px 9px;
  border-radius: var(--pildora);
  background: var(--bruma);
  font-size: 13px;
  font-weight: 600;
}
.incluye svg { width: 14px; height: 14px; color: var(--verde); stroke-width: 2.6; }
details { border-top: 1px solid var(--linea); padding-top: 12px; }
summary { list-style: none; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; color: var(--azul); font-weight: 700; font-size: 15px; }
summary::-webkit-details-marker { display: none; }
summary svg { width: 16px; height: 16px; transition: transform .3s var(--curva); }
details[open] summary svg { transform: rotate(45deg); }
details p { margin-top: 10px; color: var(--tinta-2); font-size: 16px; }

/* Llegando por el menú o por su URL de siempre, la ficha se resalta un momento */
.item:target { animation: resaltar 2.4s var(--curva); }
@keyframes resaltar {
  0%, 40% { box-shadow: 0 0 0 3px var(--azul), var(--sombra-alta); }
  100% { box-shadow: var(--sombra); }
}

@media (min-width: 900px) { .catalogo { grid-template-columns: 1fr 1fr; } }
</style>
