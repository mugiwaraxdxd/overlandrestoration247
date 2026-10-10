<script setup>
import { useLimpieza } from '~/composables/useLimpieza'

// Cómo trabajamos: cinco pasos y, al lado, un medidor fijo que lee ESTA pared: la humedad baja con
// la limpieza de toda la página (la misma que el moho), así nunca dice «seco» con moho a la vista.
// Los pasos y el equipo, de su web (INFO_WEB_ACTUAL.md: servicios de agua y de moho).
const PASOS = [
  { titulo: 'You call', texto: 'Day or night, the owner answers. You get what to do right now, before we even arrive.', equipo: 'Owner on the phone', lectura: 38 },
  { titulo: 'We find all the water', texto: 'Moisture meters and thermal imaging map the damage, including what is hiding behind walls and under floors.', equipo: 'Moisture meter · thermal camera', lectura: 36 },
  { titulo: 'Extraction & containment', texto: 'Standing water out. For mold, the area is sealed off and the air filtered under negative pressure so spores don\'t travel.', equipo: 'Extractors · HEPA · containment', lectura: 29 },
  { titulo: 'Drying & remediation', texto: 'Industrial air movers and dehumidifiers dry the structure. Mold is removed, surfaces cleaned and sanitized.', equipo: 'Air movers · dehumidifiers', lectura: 18 },
  { titulo: 'Repairs & clearance', texto: 'We rebuild what had to come out and verify the result with clearance testing. Then it\'s like it never happened.', equipo: 'Reconstruction · clearance test', lectura: 12 }
]

const seccion = ref(null)
const avance = ref(0)   // 0..1 a lo largo de los pasos

const { progresoPagina } = useLimpieza()
const actual = computed(() => Math.min(PASOS.length - 1, Math.floor(avance.value * PASOS.length)))
const humedad = computed(() => Math.round(38 - 26 * progresoPagina.value))
const seco = computed(() => humedad.value <= 15)
const limpieza = computed(() => Math.round(progresoPagina.value * 100))

