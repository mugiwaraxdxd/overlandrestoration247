<script setup>
import EstadoEscena from './EstadoEscena.vue'

// Tormenta: una casa de Florida con el tejado abierto bajo la lluvia, el viento y los rayos, y una
// palmera doblada. Al restaurarse: baja la lona azul sobre el tejado (board-up & tarping), para de
// llover, se van las nubes, sale el sol, se calma la palmera y se encienden las ventanas.
const props = defineProps({ activo: Boolean, visible: Boolean, interactivo: Boolean })

const fase = ref(0)
const { suave } = useProgresoEscena(toRef(props, 'activo'), toRef(props, 'visible'), {
  restaurar: 3000,
  alCuadro: (t, dt) => { fase.value += dt * 0.004 }
})

const tramo = (a, b) => computed(() => {
  const x = Math.min(1, Math.max(0, (suave.value - a) / (b - a)))
  return x * x * (3 - 2 * x)
})
const lona = tramo(0, 0.45)        // la lona baja primero
const calma = tramo(0.35, 0.95)    // luego escampa
const viento = computed(() => Math.sin(fase.value) * (9 * (1 - calma.value) + 1.5) - 10 * (1 - calma.value))
const mph = computed(() => `${Math.round(8 + 67 * (1 - calma.value))} mph`)
const listo = computed(() => suave.value > 0.96)

// La lluvia: líneas fijas que la animación hace caer
const GOTAS = Array.from({ length: 46 }, (_, i) => ({ x: (i * 37) % 420 - 10, y: (i * 53) % 250, d: (i % 7) * 0.11 }))
</script>

<template>
  <div class="tormenta">
    <svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="tor-cielo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#3b4656" />
          <stop offset="1" stop-color="#6b7686" />
        </linearGradient>
        <linearGradient id="tor-despejado" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#5fa2ea" />
          <stop offset="1" stop-color="#cfe6ff" />
        </linearGradient>
      </defs>

      <!-- el cielo: de tormenta a despejado -->
      <rect width="400" height="250" fill="url(#tor-cielo)" />
      <rect width="400" height="250" fill="url(#tor-despejado)" :opacity="calma" />
      <g :transform="`translate(0 ${40 * (1 - calma)})`" :opacity="calma">
        <circle cx="330" cy="54" r="26" fill="#ffd65a" />
        <circle cx="330" cy="54" r="38" fill="#ffd65a" opacity=".25" />
      </g>

      <!-- el rayo -->
      <path class="rayo" d="M262 0 L246 46 L262 46 L240 100" fill="none" stroke="#fff6c8" stroke-width="3.5" stroke-linejoin="round" :style="{ opacity: 1 - calma }" />

      <!-- las nubes se van -->
      <g :transform="`translate(${-180 * calma} 0)`" :opacity="1 - calma * 0.9">
        <ellipse cx="90" cy="34" rx="80" ry="26" fill="#2b3442" />
        <ellipse cx="190" cy="22" rx="90" ry="28" fill="#323c4c" />
      </g>
      <g :transform="`translate(${180 * calma} 0)`" :opacity="1 - calma * 0.9">
        <ellipse cx="300" cy="30" rx="96" ry="27" fill="#2b3442" />
      </g>

      <!-- el césped -->
      <rect x="0" y="206" width="400" height="44" fill="#4f9a5e" />
      <rect x="0" y="206" width="400" height="44" fill="#2f6f3e" :opacity="0.5 * (1 - calma)" />

      <!-- la palmera, doblada por el viento -->
      <g transform="translate(60 210)">
        <path d="M0 0 C 2 -40 -2 -80 8 -116" stroke="#8a6a44" stroke-width="7" fill="none" stroke-linecap="round" />
        <g :transform="`translate(8 -116) rotate(${viento})`">
          <path d="M0 0 C 20 -18 44 -14 58 0 C 40 -6 22 -4 0 0Z" fill="#2f8a4e" />
          <path d="M0 0 C -20 -18 -44 -14 -58 0 C -40 -6 -22 -4 0 0Z" fill="#2f8a4e" />
          <path d="M0 0 C 14 -26 36 -34 52 -28 C 34 -24 18 -16 0 0Z" fill="#3aa25c" />
          <path d="M0 0 C -14 -26 -36 -34 -52 -28 C -34 -24 -18 -16 0 0Z" fill="#3aa25c" />
          <path d="M0 0 C 24 4 42 18 48 34 C 34 20 18 10 0 0Z" fill="#2f8a4e" />
        </g>
      </g>

      <!-- la casa -->
      <g transform="translate(150 96)">
        <rect x="6" y="56" width="168" height="58" fill="#f4efe6" />
        <rect x="76" y="76" width="28" height="38" rx="2" fill="#1a64c8" />
        <rect x="24" y="72" width="36" height="26" rx="2" :fill="calma > 0.6 ? '#ffe08a' : '#9fb4c8'" class="ventana" />
        <rect x="120" y="72" width="36" height="26" rx="2" :fill="calma > 0.6 ? '#ffe08a' : '#9fb4c8'" class="ventana" />
        <path d="M24 85h36M42 72v26M120 85h36M138 72v26" stroke="#fff" stroke-width="2" />
        <!-- el tejado, con su agujero y las tejas sueltas -->
        <path d="M-8 60 L90 4 L188 60 Z" fill="#b5523a" />
        <path d="M112 22 L148 40 L136 52 L104 36 Z" fill="#2a1f1a" />
        <path d="M150 32 l12 6 M156 24 l10 6" stroke="#b5523a" stroke-width="4" stroke-linecap="round" :opacity="1 - lona" />
        <!-- la lona azul baja y se ata -->
        <g :transform="`translate(0 ${-110 * (1 - lona)})`" :opacity="lona > 0.01 ? 1 : 0">
          <path d="M92 6 L186 58 L170 64 L82 16 Z" fill="#1a64c8" />
          <path d="M100 10 L176 52" stroke="#5fa2ea" stroke-width="2" />
          <path d="M120 22 L114 62 M150 38 L146 62 M176 54 L180 70" stroke="#e8edf3" stroke-width="1.6" :opacity="lona" />
        </g>
      </g>

      <!-- la lluvia -->
      <g class="lluvia" :opacity="Math.max(0, 1 - calma * 1.2)">
        <line v-for="(g, i) in GOTAS" :key="i" :x1="g.x" :y1="g.y" :x2="g.x - 7" :y2="g.y + 16" :style="{ animationDelay: `${-g.d}s` }" />
      </g>
    </svg>
    <EstadoEscena texto="Roof open · storm" hecho="Tarped & dry" :listo="listo" :dato="mph" />
  </div>
</template>

<style scoped>
.tormenta { position: absolute; inset: 0; }
svg { width: 100%; height: 100%; display: block; }
.lluvia line { stroke: #cfe0f5; stroke-width: 1.6; stroke-linecap: round; opacity: .7; animation: llover .55s linear infinite; }
@keyframes llover { from { transform: translate(0, -30px); } to { transform: translate(-14px, 30px); } }
.rayo { animation: rayo 3.4s steps(1) infinite; }
@keyframes rayo {
  0%, 88%, 92%, 96%, 100% { visibility: hidden; }
  90%, 94% { visibility: visible; }
}
.ventana { transition: fill .6s; }
</style>
