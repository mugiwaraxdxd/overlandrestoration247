<script setup>
// Preguntas frecuentes: las de su web, tal cual (algo resumidas)
const PREGUNTAS = [
  { p: 'What should I do immediately after water damage?', r: 'Stop the source of the water if it is safe to do so, and stay out of areas with standing water or any electrical risk. Then call us right away: we assess the damage, start extraction and prevent mold or structural damage.' },
  { p: 'How quickly does mold grow after water damage?', r: 'Mold can begin developing within 24 to 48 hours if moisture is not properly removed. That is why fast, professional drying matters, and why we focus on thorough moisture detection from the start.' },
  { p: 'Do you work with insurance claims?', r: 'Yes. We document the damage, provide detailed reports and help make the process as smooth as possible, advocating for proper restoration, not shortcuts.' },
  { p: 'Why choose an owner-operated restoration company?', r: 'You deal directly with the owner throughout the entire process: clear communication, personal accountability and a level of care that large companies with rotating crews rarely match.' },
  { p: 'Is mold remediation safe for children and pets?', r: 'Yes. We use industry-standard containment, air filtration and non-toxic cleaning methods to keep your family and pets safe during remediation.' },
  { p: 'How long does restoration take?', r: 'It depends on the type and severity of the damage. Small water losses can take 1 to 3 days; larger cases, several weeks. You get an accurate estimate after the inspection and updates along the way.' }
]
</script>

<template>
  <section id="preguntas" class="preguntas">
    <div class="cabeza">
      <p v-aparecer class="aparece etiqueta-mono sobre-pared-3">FAQ</p>
      <h2 v-aparecer="80" class="aparece sobre-pared">Straight answers.</h2>
    </div>
    <div class="lista">
      <details v-for="(q, i) in PREGUNTAS" :key="q.p" v-aparecer="i * 60" class="aparece pregunta">
        <summary>
          <span>{{ q.p }}</span>
          <span class="signo" aria-hidden="true" />
        </summary>
        <p>{{ q.r }}</p>
      </details>
    </div>
  </section>
</template>

<style scoped>
.preguntas { position: relative; padding: 112px var(--margen) 120px; display: grid; gap: 36px; }
.cabeza { display: grid; gap: 14px; }
h2 {
  font-weight: 500;
  font-size: clamp(36px, 6vw, 88px);
  line-height: .95;
  letter-spacing: -.01em;
  text-transform: uppercase;
}
.lista { max-width: 980px; border-top: 1px solid var(--hierro); }
.pregunta { background: var(--papel); border-bottom: 1px solid var(--hormigon); }
summary {
  list-style: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 20px 20px 20px 22px;
  font-weight: 500;
  font-size: clamp(18px, 1.8vw, 22px);
  line-height: 1.25;
}
summary::-webkit-details-marker { display: none; }
summary:hover { background: var(--niebla); }
.signo { position: relative; flex: none; width: 18px; height: 18px; }
.signo::before, .signo::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 8px;
  height: 2px;
  background: var(--carbon);
  transition: transform .3s var(--curva);
}
.signo::after { transform: rotate(90deg); }
details[open] .signo::after { transform: rotate(0deg); }
details[open] summary { box-shadow: inset 4px 0 0 var(--obra); }
.pregunta p { padding: 0 22px 22px; color: var(--hierro); max-width: 70ch; }
</style>
