<script setup>
// Dónde trabajan: las 11 zonas de su web, en grande (la base, Cape Coral, marcada)
const ZONAS = ['Cape Coral', 'Fort Myers', 'Lehigh Acres', 'North Fort Myers', 'Bonita Springs', 'Estero', 'San Carlos Park', 'Iona', 'Villas', 'Cypress Lake', 'Fort Myers Beach']
</script>

<template>
  <section id="zonas" class="zonas">
    <div class="cabeza">
      <p v-aparecer class="aparece etiqueta-mono sobre-pared-3">Areas we serve · {{ ZONAS.length }} areas · Southwest Florida</p>
      <h2 v-aparecer="80" class="aparece sobre-pared">Based in Cape Coral.<br>On site fast.</h2>
    </div>
    <ul class="lista">
      <li v-for="(z, i) in ZONAS" :key="z" v-aparecer="i * 40" class="aparece" :class="{ base: i === 0 }">
        <span class="etiqueta-mono n sobre-pared-3">{{ String(i + 1).padStart(2, '0') }}</span><span class="sobre-pared">{{ z }}</span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.zonas { position: relative; padding: 112px var(--margen) 120px; display: grid; gap: 36px; }
.cabeza { display: grid; gap: 14px; }
h2 {
  font-weight: 500;
  font-size: clamp(34px, 5.4vw, 80px);
  line-height: .96;
  letter-spacing: -.01em;
  text-transform: uppercase;
}
.lista {
  list-style: none;
  padding: 0;
  display: grid;
  border-top: 1px solid var(--hierro);
}
.lista li {
  position: relative;
  display: flex;
  align-items: baseline;
  gap: 16px;
  padding: 14px 0;
  border-bottom: 1px solid var(--hierro);
  font-weight: 500;
  font-size: clamp(24px, 3.2vw, 44px);
  line-height: 1.05;
  text-transform: uppercase;
}
.lista li::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 3px;
  background: var(--obra);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform .35s var(--curva);
}
.lista li:hover::after { transform: scaleX(1); }
.n { font-size: 12px; }
.base::before {
  content: 'Base';
  order: 3;
  margin-left: auto;
  align-self: center;
  padding: 3px 8px;
  background: var(--obra);
  font-family: var(--fuente-datos);
  font-size: 11px;
  letter-spacing: .06em;
}
@media (min-width: 900px) {
  .lista { grid-template-columns: repeat(2, 1fr); column-gap: 48px; }
}
</style>
