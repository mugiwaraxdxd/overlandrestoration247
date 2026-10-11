<script setup>
import { ZONAS } from '~/utils/contenido'

// Dónde trabajan, en un mapa esquemático del suroeste de Florida que se dibuja con el scroll:
// Cape Coral late en el centro, se abren los anillos de 10, 20 y 40 millas y van cayendo las
// ciudades, de la más cercana a la más lejana, con su ruta y su distancia en línea recta.
// La base: las coordenadas de sus datos para Google (26.5627, -81.9501). Las ciudades, su centro.
const BASE = { lat: 26.562692, lon: -81.950108 }
const COORDS = {
  'cape-coral': [26.5629, -81.9495], 'fort-myers': [26.6406, -81.8723], 'lehigh-acres': [26.6253, -81.6248],
  'north-fort-myers': [26.6673, -81.8801], 'bonita-springs': [26.3398, -81.7787], estero: [26.4381, -81.8068],
  'san-carlos-park': [26.4673, -81.8015], iona: [26.5204, -81.9637], villas: [26.5501, -81.8687],
  'cypress-lake': [26.5381, -81.899], 'fort-myers-beach': [26.452, -81.9498], naples: [26.142, -81.7948],
  'bonita-beach': [26.3301, -81.8457], sanibel: [26.4489, -82.0223], 'marco-island': [25.9412, -81.7184]
}

// Dónde va el nombre de cada ciudad (donde están apiñadas, para que no se pisen): [dx, dy, anclaje]
const ETIQUETA = {
  'cape-coral': [-16, -10, 'end'], villas: [10, -6, 'start'], 'cypress-lake': [10, 12, 'start'],
  iona: [-10, 10, 'end'], 'fort-myers-beach': [0, 24, 'middle'], 'lehigh-acres': [-10, -12, 'end'], sanibel: [-10, -10, 'end'],
  'bonita-beach': [-10, 5, 'end'], 'bonita-springs': [10, 0, 'start'], estero: [10, 12, 'start'],
  'san-carlos-park': [10, -4, 'start'], 'fort-myers': [10, 6, 'start'], 'north-fort-myers': [10, -6, 'start']
}
const etiqueta = (slug) => ETIQUETA[slug] || [10, 4, 'start']

// La proyección: lo que cabe, de -82.22 a -81.52 de longitud y de 25.88 a 26.78 de latitud
const LON = [-82.22, -81.52]
const LAT = [25.88, 26.78]
const ANCHO = 500
const KM_POR_GRADO = 111.32
const COS = Math.cos((26.33 * Math.PI) / 180)
const ALTO = Math.round(ANCHO * ((LAT[1] - LAT[0]) / ((LON[1] - LON[0]) * COS)))
const PX_POR_KM = ANCHO / ((LON[1] - LON[0]) * KM_POR_GRADO * COS)
const xy = (lat, lon) => [((lon - LON[0]) / (LON[1] - LON[0])) * ANCHO, ((LAT[1] - lat) / (LAT[1] - LAT[0])) * ALTO]
const camino = (puntos) => puntos.map(([lon, lat], i) => `${i ? 'L' : 'M'}${xy(lat, lon).map(n => n.toFixed(1)).join(' ')}`).join(' ')

