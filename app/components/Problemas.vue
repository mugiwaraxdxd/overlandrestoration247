<script setup>
// «What happened?»: el cliente piensa en su problema, no en un catálogo de 18 servicios.
// En el orden de su web: agua, fuego y tormenta primero, luego el moho.
// Las celdas son transparentes: detrás de cada una, la pared con su daño
const PROBLEMAS = [
  { n: '01', dano: 'agua', titulo: 'Water', linea: 'Leaks, burst pipes, floods. Extraction and structural drying, started within hours.', pasos: ['Extraction', 'Moisture mapping', 'Drying'] },
  { n: '02', dano: 'fuego', titulo: 'Fire & smoke', linea: 'Soot and odor removal, board-up, and the rebuild after it.', pasos: ['Board-up', 'Soot', 'Odor'] },
  { n: '03', dano: 'tormenta', titulo: 'Storm', linea: 'Hurricane, wind and hail. Tarping first, then everything the storm reached.', pasos: ['Tarping', 'Water removal', 'Repairs'] },
  { n: '04', dano: 'moho', titulo: 'Mold', linea: 'Testing, containment and removal by a Florida licensed mold remediator.', pasos: ['Containment', 'HEPA', 'Clearance test'] }
]
</script>

<template>
  <section id="servicios" class="problemas">
    <div class="cabeza">
      <h2 v-aparecer="80" class="aparece sobre-pared"><span class="tira">Tell us what you're looking at. We take it from there.</span></h2>
    </div>
    <div class="rejilla">
      <!-- Detrás de cada tarjeta, su daño (lo pinta la pared de la página) -->
      <a v-for="(pr, i) in PROBLEMAS" :key="pr.n" class="celda" href="#" :data-dano="pr.dano">
        <span v-aparecer="i * 90" class="aparece etiqueta-mono sobre-pared-3"><span class="tira">{{ pr.n }}</span></span>
        <h3 v-aparecer="i * 90 + 40" class="aparece sobre-pared"><span class="tira">{{ pr.titulo }}</span></h3>
        <p v-aparecer="i * 90 + 80" class="aparece sobre-pared-2"><span class="tira">{{ pr.linea }}</span></p>
        <ul v-aparecer="i * 90 + 120" class="aparece sobre-pared">
          <li v-for="paso in pr.pasos" :key="paso" class="etiqueta-mono">{{ paso }}</li>
        </ul>
        <span class="ver etiqueta-mono sobre-pared">See how we handle it <span aria-hidden="true">→</span></span>
      </a>
    </div>
  </section>
</template>

<style scoped>
.problemas {
  position: relative;
  padding: 40px var(--margen) 96px;
}
.cabeza { display: grid; gap: 14px; margin-bottom: 40px; max-width: 900px; }
h2 {
  font-weight: 500;
  font-size: clamp(30px, 4.6vw, 56px);
  line-height: 1;
  letter-spacing: -.01em;
  text-transform: uppercase;
}

/* La rejilla del informe: solo sus líneas; la pared se ve a través */
.rejilla {
  display: grid;
  grid-template-columns: 1fr;
  border-top: 1px solid var(--hierro);
}
.celda {
  position: relative;
  display: grid;
  align-content: start;
  gap: 12px;
  padding: 26px 4px 30px;
  border-bottom: 1px solid var(--hierro);
  text-decoration: none;
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
.celda:hover::after { transform: scaleX(1); }
h3 {
  font-weight: 500;
  font-size: 32px;
  line-height: 1;
  text-transform: uppercase;
}
.celda p { font-size: 16px; max-width: 34ch; }
ul { display: flex; flex-wrap: wrap; gap: 6px; padding: 0; list-style: none; }
li {
  padding: 4px 10px;
  border-radius: var(--radio-pildora);
  box-shadow: inset 0 0 0 1px currentColor;
  font-size: 11px;
}
.ver { margin-top: 6px; font-size: 12px; }
.ver span { display: inline-block; transition: transform .25s var(--curva); }
.celda:hover .ver span { transform: translateX(4px); }

@media (min-width: 700px) {
  .rejilla { grid-template-columns: repeat(2, 1fr); column-gap: 32px; }
}
@media (min-width: 1200px) {
  .rejilla { grid-template-columns: repeat(4, 1fr); }
  .celda { min-height: 320px; }
  .ver { margin-top: auto; }
}
</style>
