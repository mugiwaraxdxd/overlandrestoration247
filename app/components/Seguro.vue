<script setup>
// El seguro: lo que documentan (de su web: «We document the damage, provide detailed reports…»)
const DOCUMENTA = [
  { n: 'Photos', titulo: 'Every room, every step', texto: 'Before, during and after. The adjuster sees exactly what was there and what was done.' },
  { n: 'Readings', titulo: 'Moisture, measured', texto: 'Moisture readings and mapping, day by day until it is dry. Numbers, not opinions.' },
  { n: 'Reports', titulo: 'A clear, detailed report', texto: 'The scope of work, the damage and the cause, written so your claim is processed without delays.' }
]
</script>

<template>
  <section class="seguro">
    <div class="cabeza">
      <p v-aparecer class="aparece etiqueta-mono sobre-pared-3">Your insurance</p>
      <h2 v-aparecer="80" class="aparece sobre-pared">We document everything<br>for your claim.</h2>
      <p v-aparecer="140" class="aparece entradilla sobre-pared-2">
        Most homeowner policies cover sudden water damage; gradual damage may not.
        Either way, proper documentation is what gets a claim approved. That part is on us.
      </p>
    </div>

    <div class="rejilla">
      <article v-for="(d, i) in DOCUMENTA" :key="d.n" class="celda">
        <span v-aparecer="i * 90" class="aparece anotacion etiqueta-mono">{{ d.n }}</span>
        <h3 v-aparecer="i * 90 + 40" class="aparece sobre-pared">{{ d.titulo }}</h3>
        <p v-aparecer="i * 90 + 80" class="aparece sobre-pared-2">{{ d.texto }}</p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.seguro { position: relative; padding: 112px var(--margen) 120px; }
.cabeza { display: grid; gap: 14px; margin-bottom: 40px; max-width: 900px; }
h2 {
  font-weight: 500;
  font-size: clamp(32px, 5vw, 64px);
  line-height: .98;
  letter-spacing: -.01em;
  text-transform: uppercase;
}
.entradilla { max-width: 56ch; font-size: 18px; }

.rejilla { display: grid; border-top: 1px solid var(--hierro); }
.celda {
  display: grid;
  align-content: start;
  gap: 12px;
  padding: 26px 4px 30px;
  border-bottom: 1px solid var(--hierro);
}
.anotacion { justify-self: start; padding: 4px 10px; background: var(--obra); font-size: 11.5px; }
h3 { font-weight: 500; font-size: 26px; line-height: 1.05; text-transform: uppercase; }
.celda p { font-size: 16px; max-width: 36ch; }
@media (min-width: 900px) { .rejilla { grid-template-columns: repeat(3, 1fr); column-gap: 32px; } }
</style>
