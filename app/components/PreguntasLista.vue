<script setup>
// Preguntas en acordeón; la primera, abierta
defineProps({ preguntas: { type: Array, required: true } })
</script>

<template>
  <div class="lista">
    <details v-for="(q, i) in preguntas" :key="q.p" v-aparecer="i * 50" class="aparece pregunta" :open="i === 0">
      <summary>
        <span>{{ q.p }}</span>
        <span class="signo" aria-hidden="true"><Icono nombre="mas" /></span>
      </summary>
      <p>{{ q.r }}</p>
    </details>
  </div>
</template>

<style scoped>
.lista { display: grid; gap: 12px; }
.pregunta { background: var(--blanco); border-radius: 16px; box-shadow: var(--sombra); }
summary {
  list-style: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 20px 22px;
  font-weight: 700;
  font-size: 17px;
  line-height: 1.35;
}
summary::-webkit-details-marker { display: none; }
.signo {
  display: grid;
  place-items: center;
  flex: none;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--azul-suave);
  color: var(--azul);
  transition: transform .3s var(--curva), background-color .3s var(--curva);
}
.signo svg { width: 18px; height: 18px; }
details[open] .signo { transform: rotate(45deg); background: var(--azul); color: #fff; }
.pregunta p { padding: 0 22px 22px; color: var(--tinta-2); max-width: 75ch; }
</style>
