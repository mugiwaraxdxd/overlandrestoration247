<script setup>
// «What happened?»: el cliente piensa en su problema, no en un catálogo de 18 servicios
const PROBLEMAS = [
  { n: '01', titulo: 'Water', linea: 'Leaks, burst pipes, floods. Extraction and structural drying, started within hours.', pasos: ['Extraction', 'Moisture mapping', 'Drying'] },
  { n: '02', titulo: 'Mold', linea: 'Testing, containment and removal by a Florida licensed mold remediator.', pasos: ['Containment', 'HEPA', 'Clearance test'] },
  { n: '03', titulo: 'Fire & smoke', linea: 'Soot and odor removal, board-up, and the rebuild after it.', pasos: ['Board-up', 'Soot', 'Odor'] },
  { n: '04', titulo: 'Storm', linea: 'Hurricane, wind and hail. Tarping first, then everything the storm reached.', pasos: ['Tarping', 'Water removal', 'Repairs'] }
]
</script>

<template>
  <section id="servicios" class="problemas">
    <div class="cabeza" data-limpio>
      <p v-aparecer class="aparece etiqueta-mono">What happened?</p>
      <h2 v-aparecer="80" class="aparece">Tell us what you're looking at. We take it from there.</h2>
    </div>
    <div class="rejilla">
      <a v-for="(pr, i) in PROBLEMAS" :key="pr.n" v-aparecer="i * 90" class="aparece celda" href="#">
        <span class="etiqueta-mono numero">{{ pr.n }}</span>
        <h3>{{ pr.titulo }}</h3>
        <p>{{ pr.linea }}</p>
        <ul>
          <li v-for="paso in pr.pasos" :key="paso" class="etiqueta-mono">{{ paso }}</li>
        </ul>
        <span class="ver etiqueta-mono">See how we handle it <span aria-hidden="true">→</span></span>
      </a>
    </div>
  </section>
</template>

<style scoped>
.problemas {
  position: relative;
  padding: 96px var(--margen) 120px;
}
.cabeza { display: grid; gap: 14px; margin-bottom: 40px; max-width: 900px; }
.cabeza .etiqueta-mono { color: var(--ceniza); }
h2 {
  font-weight: 500;
  font-size: clamp(30px, 4.6vw, 56px);
  line-height: 1;
  letter-spacing: -.01em;
  text-transform: uppercase;
}

/* La rejilla del informe: líneas de 1px compartidas, sin sombras ni radios */
.rejilla {
  display: grid;
  grid-template-columns: 1fr;
  border-top: 1px solid var(--hormigon);
  border-left: 1px solid var(--hormigon);
}
.celda {
  position: relative;
  display: grid;
  align-content: start;
  gap: 12px;
  padding: 24px 22px 28px;
  border-right: 1px solid var(--hormigon);
  border-bottom: 1px solid var(--hormigon);
  text-decoration: none;
  color: var(--carbon);
  background: var(--papel);
  transition: background-color .25s var(--curva);
}
.celda::after {
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
.celda:hover { background: var(--niebla); }
.celda:hover::after { transform: scaleX(1); }
.numero { color: var(--ceniza); }
h3 {
  font-weight: 500;
  font-size: 30px;
  line-height: 1;
  text-transform: uppercase;
}
.celda p { color: var(--hierro); font-size: 16px; max-width: 34ch; }
ul { display: flex; flex-wrap: wrap; gap: 6px; padding: 0; list-style: none; }
li {
  padding: 4px 10px;
  border-radius: var(--radio-pildora);
  box-shadow: inset 0 0 0 1px var(--carbon);
  font-size: 11px;
}
.ver { margin-top: 6px; font-size: 12px; }
.ver span { display: inline-block; transition: transform .25s var(--curva); }
.celda:hover .ver span { transform: translateX(4px); }

@media (min-width: 700px) { .rejilla { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1200px) {
  .rejilla { grid-template-columns: repeat(4, 1fr); }
  .celda { padding: 28px 26px 32px; min-height: 340px; }
  .ver { margin-top: auto; }
}
</style>
