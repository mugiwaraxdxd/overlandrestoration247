<script setup>
import EstadoEscena from './EstadoEscena.vue'

// Moho: una esquina con moho y esporas flotando en el aire. Al restaurarse se enciende el
// purificador HEPA (presión negativa): las esporas se van hacia su boca y desaparecen, la mancha
// se retira y la calidad del aire pasa de «Poor» a «Clean». Al irse, vuelven a soltarse esporas.
const props = defineProps({ activo: Boolean, visible: Boolean, interactivo: Boolean })

const raiz = ref(null)
const lienzo = ref(null)
const giro = ref(0)
const vivas = ref(0)

const TOTAL = 90
let esporas = []
let ctx = null
let ancho = 0
let alto = 0
let escala = 1
let ro = null
let soltar = 0

// Dónde nace el moho (la esquina de arriba a la izquierda) y dónde aspira la máquina (en px)
const foco = () => ({ x: ancho * 0.2, y: alto * 0.26 })
const boca = () => ({ x: ancho * 0.79, y: alto * 0.6 })

function nueva(cerca = true) {
  const f = foco()
  const a = Math.random() * Math.PI * 2
  const d = cerca ? Math.random() * Math.min(ancho, alto) * 0.3 : 0
  return {
    x: cerca ? f.x + Math.cos(a) * d : Math.random() * ancho,
    y: cerca ? f.y + Math.sin(a) * d : Math.random() * alto * 0.85,
    vx: (Math.random() - 0.5) * 0.15,
    vy: (Math.random() - 0.5) * 0.15,
    r: 1.2 + Math.random() * 2.4,
    viva: true
  }
}

function medir() {
  const r = raiz.value.getBoundingClientRect()
  escala = Math.min(window.devicePixelRatio || 1, 2)
  ancho = Math.max(1, Math.round(r.width))
  alto = Math.max(1, Math.round(r.height))
  lienzo.value.width = ancho * escala
  lienzo.value.height = alto * escala
  ctx = lienzo.value.getContext('2d')
  ctx.setTransform(escala, 0, 0, escala, 0, 0)
  if (!esporas.length) esporas = Array.from({ length: TOTAL }, (_, i) => nueva(i % 3 !== 0))
}

function mover(dt) {
  const b = boca()
  const aspira = props.activo
  for (const e of esporas) {
    if (!e.viva) continue
    // vagar
    e.vx += (Math.random() - 0.5) * 0.02
    e.vy += (Math.random() - 0.5) * 0.02
    if (aspira) {
      const dx = b.x - e.x
      const dy = b.y - e.y
      const d = Math.max(8, Math.hypot(dx, dy))
      const f = 0.06 + 18 / d
      e.vx += (dx / d) * f * 0.7
      e.vy += (dy / d) * f * 0.7
      if (d < 16) e.viva = false
    } else {
      e.vy -= 0.002   // flotan hacia arriba despacio
    }
    e.vx *= aspira ? 0.94 : 0.97
    e.vy *= aspira ? 0.94 : 0.97
    e.x += e.vx * dt * 0.06
    e.y += e.vy * dt * 0.06
    if (!aspira) {
      if (e.x < 0) e.x += ancho
      if (e.x > ancho) e.x -= ancho
      if (e.y < 0) e.y += alto * 0.85
      if (e.y > alto * 0.9) e.y -= alto * 0.85
    }
  }
  // sin aspirar, el moho vuelve a soltar esporas
  if (!aspira) {
    soltar += dt
    while (soltar > 50) {
      soltar -= 50
      const i = esporas.findIndex(e => !e.viva)
      if (i < 0) break
      esporas[i] = nueva(true)
    }
  }
  vivas.value = esporas.filter(e => e.viva).length
}

function pintar() {
  if (!ctx) return
  ctx.clearRect(0, 0, ancho, alto)
  for (const e of esporas) {
    if (!e.viva) continue
    ctx.fillStyle = 'rgba(70, 72, 48, .14)'
    ctx.beginPath()
    ctx.arc(e.x, e.y, e.r * 2, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = 'rgba(52, 50, 34, .85)'
    ctx.beginPath()
    ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2)
    ctx.fill()
  }
}

