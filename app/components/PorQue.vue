<script setup>
// Por qué un negocio de un solo dueño: sus cuatro valores, con sus palabras (web actual, «Why choose us?»)
const VALORES = [
  { titulo: 'Integrity-driven service', texto: 'We do the right thing every time, even when no one is watching. Honesty and transparency with every homeowner and property manager.' },
  { titulo: 'No shortcuts, ever', texto: 'We never rush a job or cut corners to save time or cost. Every project is done thoroughly and correctly, beyond the minimum standard.' },
  { titulo: 'Straightforward pricing', texto: 'Fair, honest and explained from the start. No hidden fees, no surprise charges: just the cost of the work that was done.' },
  { titulo: 'Owner-direct service', texto: 'The owner works directly with every customer, start to finish. Clear communication and one person accountable for your job.' }
]
</script>

<template>
  <section class="porque" data-dano="tormenta" data-fuerza="0.85">
    <div class="cabeza">
      <h2 v-aparecer="80" class="aparece sobre-pared"><span class="tira">One owner.<br>No shortcuts.</span></h2>
    </div>

    <blockquote v-aparecer class="aparece cita">
      <p>“I work directly with every customer from start to finish.”</p>
      <footer class="etiqueta-mono">The owner · Overland Restoration 24/7</footer>
    </blockquote>

    <div class="rejilla">
      <article v-for="(v, i) in VALORES" :key="v.titulo" class="celda">
        <span v-aparecer="i * 80" class="aparece numero etiqueta-mono sobre-pared-3"><span class="tira">{{ String(i + 1).padStart(2, '0') }}</span></span>
        <h3 v-aparecer="i * 80 + 40" class="aparece sobre-pared"><span class="tira">{{ v.titulo }}</span></h3>
        <p v-aparecer="i * 80 + 80" class="aparece sobre-pared-2"><span class="tira">{{ v.texto }}</span></p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.porque { position: relative; padding: 40px var(--margen) 96px; display: grid; gap: 40px; }
.cabeza { display: grid; gap: 14px; }
h2 {
  font-weight: 500;
  font-size: clamp(36px, 6vw, 88px);
  line-height: .95;
  letter-spacing: -.01em;
  text-transform: uppercase;
}
.cita {
  justify-self: start;
  max-width: 820px;
  padding: 22px 26px;
  background: var(--papel);
  box-shadow: inset 4px 0 0 var(--obra), inset 0 0 0 1px var(--hormigon);
}
.cita p { font-size: clamp(22px, 2.6vw, 34px); line-height: 1.2; font-weight: 500; }
.cita footer { margin-top: 12px; color: var(--ceniza); }

.rejilla { display: grid; border-top: 1px solid var(--hierro); column-gap: 32px; }
.celda {
  display: grid;
  align-content: start;
  gap: 12px;
  padding: 26px 4px 30px;
  border-bottom: 1px solid var(--hierro);
}
h3 { font-weight: 500; font-size: 24px; line-height: 1.05; text-transform: uppercase; }
.celda p { font-size: 16px; }
@media (min-width: 700px) { .rejilla { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1200px) { .rejilla { grid-template-columns: repeat(4, 1fr); } }
</style>
