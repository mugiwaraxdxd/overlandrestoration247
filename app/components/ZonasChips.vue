<script setup>
import { ZONAS } from '~/utils/contenido'
</script>

<!-- Las zonas donde trabajan; cada una lleva a su página -->
<template>
  <ul class="zonas">
    <li v-for="(z, i) in ZONAS" :key="z.slug" v-aparecer="i * 30" class="aparece">
      <NuxtLink :to="`/areas/${z.slug}`" :class="{ base: z.base }">
        <Icono nombre="pin" />{{ z.nombre }}<small v-if="z.base">Home base</small>
      </NuxtLink>
    </li>
  </ul>
</template>

<style scoped>
.zonas { list-style: none; padding: 0; display: flex; flex-wrap: wrap; gap: 10px; }
a {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 46px;
  padding: 0 18px 0 14px;
  border-radius: var(--pildora);
  background: var(--blanco);
  box-shadow: var(--sombra);
  font-weight: 600;
  text-decoration: none;
  transition: transform .2s var(--curva), box-shadow .2s var(--curva);
}
a:hover { transform: translateY(-2px); box-shadow: var(--sombra-alta); }
a svg { width: 18px; height: 18px; color: var(--azul); }
a.base { background: var(--azul); color: #fff; }
a.base svg { color: #fff; }
small { font-size: 12px; font-weight: 700; padding: 2px 8px; border-radius: var(--pildora); background: rgba(255, 255, 255, .2); }
</style>
