<script setup>
import { PASOS } from '~/utils/contenido'

// «How we work», contado con el scroll: una habitación inundada se queda fija mientras se baja y
// pasa por los cinco pasos. 1 suena el teléfono y contesta el dueño; 2 una cámara térmica recorre
// la pared y descubre la humedad escondida; 3 contención, HEPA y extracción del agua; 4 ventiladores
// y deshumidificador (el medidor baja); 5 el rodillo repinta la pared y pasa la prueba final.
const seccion = ref(null)
const fijo = ref(null)
const p = ref(0)
const fase = ref(0)
let objetivo = 0
let bucle = 0
let visible = false
let reducido = false
let observador = null

const N = PASOS.length
const paso = computed(() => Math.min(N - 1, Math.floor(p.value * N)))
// El avance dentro de un paso (0..1), suavizado
const en = (i) => computed(() => {
  const x = Math.min(1, Math.max(0, p.value * N - i))
  return x * x * (3 - 2 * x)
})
const p1 = en(0)
const p2 = en(1)
const p3 = en(2)
const p4 = en(3)
const p5 = en(4)

// Lo que cambia en la escena
const nivelAgua = computed(() => 74 * (1 - p3.value))                                // alto del agua (px)
const humedad = computed(() => Math.round(38 - 26 * p4.value))
const seco = computed(() => humedad.value <= 15)
const telefono = computed(() => Math.min(1, p1.value * 3) * (1 - Math.min(1, p2.value * 5)))   // aparece y se va antes de la cámara
const contestado = computed(() => p1.value > 0.45)
const visor = computed(() => 40 + 380 * p2.value)                                     // la cámara recorre
const termica = computed(() => (p2.value > 0.02 && p2.value < 0.995 ? 1 : 0))
const marcas = computed(() => Math.min(1, p2.value * 1.4) * (1 - p5.value))         // lo descubierto queda marcado
const contencion = computed(() => p3.value * (1 - Math.min(1, p5.value * 1.6)))       // baja en 3, sube en 5
const maquinas = computed(() => p4.value * (1 - Math.min(1, p5.value * 2)))
const pintura = computed(() => p5.value)
const mancha = computed(() => (1 - p4.value * 0.7) * (1 - p5.value))
const moho = computed(() => 1 - p3.value)
const sello = computed(() => (p5.value > 0.85 ? 1 : 0))

// El minuto de la llamada
const reloj = computed(() => `0:${String(Math.floor(p1.value * 40)).padStart(2, '0')}`)

function ola(base, amp, f, k) {
  let d = `M -10 ${base}`
  for (let x = -10; x <= 610; x += 12) {
    const y = base + Math.sin(x * k + f) * amp + Math.sin(x * k * 2.3 - f * 1.4) * amp * 0.35
    d += ` L ${x} ${y.toFixed(1)}`
  }
  return `${d} L 610 410 L -10 410 Z`
}
const superficie = computed(() => ola(400 - nivelAgua.value, 3 * (nivelAgua.value / 74) + 0.3, fase.value, 0.03))

// Las palas de los ventiladores
const giro = computed(() => (fase.value * 140) % 360)

function medir() {
  const s = seccion.value
  const f = fijo.value
  if (!s || !f) return
  const recorrido = s.offsetHeight - f.offsetHeight
  const arriba = s.getBoundingClientRect().top - (parseFloat(getComputedStyle(f).top) || 0)
  objetivo = recorrido > 0 ? Math.min(1, Math.max(0, -arriba / recorrido)) : 0
}

function cuadro() {
  bucle = 0
  medir()
  const d = objetivo - p.value
  p.value = Math.abs(d) < 0.0005 ? objetivo : p.value + d * 0.14
  fase.value += 0.045
  if (visible) bucle = requestAnimationFrame(cuadro)
}

onMounted(() => {
  reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reducido) { p.value = 1; return }
  observador = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting
    if (visible && !bucle) bucle = requestAnimationFrame(cuadro)
  })
  observador.observe(seccion.value)
})
onBeforeUnmount(() => {
  cancelAnimationFrame(bucle)
  observador?.disconnect()
})
</script>