function millas(a, b) {
  const R = 3958.8
  const r = (g) => (g * Math.PI) / 180
  const dLat = r(b.lat - a.lat)
  const dLon = r(b.lon - a.lon)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

const [bx, by] = xy(BASE.lat, BASE.lon)
const CIUDADES = ZONAS
  .filter(z => COORDS[z.slug])
  .map((z) => {
    const [lat, lon] = COORDS[z.slug]
    const [x, y] = xy(lat, lon)
    return { ...z, x, y, mi: z.base ? 0 : millas(BASE, { lat, lon }) }
  })
  .sort((a, b) => a.mi - b.mi)

// La costa (esquemática): la tierra al este; el río Caloosahatchee; Sanibel y Pine Island
const TIERRA = camino([
  [-82.08, 26.78], [-82.06, 26.7], [-82.035, 26.64], [-82.02, 26.58], [-81.995, 26.535], [-82.01, 26.495],
  [-81.97, 26.475], [-81.95, 26.452], [-81.91, 26.42], [-81.875, 26.37], [-81.852, 26.33], [-81.833, 26.25],
  [-81.815, 26.18], [-81.81, 26.13], [-81.79, 26.05], [-81.755, 25.985], [-81.73, 25.935], [-81.7, 25.88],
  [-81.52, 25.88], [-81.52, 26.78]
]) + ' Z'
const RIO = camino([[-82.0, 26.515], [-81.955, 26.545], [-81.92, 26.575], [-81.885, 26.62], [-81.85, 26.655], [-81.76, 26.71], [-81.62, 26.74], [-81.52, 26.75]])
const SANIBEL = camino([[-82.19, 26.47], [-82.12, 26.447], [-82.06, 26.437], [-82.015, 26.45], [-82.03, 26.46], [-82.09, 26.455], [-82.15, 26.475], [-82.19, 26.49]]) + ' Z'
const PINE = camino([[-82.15, 26.52], [-82.11, 26.54], [-82.1, 26.62], [-82.11, 26.7], [-82.14, 26.72], [-82.16, 26.64], [-82.16, 26.56]]) + ' Z'
const ANILLOS = [10, 20, 40].map(mi => ({ mi, r: mi * 1.609 * PX_POR_KM }))

// El avance con el scroll: 0 al asomar el mapa, 1 cuando ya se ha visto entero
const raiz = ref(null)
const p = ref(0)
let pendiente = false
function medir() {
  pendiente = false
  if (!raiz.value) return
  const r = raiz.value.getBoundingClientRect()
  const vista = window.innerHeight
  p.value = Math.min(1, Math.max(0, (vista * 0.9 - r.top) / (r.height * 0.85)))
}
function alMoverse() {
  if (pendiente) return
  pendiente = true
  requestAnimationFrame(medir)
}
onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { p.value = 1; return }
  medir()
  window.addEventListener('scroll', alMoverse, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('scroll', alMoverse))

// Cuándo cae cada ciudad, y cuánto se ha abierto cada anillo
const cae = (i) => Math.min(1, Math.max(0, (p.value - 0.18 - i * 0.045) / 0.08))
const anillo = (i) => Math.min(1, Math.max(0, (p.value - 0.05 - i * 0.12) / 0.25))
</script>

<template>
  <div class="mapa-zonas">
    <ol class="lista">
      <li v-for="(c, i) in CIUDADES" :key="c.slug" :class="{ visto: cae(i) > 0.5, base: c.base }">
        <NuxtLink :to="`/areas/${c.slug}`">
          <span class="punto" />
          <b>{{ c.nombre }}</b>
          <span class="dist">{{ c.base ? 'Home base' : `${Math.round(c.mi)} mi` }}</span>
        </NuxtLink>
      </li>
    </ol>

    <div ref="raiz" class="marco">
      <svg :viewBox="`0 0 ${ANCHO} ${ALTO}`" role="img" aria-label="Map of the areas we serve in Southwest Florida">
        <defs>
          <linearGradient id="mz-mar" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#d7e9fb" />
            <stop offset="1" stop-color="#b9d8f6" />
          </linearGradient>
          <radialGradient id="mz-halo">
            <stop offset="0" stop-color="#1a64c8" stop-opacity=".22" />
            <stop offset="1" stop-color="#1a64c8" stop-opacity="0" />
          </radialGradient>
        </defs>
        <rect :width="ANCHO" :height="ALTO" fill="url(#mz-mar)" />
        <g class="olas" stroke="#fff" stroke-width="2" fill="none" opacity=".55">
          <path d="M20 150 q 12 -8 24 0 t 24 0" />
          <path d="M40 420 q 12 -8 24 0 t 24 0" />
          <path d="M70 620 q 12 -8 24 0 t 24 0" />
        </g>
        <text x="26" :y="ALTO * 0.56" class="golfo">Gulf of Mexico</text>
        <path :d="TIERRA" fill="#f4f1ea" stroke="#d9d2c3" stroke-width="2" />
        <path :d="SANIBEL" fill="#f4f1ea" stroke="#d9d2c3" stroke-width="2" />
        <path :d="PINE" fill="#f4f1ea" stroke="#d9d2c3" stroke-width="2" />
        <path :d="RIO" fill="none" stroke="#b9d8f6" stroke-width="9" stroke-linecap="round" />

        <!-- los anillos de distancia se abren -->
        <circle :cx="bx" :cy="by" :r="ANILLOS[2].r * 1.05" fill="url(#mz-halo)" :opacity="anillo(0)" />
        <g v-for="(a, i) in ANILLOS" :key="a.mi">
          <circle
            :cx="bx" :cy="by" :r="a.r" fill="none" stroke="#1a64c8" stroke-width="1.5" stroke-dasharray="5 6"
            :style="{ opacity: anillo(i) * 0.7, transform: `scale(${0.6 + 0.4 * anillo(i)})`, transformOrigin: `${bx}px ${by}px` }"
          />
          <text :x="bx + a.r * 0.71 + 4" :y="by - a.r * 0.71 - 4" class="milla" :opacity="anillo(i)">{{ a.mi }} mi</text>
        </g>

        <!-- las rutas desde la base -->
        <line
          v-for="(c, i) in CIUDADES.slice(1)" :key="`r-${c.slug}`"
          :x1="bx" :y1="by" :x2="c.x" :y2="c.y"
          class="ruta" :pathLength="1" :style="{ strokeDashoffset: 1 - cae(i + 1) }"
        />

        <!-- las ciudades caen -->
        <g
          v-for="(c, i) in CIUDADES" :key="c.slug"
          :transform="`translate(${c.x} ${c.y - 18 * (1 - cae(i))})`" :opacity="cae(i)"
        >
          <template v-if="c.base">
            <circle r="16" class="latido" fill="#1a64c8" />
            <circle r="10" fill="#1a64c8" stroke="#fff" stroke-width="3" />
          </template>
          <circle v-else r="6" fill="#fff" stroke="#1a64c8" stroke-width="3" />
          <text :x="etiqueta(c.slug)[0]" :y="etiqueta(c.slug)[1]" :text-anchor="etiqueta(c.slug)[2]" class="nombre" :class="{ base: c.base }">{{ c.nombre }}</text>
        </g>
      </svg>
      <p class="nota">Straight-line distances from our base in Cape Coral · schematic map</p>
    </div>
  </div>
</template>

<style scoped>
.mapa-zonas { display: grid; gap: 28px; align-items: start; }
.lista { list-style: none; padding: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 6px 14px; }
.lista a {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 12px;
  text-decoration: none;
  transition: background-color .2s var(--curva);
}
.lista a:hover { background: var(--bruma); }
.lista li { opacity: .35; transform: translateX(-6px); transition: opacity .4s var(--curva), transform .4s var(--curva); }
.lista li.visto { opacity: 1; transform: none; }
.punto { width: 10px; height: 10px; border-radius: 50%; border: 3px solid var(--azul); flex: none; }
.base .punto { background: var(--azul); }
.lista b { font-size: 15px; }
.dist { margin-left: auto; font-size: 13px; font-weight: 700; color: var(--tinta-3); white-space: nowrap; }
.base .dist { color: var(--azul); }

.marco { position: relative; justify-self: center; width: fit-content; max-width: 100%; border-radius: 24px; overflow: hidden; box-shadow: var(--sombra-alta); background: #d7e9fb; }
svg { display: block; width: 100%; height: auto; }
.golfo { font-size: 15px; font-weight: 700; fill: #5b8ec4; letter-spacing: .08em; font-style: italic; }
.milla { font-size: 12px; font-weight: 700; fill: var(--azul); }
.ruta { stroke: #1a64c8; stroke-width: 1.4; stroke-dasharray: 1; opacity: .35; }
.nombre { font-size: 13px; font-weight: 700; fill: var(--tinta); paint-order: stroke; stroke: #f4f1ea; stroke-width: 4px; stroke-linejoin: round; }
.nombre.base { font-size: 16px; font-weight: 800; fill: var(--azul); }
.latido { animation: latido-mapa 2.2s var(--curva) infinite; transform-box: fill-box; transform-origin: center; }
@keyframes latido-mapa { from { transform: scale(.6); opacity: .5; } to { transform: scale(2.2); opacity: 0; } }
.nota { position: absolute; left: 14px; bottom: 12px; padding: 4px 10px; border-radius: var(--pildora); background: rgba(255, 255, 255, .9); font-size: 12px; color: var(--tinta-3); }

/* Móvil y tableta: el mapa primero. Las ciudades de la lista se encienden con el mapa: debajo de
   ella, el mapa no había entrado aún en pantalla y la lista se quedaba apagada */
@media (max-width: 999px) {
  .marco { order: -1; }
}
/* Móvil: la distancia debajo del nombre (si no, «Fort Myers Beach» ocupaba tres líneas) y la nota
   debajo del mapa (tapaba Marco Island) */
@media (max-width: 599px) {
  .lista { gap: 2px 10px; }
  .lista a { display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: start; column-gap: 10px; row-gap: 0; padding: 8px 8px; }
  .punto { margin-top: 5px; }
  .lista b { line-height: 1.3; }
  .dist { grid-column: 2; margin-left: 0; font-size: 12px; }
  .nota { position: static; padding: 9px 14px; border-radius: 0; font-size: 11px; }
}
@media (min-width: 1000px) {
  .mapa-zonas { grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr); gap: 48px; }
  .lista { grid-template-columns: 1fr; }
  svg { height: min(calc(100vh - 140px), 760px); width: auto; }
}
</style>
