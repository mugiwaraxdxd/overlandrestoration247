<script setup>
import { PASOS } from '~/utils/contenido'

// Cómo trabajan: cinco pasos numerados, unidos por una línea que se dibuja al llegar
const raiz = ref(null)
const visto = ref(false)
let obs = null
onMounted(() => {
  obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { visto.value = true; obs.disconnect() } }, { rootMargin: '0px 0px -20% 0px' })
  obs.observe(raiz.value)
})
onBeforeUnmount(() => obs?.disconnect())
</script>

<template>
  <ol ref="raiz" class="pasos" :class="{ visto }">
    <li v-for="(p, i) in PASOS" :key="p.titulo" class="paso" :style="{ '--i': i }">
      <span class="numero">{{ i + 1 }}</span>
      <div>
        <h3><Icono :nombre="p.icono" />{{ p.titulo }}</h3>
        <p>{{ p.texto }}</p>
      </div>
    </li>
  </ol>
</template>

<style scoped>
.pasos { list-style: none; padding: 0; display: grid; gap: 0; position: relative; }
.paso {
  position: relative;
  display: grid;
  grid-template-columns: 48px 1fr;
  gap: 18px;
  padding-bottom: 32px;
  opacity: 0;
  transform: translateY(14px);
  transition: opacity .5s var(--curva), transform .5s var(--curva);
  transition-delay: calc(var(--i) * 140ms);
}
.visto .paso { opacity: 1; transform: none; }
/* La línea que une los pasos */
.paso:not(:last-child)::before {
  content: '';
  position: absolute;
  left: 23px;
  top: 52px;
  bottom: 4px;
  width: 2px;
  background: var(--azul-suave);
}
.numero {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--azul);
  color: #fff;
  font-weight: 800;
  font-size: 18px;
  box-shadow: 0 0 0 6px var(--azul-suave);
}
h3 { display: flex; align-items: center; gap: 10px; font-size: 20px; font-weight: 800; line-height: 1.3; padding-top: 10px; }
h3 svg { width: 20px; height: 20px; color: var(--azul); }
p { color: var(--tinta-2); margin-top: 4px; max-width: 52ch; }

@media (min-width: 1000px) {
  .pasos { grid-template-columns: repeat(5, 1fr); gap: 24px; }
  .paso { grid-template-columns: none; gap: 18px; padding-bottom: 0; }
  .paso:not(:last-child)::before { left: 60px; right: -12px; top: 23px; bottom: auto; width: auto; height: 2px; }
  h3 { padding-top: 0; font-size: 18px; }
}
</style>