<template>
  <section id="como-trabajamos" ref="seccion" class="proceso">
    <div ref="fijo" class="fijo">
      <div class="envoltura rejilla">
        <div class="texto">
          <p class="antetitulo">How we work</p>
          <h2 class="titulo-2">From your call to a dry, restored home.</h2>
          <ol class="pasos">
            <li v-for="(x, i) in PASOS" :key="x.titulo" :class="{ activo: i === paso, hecho: i < paso }">
              <span class="numero">
                <Icono v-if="i < paso" nombre="check" />
                <template v-else>{{ i + 1 }}</template>
              </span>
              <div>
                <h3>{{ x.titulo }}</h3>
                <p>{{ x.texto }}</p>
              </div>
            </li>
          </ol>
          <div class="avance" aria-hidden="true"><span :style="{ transform: `scaleX(${p})` }" /></div>
        </div>

        <div class="marco">
          <svg class="escena" viewBox="0 0 600 400" aria-hidden="true">
            <defs>
              <linearGradient id="pr-pared" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#f3efe7" />
                <stop offset="1" stop-color="#e6dfd2" />
              </linearGradient>
              <linearGradient id="pr-pintura" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#f7f8fb" />
                <stop offset="1" stop-color="#eef2f8" />
              </linearGradient>
              <linearGradient id="pr-agua" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#5fa2ea" stop-opacity=".55" />
                <stop offset="1" stop-color="#1a64c8" stop-opacity=".75" />
              </linearGradient>
              <linearGradient id="pr-termica" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stop-color="#f97316" />
                <stop offset=".5" stop-color="#fbbf24" />
                <stop offset="1" stop-color="#ef4444" />
              </linearGradient>
              <radialGradient id="pr-frio">
                <stop offset="0" stop-color="#4c1d95" />
                <stop offset=".45" stop-color="#2563eb" />
                <stop offset=".75" stop-color="#22d3ee" stop-opacity=".8" />
                <stop offset="1" stop-color="#22d3ee" stop-opacity="0" />
              </radialGradient>
              <clipPath id="pr-visor"><rect :x="visor" y="90" width="150" height="150" rx="14" /></clipPath>
              <clipPath id="pr-repintado"><rect x="0" y="0" :width="600 * pintura" height="292" /></clipPath>
            </defs>

            <!-- la habitación -->
            <rect width="600" height="292" fill="url(#pr-pared)" />
            <rect x="430" y="50" width="120" height="110" rx="5" fill="#fff" />
            <rect x="437" y="57" width="106" height="96" rx="3" fill="#bfe0fb" />
            <path d="M490 57v96M437 105h106" stroke="#fff" stroke-width="5" />
            <!-- el cerco del agua y el moho junto al enchufe -->
            <g :opacity="mancha">
              <path d="M0 200 C60 192 110 206 170 198 S280 190 340 201 S470 194 600 199 L600 292 L0 292 Z" fill="#cdb88f" opacity=".45" />
              <path d="M0 200 C60 192 110 206 170 198 S280 190 340 201 S470 194 600 199" fill="none" stroke="#a88a5a" stroke-width="3" />
            </g>
            <g :opacity="moho" transform="translate(150 236)">
              <ellipse cx="0" cy="0" rx="62" ry="40" fill="#3a3a2a" opacity=".35" />
              <circle cx="-26" cy="-8" r="12" fill="#2c2e22" opacity=".75" />
              <circle cx="20" cy="6" r="9" fill="#2c2e22" opacity=".7" />
              <circle cx="-6" cy="18" r="6" fill="#2c2e22" opacity=".6" />
              <circle cx="34" cy="-14" r="5" fill="#2c2e22" opacity=".6" />
            </g>
            <rect x="141" y="250" width="18" height="28" rx="3" fill="#fbfaf7" stroke="#d6d1c6" />
            <!-- el repintado (paso 5) -->
            <g clip-path="url(#pr-repintado)">
              <rect width="600" height="292" fill="url(#pr-pintura)" />
              <rect x="430" y="50" width="120" height="110" rx="5" fill="#fff" />
              <rect x="437" y="57" width="106" height="96" rx="3" fill="#bfe0fb" />
              <path d="M490 57v96M437 105h106" stroke="#fff" stroke-width="5" />
              <rect x="141" y="250" width="18" height="28" rx="3" fill="#fff" stroke="#d6d1c6" />
            </g>
            <g v-if="pintura > 0.01 && pintura < 0.995" :transform="`translate(${600 * pintura} 0)`">
              <rect x="-8" y="0" width="16" height="292" rx="8" fill="#1a64c8" />
              <rect x="-3" y="0" width="6" height="292" fill="#5fa2ea" />
            </g>

            <!-- lo que descubrió la cámara (queda marcado) -->
            <g :opacity="marcas">
              <ellipse cx="150" cy="232" rx="92" ry="58" fill="none" stroke="#1a64c8" stroke-width="2.5" stroke-dasharray="7 6" />
              <ellipse cx="330" cy="236" rx="70" ry="44" fill="none" stroke="#1a64c8" stroke-width="2.5" stroke-dasharray="7 6" />
              <g transform="translate(250 150)">
                <rect x="-62" y="-14" width="124" height="28" rx="14" fill="#1a64c8" />
                <text x="0" y="5" text-anchor="middle" font-size="13" font-weight="700" fill="#fff">Hidden moisture</text>
              </g>
            </g>

            <!-- la cámara térmica (paso 2) -->
            <g v-if="termica">
              <g clip-path="url(#pr-visor)">
                <rect width="600" height="292" fill="url(#pr-termica)" />
                <ellipse cx="150" cy="232" rx="98" ry="62" fill="url(#pr-frio)" />
                <ellipse cx="330" cy="236" rx="76" ry="48" fill="url(#pr-frio)" />
                <ellipse cx="60" cy="270" rx="70" ry="30" fill="url(#pr-frio)" opacity=".8" />
              </g>
              <rect :x="visor" y="90" width="150" height="150" rx="14" fill="none" stroke="#0f2440" stroke-width="5" />
              <path :d="`M${visor + 75} 150v30M${visor + 60} 165h30`" stroke="#fff" stroke-width="2" />
              <rect :x="visor + 30" y="240" width="90" height="46" rx="10" fill="#0f2440" />
              <text :x="visor + 75" y="268" text-anchor="middle" font-size="13" font-weight="800" fill="#fff">IR · {{ humedad }}%</text>
            </g>

            <!-- el suelo y el zócalo -->
            <rect x="0" y="286" width="600" height="8" fill="#fbfaf7" />
            <rect x="0" y="294" width="600" height="106" fill="#c8a677" />
            <path d="M0 326h600M0 362h600M80 294v32M240 294v32M420 294v32M150 326v36M330 326v36M510 326v36M60 362v38M280 362v38M470 362v38" stroke="#a9875a" stroke-width="1.5" />

            <!-- la contención (paso 3) -->
            <g :transform="`translate(0 ${-300 * (1 - contencion)})`">
              <rect x="40" y="0" width="300" height="292" fill="#dbeafe" opacity=".55" />
              <path d="M60 0 C 70 100 52 190 64 292 M150 0 C 160 110 142 200 156 292 M250 0 C 258 90 244 210 254 292" stroke="#fff" stroke-width="2" opacity=".7" />
              <path d="M190 40 V 292" stroke="#93c5fd" stroke-width="3" stroke-dasharray="4 4" />
              <rect x="40" y="0" width="300" height="12" fill="#1a64c8" />
            </g>

            <!-- el HEPA y la manguera de extracción (paso 3) -->
            <g :transform="`translate(${-160 + 180 * Math.min(1, p3 * 1.6) - 180 * Math.min(1, p5 * 2)} 0)`">
              <rect x="0" y="228" width="80" height="70" rx="8" fill="#1f2a37" />
              <circle cx="40" cy="258" r="22" fill="#0f2440" />
              <g :transform="`rotate(${giro} 40 258)`"><path d="M40 258 L40 240 A18 18 0 0 1 55 249 Z M40 258 L56 267 A18 18 0 0 1 44 276 Z M40 258 L25 268 A18 18 0 0 1 23 248 Z" fill="#5fa2ea" /></g>
              <text x="40" y="294" text-anchor="middle" font-size="10" font-weight="800" fill="#fff">HEPA</text>
            </g>
            <path
              v-if="p3 > 0.02 && p3 < 0.99"
              d="M610 250 C 560 250 540 330 470 360" fill="none" stroke="#1f2a37" stroke-width="9" stroke-linecap="round"
            />
            <path
              v-if="p3 > 0.02 && p3 < 0.99"
              class="succion" d="M470 360 C 540 330 560 250 610 250" fill="none" stroke="#5fa2ea" stroke-width="3" stroke-linecap="round"
            />

            <!-- el agua -->
            <path v-if="nivelAgua > 0.5" :d="superficie" fill="url(#pr-agua)" />

            <!-- ventiladores y deshumidificador (paso 4) -->
            <g :opacity="maquinas">
              <g v-for="(x, i) in [210, 360]" :key="i" :transform="`translate(${x} 318)`">
                <rect x="-6" y="40" width="72" height="10" rx="4" fill="#1f2a37" />
                <circle cx="30" cy="22" r="30" fill="#1a64c8" />
                <circle cx="30" cy="22" r="23" fill="#0f2440" />
                <g :transform="`rotate(${giro} 30 22)`"><path d="M30 22 L30 4 A18 18 0 0 1 45 13 Z M30 22 L46 31 A18 18 0 0 1 34 40 Z M30 22 L15 32 A18 18 0 0 1 14 13 Z" fill="#7fb2ee" /></g>
              </g>
              <g transform="translate(470 296)">
                <rect x="0" y="0" width="74" height="96" rx="10" fill="#e8edf3" stroke="#c3cfdd" />
                <rect x="12" y="12" width="50" height="26" rx="4" fill="#0f2440" />
                <text x="37" y="31" text-anchor="middle" font-size="14" font-weight="800" fill="#4ade80">{{ humedad }}%</text>
                <path d="M14 52h46M14 62h46M14 72h46" stroke="#c3cfdd" stroke-width="3" stroke-linecap="round" />
              </g>
              <g class="aire" stroke="#7fb2ee">
                <path d="M200 330 Q 150 310 90 322" />
                <path d="M200 345 Q 140 340 70 350" />
                <path d="M350 330 Q 300 300 260 300" />
              </g>
            </g>

            <!-- el teléfono (paso 1) -->
            <g :opacity="telefono" :transform="`translate(250 ${30 + 20 * (1 - Math.min(1, p1 * 3))})`">
              <g v-if="!contestado" class="ondas" fill="none" stroke="#cf4410" stroke-width="3">
                <circle cx="80" cy="120" r="94" />
                <circle cx="80" cy="120" r="94" />
              </g>
              <rect x="0" y="0" width="160" height="250" rx="24" fill="#0f2440" />
              <rect x="8" y="10" width="144" height="230" rx="18" :fill="contestado ? '#16a34a' : '#1c3a63'" />
              <text x="80" y="62" text-anchor="middle" font-size="12" fill="#cfe0f5">{{ contestado ? 'On call · ' + reloj : 'Incoming call' }}</text>
              <text x="80" y="92" text-anchor="middle" font-size="16" font-weight="800" fill="#fff">Overland</text>
              <text x="80" y="112" text-anchor="middle" font-size="12" fill="#cfe0f5">The owner</text>
              <circle cx="80" cy="178" r="24" :fill="contestado ? '#fff' : '#16a34a'" />
              <path d="M70 172c3 7 7 11 14 14l4-4c1-1 2-1 3 0l5 2c1 0 1 1 1 2v5c0 1-1 2-2 2-14 0-27-13-27-27 0-1 1-2 2-2h5c1 0 2 1 2 2l1 5c0 1 0 2-1 3z" :fill="contestado ? '#16a34a' : '#fff'" transform="translate(-6 -8) scale(1.05)" />
            </g>

            <!-- el sello del final -->
            <g :opacity="sello" class="sello" :class="{ visible: sello }">
              <rect x="190" y="112" width="220" height="66" rx="33" fill="#16a34a" />
              <path d="M222 145l10 10 20-22" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
              <text x="330" y="140" text-anchor="middle" font-size="18" font-weight="800" fill="#fff">Restored</text>
              <text x="330" y="160" text-anchor="middle" font-size="12" fill="#dcfce7">Clearance passed</text>
            </g>
          </svg>

          <!-- la lectura del medidor -->
          <div class="lectura" :class="{ seco }">
            <span>Moisture</span>
            <b>{{ humedad }}%</b>
            <em>{{ seco ? 'Dry' : 'Wet' }}</em>
          </div>
          <div class="etiqueta-paso">Step {{ paso + 1 }} of {{ N }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Alto de sobra para que cada paso dure una pantalla larga; lo de dentro se queda fijo */
.proceso { position: relative; height: 560vh; background: var(--blanco); }
.fijo {
  position: sticky;
  top: var(--alto-cabecera);
  height: calc(100svh - var(--alto-cabecera) - var(--alto-barra-movil));
  display: grid;
  align-items: center;
  overflow: hidden;
}
.rejilla { display: grid; gap: 18px; align-items: center; }
.texto { display: grid; gap: 12px; }
.pasos { list-style: none; padding: 0; display: grid; gap: 4px; }
.pasos li {
  display: grid;
  grid-template-columns: 36px 1fr;
  gap: 12px;
  padding: 8px 10px;
  border-radius: 14px;
  transition: background-color .35s var(--curva), opacity .35s var(--curva);
  opacity: .45;
}
.pasos li.activo { opacity: 1; background: var(--azul-suave); }
.pasos li.hecho { opacity: .75; }
.numero {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--bruma);
  color: var(--tinta-2);
  font-weight: 800;
  transition: background-color .35s var(--curva), color .35s var(--curva);
}
.activo .numero { background: var(--azul); color: #fff; }
.hecho .numero { background: #dcfce7; color: var(--verde); }
.numero svg { width: 18px; height: 18px; stroke-width: 2.6; }
h3 { font-size: 17px; font-weight: 800; line-height: 1.3; padding-top: 6px; }
.pasos p { display: none; color: var(--tinta-2); font-size: 15px; margin-top: 2px; }
.activo p { display: block; }
.avance { height: 4px; border-radius: 2px; background: var(--bruma); overflow: hidden; }
.avance span { display: block; height: 100%; background: var(--azul); transform-origin: left; }

.marco { position: relative; border-radius: 24px; overflow: hidden; box-shadow: var(--sombra-alta); background: #e6dfd2; }
.escena { display: block; width: 100%; height: auto; }
.lectura {
  position: absolute;
  left: 12px;
  top: 12px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: var(--pildora);
  background: rgba(255, 255, 255, .95);
  box-shadow: 0 2px 10px rgba(15, 36, 64, .14);
  font-size: 13px;
  font-weight: 700;
  color: var(--tinta-3);
}
.lectura b { color: var(--tinta); font-size: 15px; }
.lectura em { font-style: normal; padding: 1px 8px; border-radius: var(--pildora); background: #fde7dc; color: var(--naranja); transition: background-color .3s, color .3s; }
.lectura.seco em { background: #dcfce7; color: var(--verde); }
.etiqueta-paso {
  position: absolute;
  right: 12px;
  top: 12px;
  padding: 6px 12px;
  border-radius: var(--pildora);
  background: rgba(15, 36, 64, .85);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
}

.ondas circle { animation: onda 1.4s ease-out infinite; transform-origin: center; transform-box: fill-box; }
.ondas circle:nth-child(2) { animation-delay: .7s; }
@keyframes onda { from { transform: scale(.55); opacity: .9; } to { transform: scale(1.15); opacity: 0; } }
.succion { stroke-dasharray: 10 12; animation: chupar .5s linear infinite; }
@keyframes chupar { to { stroke-dashoffset: -22; } }
.aire path { fill: none; stroke-width: 3; stroke-linecap: round; stroke-dasharray: 10 14; animation: chupar .6s linear infinite reverse; }
.sello { transition: opacity .3s; }

/* Móvil: la escena arriba y, debajo, solo el paso de ahora */
@media (max-width: 899px) {
  .titulo-2 { font-size: 26px; }
  .antetitulo { display: none; }
  .pasos li:not(.activo) { display: none; }
  .pasos li { opacity: 1; }
  .texto { order: 2; }
  .marco { order: 1; }
}
@media (min-width: 900px) {
  .rejilla { grid-template-columns: minmax(0, .9fr) minmax(0, 1.3fr); gap: 48px; }
  .pasos { gap: 6px; }
}
</style>
