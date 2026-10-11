<script setup>
import EstadoEscena from './EstadoEscena.vue'

// Agua: una habitación con agua en el suelo y una gotera. Al restaurarse, el agua se extrae (baja
// el nivel), entra un ventilador de secado soplando, el cerco de la pared se va y el medidor de
// humedad baja de 38 % a 12 %.
const props = defineProps({ activo: Boolean, visible: Boolean, interactivo: Boolean })

const fase = ref(0)
const giro = ref(0)
const { suave } = useProgresoEscena(toRef(props, 'activo'), toRef(props, 'visible'), {
  restaurar: 2600,
  fpsTactil: 30,
  alCuadro: (t, dt) => {
    fase.value += dt * 0.0026
    if (t > 0.05 && t < 0.995) giro.value = (giro.value + dt * 1.4) % 360
  }
})

// La superficie del agua: dos senos que se mueven
function ola(base, amp, f, k) {
  let d = `M -10 ${base}`
  for (let x = -10; x <= 410; x += 10) {
    const y = base + Math.sin(x * k + f) * amp + Math.sin(x * k * 2.3 - f * 1.4) * amp * 0.35
    d += ` L ${x} ${y.toFixed(2)}`
  }
  return `${d} L 410 260 L -10 260 Z`
}

const nivel = computed(() => 196 - 46 * (1 - suave.value))      // y de la superficie
const hayAgua = computed(() => suave.value < 0.985)
const ola1 = computed(() => ola(nivel.value, 3.2 * (1 - suave.value) + 0.4, fase.value, 0.035))
const ola2 = computed(() => ola(nivel.value + 4, 2.4 * (1 - suave.value) + 0.3, fase.value * 1.3 + 2, 0.05))
const humedad = computed(() => `${Math.round(38 - 26 * suave.value)}%`)
const listo = computed(() => suave.value > 0.96)
</script>

<template>
  <div class="agua" :class="{ quieta: !visible }">
    <svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="agua-pared" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#f4f0e8" />
          <stop offset="1" stop-color="#e8e2d6" />
        </linearGradient>
        <linearGradient id="agua-agua" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#5fa2ea" stop-opacity=".55" />
          <stop offset="1" stop-color="#1a64c8" stop-opacity=".7" />
        </linearGradient>
        <linearGradient id="agua-ventana" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#cfe6ff" />
          <stop offset="1" stop-color="#9cc8f7" />
        </linearGradient>
      </defs>

      <!-- La habitación -->
      <rect width="400" height="250" fill="url(#agua-pared)" />
      <rect x="250" y="34" width="96" height="86" rx="4" fill="#fff" />
      <rect x="256" y="40" width="84" height="74" rx="2" fill="url(#agua-ventana)" />
      <path d="M298 40v74M256 77h84" stroke="#fff" stroke-width="4" />
      <!-- el cerco que deja el agua en la pared -->
      <path
        d="M0 140 C40 134 70 146 110 139 S180 132 220 141 S300 136 340 142 S380 138 400 140"
        fill="none" stroke="#a88a5a" stroke-width="2.4" stroke-linecap="round"
        :opacity="0.75 * (1 - suave)"
      />
      <path
        d="M0 140 C40 134 70 146 110 139 S180 132 220 141 S300 136 340 142 S380 138 400 140 L400 196 L0 196 Z"
        fill="#cdb88f" :opacity="0.3 * (1 - suave)"
      />
      <!-- zócalo y suelo de madera -->
      <rect x="0" y="190" width="400" height="8" fill="#fbfaf7" />
      <rect x="0" y="198" width="400" height="52" fill="#c8a677" />
      <path d="M0 214h400M0 232h400M60 198v16M170 198v16M290 198v16M110 214v18M230 214v18M350 214v18M40 232v18M200 232v18M320 232v18" stroke="#a9875a" stroke-width="1.2" />

      <!-- la gotera del techo -->
      <g :opacity="Math.max(0, 1 - suave * 3)">
        <path d="M118 0 C120 6 116 10 120 14" stroke="#a88a5a" stroke-width="2" fill="none" />
        <circle class="gota" cx="120" cy="16" r="3.4" fill="#4b8fe0" />
      </g>

      <!-- el agua -->
      <g v-if="hayAgua">
        <path :d="ola1" fill="url(#agua-agua)" />
        <path :d="ola2" fill="#1a64c8" opacity=".22" />
        <path :d="`M30 ${nivel + 10}h40M150 ${nivel + 16}h56M270 ${nivel + 9}h34`" stroke="#fff" stroke-width="2" stroke-linecap="round" :opacity=".55 * (1 - suave)" />
      </g>

      <!-- el ventilador de secado entra y sopla -->
      <g :transform="`translate(${400 - 118 * Math.min(1, suave * 1.6)} 0)`">
        <g transform="translate(18 150)">
          <rect x="-4" y="40" width="72" height="10" rx="4" fill="#1f2a37" />
          <circle cx="32" cy="22" r="30" fill="#1a64c8" />
          <circle cx="32" cy="22" r="23" fill="#0f2440" />
          <g :transform="`rotate(${giro} 32 22)`">
            <path d="M32 22 L32 4 A18 18 0 0 1 47 13 Z M32 22 L48 31 A18 18 0 0 1 36 40 Z M32 22 L17 32 A18 18 0 0 1 16 13 Z" fill="#7fb2ee" />
          </g>
          <circle cx="32" cy="22" r="4" fill="#fff" />
        </g>
      </g>
      <g v-if="suave > 0.12 && suave < 0.995" opacity=".8" class="aire">
        <path d="M265 160 Q 220 150 180 162" />
        <path d="M265 176 Q 210 170 150 180" />
        <path d="M265 192 Q 225 188 190 194" />
      </g>
    </svg>
    <EstadoEscena texto="Water on the floor" hecho="Dry" :listo="listo" :dato="humedad" />
  </div>
</template>

<style scoped>
.agua { position: absolute; inset: 0; }
svg { width: 100%; height: 100%; display: block; }
.gota { animation: caer 1.6s cubic-bezier(.5, 0, 1, .6) infinite; }
@keyframes caer {
  0% { transform: translateY(0); opacity: 0; }
  10% { opacity: 1; }
  80% { transform: translateY(175px); opacity: 1; }
  100% { transform: translateY(180px); opacity: 0; }
}
.quieta .gota, .quieta .aire path { animation-play-state: paused; }
.aire path { fill: none; stroke: #7fb2ee; stroke-width: 2.4; stroke-linecap: round; stroke-dasharray: 10 14; animation: soplar .6s linear infinite; }
.aire { transition: opacity .3s; }
@keyframes soplar { to { stroke-dashoffset: 24; } }
</style>
