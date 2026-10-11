<script setup>
// Lo que dice un cliente, junto a lo que prometemos: la frase de su reseña, quién y dónde.
// Lleva a la página de reseñas. «oscura»: sobre fondo oscuro (la linterna)
defineProps({ cita: { type: Object, default: null }, oscura: Boolean })
</script>

<template>
  <NuxtLink v-if="cita" to="/reviews" class="cita-resena" :class="{ oscura }">
    <span class="estrellas" aria-label="5 stars">★★★★★</span>
    <q>{{ cita.texto }}</q>
    <span class="quien">{{ cita.nombre }} · {{ cita.plataforma }}</span>
  </NuxtLink>
</template>

<style scoped>
.cita-resena {
  display: grid;
  gap: 4px;
  padding-left: 14px;
  border-left: 3px solid #f5b301;
  color: var(--tinta);
  text-decoration: none;
}
.estrellas { font-size: 13px; letter-spacing: 2px; color: #f5b301; }
q { font-size: 15px; font-weight: 600; line-height: 1.45; quotes: '“' '”'; }
.quien { font-size: 13px; color: var(--tinta-3); }
.cita-resena:hover q { text-decoration: underline; text-decoration-color: rgba(26, 100, 200, .35); text-underline-offset: 3px; }
.oscura { color: #fff; }
.oscura .quien { color: #cfd6e0; }
</style>