const { suave } = useProgresoEscena(toRef(props, 'activo'), toRef(props, 'visible'), {
  restaurar: 2600,
  alCuadro: (t, dt) => {
    if (props.activo) giro.value = (giro.value + dt * 1.3) % 360
    mover(dt)
    pintar()
  }
})

onMounted(() => {
  medir()
  pintar()
  ro = new ResizeObserver(() => { medir(); pintar() })
  ro.observe(raiz.value)
})
onBeforeUnmount(() => ro?.disconnect())

const calidad = computed(() => {
  const v = vivas.value
  if (v > 55) return 'Poor'
  if (v > 25) return 'Fair'
  if (v > 4) return 'Good'
  return 'Clean'
})
const listo = computed(() => vivas.value <= 4 && suave.value > 0.9)
</script>

<template>
  <div ref="raiz" class="moho">
    <svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="moho-pared" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#eef1f0" />
          <stop offset="1" stop-color="#e2e7e5" />
        </linearGradient>
        <radialGradient id="moho-mancha">
          <stop offset="0" stop-color="#2c2e22" stop-opacity=".9" />
          <stop offset=".55" stop-color="#4d4a33" stop-opacity=".55" />
          <stop offset="1" stop-color="#7a6f4c" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="250" fill="url(#moho-pared)" />
      <!-- la esquina del techo -->
      <path d="M0 0 L0 250" stroke="#d4dad8" stroke-width="10" />
      <rect x="0" y="0" width="400" height="10" fill="#f7f9f8" />
      <!-- la mancha de moho, que se retira -->
      <g :transform="`translate(80 64) scale(${1 - 0.95 * suave})`" :opacity="1 - suave">
        <ellipse cx="0" cy="0" rx="78" ry="54" fill="url(#moho-mancha)" />
        <circle cx="-30" cy="-12" r="14" fill="#2c2e22" opacity=".7" />
        <circle cx="18" cy="8" r="10" fill="#2c2e22" opacity=".6" />
        <circle cx="-6" cy="22" r="7" fill="#3a3a2a" opacity=".6" />
        <circle cx="34" cy="-18" r="6" fill="#3a3a2a" opacity=".55" />
        <circle cx="-48" cy="14" r="5" fill="#3a3a2a" opacity=".5" />
      </g>
      <!-- el zócalo y el suelo -->
      <rect x="0" y="200" width="400" height="8" fill="#fbfcfb" />
      <rect x="0" y="208" width="400" height="42" fill="#cdd5d3" />

      <!-- el purificador HEPA -->
      <g transform="translate(272 104)">
        <rect x="0" y="0" width="96" height="104" rx="10" fill="#1f2a37" />
        <rect x="6" y="6" width="84" height="74" rx="6" fill="#273444" />
        <circle cx="48" cy="44" r="30" fill="#0f2440" />
        <g :transform="`rotate(${giro} 48 44)`">
          <path d="M48 44 L48 18 A26 26 0 0 1 70 31 Z M48 44 L71 57 A26 26 0 0 1 52 70 Z M48 44 L26 58 A26 26 0 0 1 24 30 Z" fill="#5fa2ea" opacity=".85" />
        </g>
        <circle cx="48" cy="44" r="5" fill="#fff" />
        <path d="M14 18h68M14 70h68" stroke="#3b4a5e" stroke-width="2" />
        <text x="12" y="96" font-size="11" font-weight="800" fill="#fff" font-family="Plus Jakarta Sans, sans-serif">HEPA</text>
        <circle cx="82" cy="92" r="5" :fill="activo ? '#4ade80' : '#cf4410'" />
        <rect x="10" y="104" width="10" height="8" fill="#111827" />
        <rect x="76" y="104" width="10" height="8" fill="#111827" />
      </g>
    </svg>
    <canvas ref="lienzo" class="esporas" aria-hidden="true" />
    <EstadoEscena texto="Mold spores in the air" hecho="Air clean" :listo="listo" :dato="calidad" />
  </div>
</template>

<style scoped>
.moho { position: absolute; inset: 0; }
svg, .esporas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
</style>
