<script setup>
// La nota en estrellas, que se llenan de agua (una tras otra) al entrar en pantalla, con su ola
// moviéndose dentro. Cada estrella se llena hasta lo que le toca de la nota (5.0: todas enteras).
const props = defineProps({ nota: { type: Number, default: 5 } })

const id = useId()
const ESTRELLA = 'M12 2.4l2.95 6.1 6.7.86-4.92 4.62 1.27 6.62L12 17.33 6 20.6l1.27-6.62L2.35 9.36l6.7-.86z'
const llenado = (i) => Math.min(1, Math.max(0, props.nota - i))
</script>

<template>
  <span v-aparecer class="aparece estrellas-agua" role="img" :aria-label="`${nota} out of 5 stars`">
    <svg v-for="i in 5" :key="i" viewBox="0 0 24 24" :style="{ '--i': i - 1, '--hasta': `${(1 - llenado(i - 1)) * 100 - 10}%` }">
      <defs>
        <clipPath :id="`${id}-e${i}`"><path :d="ESTRELLA" /></clipPath>
        <linearGradient :id="`${id}-a${i}`" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#5fa2ea" />
          <stop offset="1" stop-color="#1a64c8" />
        </linearGradient>
      </defs>
      <path :d="ESTRELLA" class="hueco" />
      <g :clip-path="`url(#${id}-e${i})`">
        <g class="agua">
          <path class="ola" :fill="`url(#${id}-a${i})`" d="M-24 2.2q6-2.4 12 0t12 0 12 0 12 0 12 0 12 0V30H-24z" />
          <path class="ola atras" d="M-24 1.6q6 2.4 12 0t12 0 12 0 12 0 12 0 12 0V30H-24z" />
        </g>
      </g>
      <path :d="ESTRELLA" class="borde" />
    </svg>
  </span>
</template>

<style scoped>
.estrellas-agua { display: inline-flex; gap: 4px; }
svg { width: 1em; height: 1em; overflow: visible; }
.hueco { fill: #e6eef8; }
.borde { fill: none; stroke: var(--azul); stroke-width: 1.1; stroke-linejoin: round; }
/* El agua sube hasta su nivel, estrella a estrella, cuando la nota entra en pantalla */
.agua { transform: translateY(105%); transition: transform 1.1s cubic-bezier(.3, .9, .3, 1); transition-delay: calc(var(--i) * 140ms + 200ms); }
.visto .agua { transform: translateY(var(--hasta)); }
.ola { animation: ola 1.8s linear infinite; }
.ola.atras { fill: rgba(95, 162, 234, .35); animation-duration: 2.6s; animation-direction: reverse; }
@keyframes ola { to { transform: translateX(24px); } }
@media (prefers-reduced-motion: reduce) { .ola { animation: none; } }
</style>