let pendiente = false
function medir() {
  pendiente = false
  const s = seccion.value
  if (!s) return
  const r = s.getBoundingClientRect()
  const vista = window.innerHeight
  avance.value = Math.min(1, Math.max(0, (vista * 0.55 - r.top) / Math.max(1, r.height - vista * 0.6)))
}
function alMoverse() {
  if (pendiente) return
  pendiente = true
  requestAnimationFrame(medir)
}
onMounted(() => {
  medir()
  window.addEventListener('scroll', alMoverse, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('scroll', alMoverse))
</script>

<template>
  <section id="como-trabajamos" ref="seccion" class="como" data-dano="agua">
    <div class="lateral">
      <!-- El titular fuera del bloque fijo: un sticky aísla la mezcla del texto con la pared -->
      <div class="cabeza">
        <h2 class="sobre-pared"><span class="tira">From the call<br>to dry.</span></h2>
      </div>
      <div class="fijo">
        <!-- El medidor: lee esta pared (la de la página); dice «Dry» solo cuando ya no queda moho -->
        <div class="medidor" :class="{ seco }">
          <div class="fila">
            <span class="etiqueta-mono">This wall · moisture</span>
            <span class="estado etiqueta-mono">{{ seco ? 'Dry' : 'Wet' }}</span>
          </div>
          <div class="lectura">{{ humedad }}<span>%</span></div>
          <div class="fila">
            <span class="etiqueta-mono">Cleanup</span>
            <span class="etiqueta-mono">{{ limpieza }}%</span>
          </div>
          <div class="progreso" aria-hidden="true"><span :style="{ transform: `scaleX(${progresoPagina})` }" /></div>
          <div class="fila pie-medidor">
            <span class="etiqueta-mono">Step {{ actual + 1 }} / {{ PASOS.length }}</span>
            <span class="etiqueta-mono">Dry at ≤ 15%</span>
          </div>
        </div>
      </div>
    </div>

    <ol class="pasos">
      <li v-for="(paso, i) in PASOS" :key="paso.titulo" class="paso" :class="{ activo: i === actual, pasado: i < actual }">
        <span class="numero etiqueta-mono mezcla"><span class="tira">{{ String(i + 1).padStart(2, '0') }}</span></span>
        <h3 class="mezcla"><span class="tira">{{ paso.titulo }}</span></h3>
        <p class="mezcla"><span class="tira">{{ paso.texto }}</span></p>
        <span class="equipo etiqueta-mono">{{ paso.equipo }}</span>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.como {
  position: relative;
  display: grid;
  gap: 24px;
  padding: 40px var(--margen) 96px;
}

.lateral { display: grid; gap: 20px; align-content: start; }
.fijo {
  position: sticky;
  top: calc(var(--alto-cabecera) + 12px);
  z-index: 2;
}
.cabeza { display: grid; gap: 12px; }
h2 {
  font-weight: 500;
  font-size: clamp(34px, 5vw, 72px);
  line-height: .96;
  letter-spacing: -.01em;
  text-transform: uppercase;
}

.medidor {
  width: min(100%, 360px);
  padding: 14px 16px 16px;
  background: var(--papel);
  box-shadow: inset 0 0 0 1px var(--carbon);
  border-radius: 4px;
  display: grid;
  gap: 8px;
}
.fila { display: flex; justify-content: space-between; align-items: center; }
.fila .etiqueta-mono { font-size: 11px; color: var(--ceniza); }
.estado {
  padding: 2px 8px;
  background: var(--obra);
  color: var(--carbon) !important;
  transition: background-color .3s var(--curva), color .3s var(--curva);
}
.medidor.seco .estado { background: var(--seco); color: var(--papel) !important; }
.lectura {
  font-family: var(--fuente-datos);
  font-weight: 500;
  font-size: clamp(56px, 7vw, 96px);
  line-height: 1;
  letter-spacing: -.03em;
  font-variant-numeric: tabular-nums;
}
.lectura span { font-size: .4em; color: var(--ceniza); margin-left: 4px; }
.progreso { height: 6px; background: var(--niebla); box-shadow: inset 0 0 0 1px var(--hormigon); overflow: hidden; }
.progreso span { display: block; height: 100%; background: var(--carbon); transform-origin: left; transition: background-color .35s var(--curva); }
.medidor.seco .progreso span { background: var(--seco); }

.pasos { list-style: none; padding: 0; display: grid; }
.paso {
  display: grid;
  gap: 10px;
  align-content: center;
  min-height: 62svh;
  padding: 32px 0;
  border-top: 1px solid var(--hierro);
}
/* El paso activo, a todo color; los demás, atenuados con el color (la opacidad aislaría la mezcla) */
.mezcla {
  color: #8a8a8a;
  transition: color .4s var(--curva);
}
.paso.pasado .mezcla { color: var(--hierro); }
.paso.activo h3, .paso.activo p { color: var(--carbon); }
.paso.activo .numero { color: var(--hierro); }
h3 {
  font-weight: 500;
  font-size: clamp(28px, 3.4vw, 48px);
  line-height: 1;
  text-transform: uppercase;
}
.paso p { max-width: 46ch; font-size: 18px; }
.equipo {
  justify-self: start;
  padding: 5px 10px;
  background: var(--obra);
  font-size: 11.5px;
}

/* Móvil: el medidor, pegado arriba y compacto */
@media (max-width: 899px) {
  .medidor { grid-template-columns: auto 1fr; align-items: center; gap: 4px 14px; width: 100%; }
  .medidor .fila:first-child { grid-column: 1 / -1; }
  .lectura { font-size: 48px; grid-row: span 2; }
  .progreso { grid-column: 2; }
  .pie-medidor { display: none; }
  .paso { min-height: 48svh; }
}
@media (min-width: 900px) {
  .como { grid-template-columns: minmax(320px, 1fr) 1.25fr; gap: clamp(32px, 6vw, 120px); }
}
</style>
