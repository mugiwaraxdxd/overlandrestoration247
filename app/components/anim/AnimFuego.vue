<script setup>
import EstadoEscena from './EstadoEscena.vue'

// Fuego y humo: un salón cubierto de hollín. En el ordenador, el ratón es una esponja y lo limpias
// tú; si no, la esponja lo limpia sola a pasadas. Debajo aparece el salón tal cual estaba (un
// cuadro, una lámpara). Al irse, el hollín vuelve para el siguiente.
const props = defineProps({ activo: Boolean, visible: Boolean, interactivo: Boolean })

const raiz = ref(null)
const lienzo = ref(null)
const esponja = ref({ x: 0, y: 0, visible: false, giro: 0 })
const limpio = ref(0)          // 0..1, lo limpiado
const fundido = ref(false)     // el hollín nuevo entra fundido

let ctx = null
let ancho = 0
let alto = 0
let escala = 1
let ultimo = null              // el último punto de la esponja (para unir las pasadas)
let manual = 0                 // cuándo se movió el ratón por última vez sobre la escena
let auto = { activo: false, s: 0 }
let bucle = 0
let medidoEn = 0
let volver = null
let ro = null
// Lo que queda de hollín, en una rejilla de 40 × 25 (1 = sucio): se lleva la cuenta al frotar, sin
// leer los píxeles del lienzo (getImageData obliga al móvil a esperar a la GPU)
const GX = 40
const GY = 25
const rejilla = new Float32Array(GX * GY)

function medir() {
  const r = raiz.value.getBoundingClientRect()
  escala = Math.min(window.devicePixelRatio || 1, 2)
  ancho = Math.max(1, Math.round(r.width))
  alto = Math.max(1, Math.round(r.height))
  lienzo.value.width = ancho * escala
  lienzo.value.height = alto * escala
  ctx = lienzo.value.getContext('2d')
  ctx.setTransform(escala, 0, 0, escala, 0, 0)
  ensuciar()
}

// El hollín: más cargado arriba (el humo sube), a manchas, con chorretones y grano
function ensuciar() {
  if (!ctx) return
  ctx.globalCompositeOperation = 'source-over'
  ctx.clearRect(0, 0, ancho, alto)
  const g = ctx.createLinearGradient(0, 0, 0, alto)
  g.addColorStop(0, 'rgba(22, 19, 17, .97)')
  g.addColorStop(0.55, 'rgba(48, 41, 35, .9)')
  g.addColorStop(1, 'rgba(82, 70, 58, .72)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, ancho, alto)
  const azar = semilla(7)
  for (let i = 0; i < 60; i++) {
    const x = azar() * ancho
    const y = azar() * alto
    const r = 10 + azar() * ancho * 0.18
    const m = ctx.createRadialGradient(x, y, 0, x, y, r)
    const oscuro = azar() > 0.45
    m.addColorStop(0, oscuro ? 'rgba(10, 8, 7, .45)' : 'rgba(120, 104, 86, .25)')
    m.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = m
    ctx.fillRect(x - r, y - r, r * 2, r * 2)
  }
  for (let i = 0; i < 26; i++) {
    const x = azar() * ancho
    const largo = alto * (0.15 + azar() * 0.45)
    ctx.fillStyle = `rgba(14, 12, 10, ${0.2 + azar() * 0.3})`
    ctx.fillRect(x, 0, 1 + azar() * 2.5, largo)
  }
  for (let i = 0; i < ancho * alto * 0.02; i++) {
    ctx.fillStyle = azar() > 0.5 ? 'rgba(0,0,0,.25)' : 'rgba(150,130,110,.12)'
    ctx.fillRect(azar() * ancho, azar() * alto, 1.4, 1.4)
  }
  rejilla.fill(1)
  limpio.value = 0
  ultimo = null
}

function semilla(n) {
  let s = n
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 }
}

// Una pasada de esponja: borra con borde suave, uniendo con el punto anterior
function frotar(x, y) {
  if (!ctx) return
  const r = Math.max(26, alto * 0.16)
  ctx.globalCompositeOperation = 'destination-out'
  const desde = ultimo || { x, y }
  const pasos = Math.max(1, Math.ceil(Math.hypot(x - desde.x, y - desde.y) / (r * 0.35)))
  for (let i = 1; i <= pasos; i++) {
    const px = desde.x + (x - desde.x) * (i / pasos)
    const py = desde.y + (y - desde.y) * (i / pasos)
    const m = ctx.createRadialGradient(px, py, r * 0.35, px, py, r)
    m.addColorStop(0, 'rgba(0,0,0,.9)')
    m.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = m
    ctx.beginPath()
    ctx.arc(px, py, r, 0, Math.PI * 2)
    ctx.fill()
    marcarLimpio(px, py, r)
  }
  ultimo = { x, y }
  esponja.value = { x, y, visible: true, giro: Math.max(-18, Math.min(18, (x - desde.x) * 0.6)) }
}

// Lo mismo que hace la pasada en el lienzo (destination-out: 0,9 hasta el 35 % del radio y luego
// bajando hasta 0 en el borde), en las celdas de la rejilla
function marcarLimpio(px, py, r) {
  const cw = ancho / GX
  const ch = alto / GY
  const x0 = Math.max(0, Math.floor((px - r) / cw))
  const x1 = Math.min(GX - 1, Math.floor((px + r) / cw))
  const y0 = Math.max(0, Math.floor((py - r) / ch))
  const y1 = Math.min(GY - 1, Math.floor((py + r) / ch))
  for (let j = y0; j <= y1; j++) {
    for (let i = x0; i <= x1; i++) {
      const d = Math.hypot((i + 0.5) * cw - px, (j + 0.5) * ch - py) / r
      if (d >= 1) continue
      const quita = d < 0.35 ? 0.9 : 0.9 * (1 - (d - 0.35) / 0.65)
      rejilla[j * GX + i] *= 1 - quita
    }
  }
}

// Cuánto se ha limpiado, cada 200 ms
function medirLimpio(ahora) {
  if (ahora - medidoEn < 200) return
  medidoEn = ahora
  let suma = 0
  for (let k = 0; k < rejilla.length; k++) suma += rejilla[k]
  limpio.value = Math.min(1, Math.max(0, 1 - suma / rejilla.length))
}

// La esponja sola: pasadas de lado a lado, de arriba abajo
function cuadro(ahora) {
  bucle = 0
  const manos = ahora - manual < 700
  if (props.activo && !manos && limpio.value < 0.97) {
    auto.s = Math.min(1, auto.s + 16 / 2600)
    const filas = 5
    const fila = Math.min(filas - 1, Math.floor(auto.s * filas))
    const local = (auto.s * filas) % 1
    const ida = fila % 2 === 0
    const x = ancho * (0.06 + 0.88 * (ida ? local : 1 - local))
    const y = alto * ((fila + 0.5) / filas)
    frotar(x, y)
  } else if (!manos) {
    esponja.value = { ...esponja.value, visible: false }
  }
  medirLimpio(ahora)
  if (props.visible && (props.activo || manos)) bucle = requestAnimationFrame(cuadro)
}
function arrancar() { if (!bucle) bucle = requestAnimationFrame(cuadro) }

function alMover(e) {
  if (!props.interactivo) return
  const r = raiz.value.getBoundingClientRect()
  manual = performance.now()
  frotar(e.clientX - r.left, e.clientY - r.top)
  arrancar()
}
function alSalir() {
  ultimo = null
  esponja.value = { ...esponja.value, visible: false }
}

// Al dejar de estar activa, el hollín vuelve (fundido) para el siguiente
watch(() => props.activo, (v) => {
  clearTimeout(volver)
  if (v) {
    auto = { activo: true, s: 0 }
    ultimo = null
    arrancar()
  } else {
    volver = setTimeout(() => {
      fundido.value = true
      ensuciar()
      requestAnimationFrame(() => requestAnimationFrame(() => { fundido.value = false }))
    }, 900)
  }
})
watch(() => props.visible, (v) => { if (v && props.activo) arrancar() })

onMounted(() => {
  medir()
  ro = new ResizeObserver(() => medir())
  ro.observe(raiz.value)
})
onBeforeUnmount(() => {
  cancelAnimationFrame(bucle)
  clearTimeout(volver)
  ro?.disconnect()
})

const listo = computed(() => limpio.value > 0.9)
const dato = computed(() => `${Math.round(limpio.value * 100)}%`)
</script>

<template>
  <div ref="raiz" class="fuego" :class="{ manual: interactivo }" @pointermove="alMover" @pointerleave="alSalir">
    <!-- El salón, como estaba -->
    <svg class="salon" viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="fuego-pared" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#f6f2ea" />
          <stop offset="1" stop-color="#ece5d8" />
        </linearGradient>
        <linearGradient id="fuego-cuadro" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#9fd0f5" />
          <stop offset=".6" stop-color="#5fa2ea" />
          <stop offset="1" stop-color="#2d7a52" />
        </linearGradient>
      </defs>
      <rect width="400" height="250" fill="url(#fuego-pared)" />
      <rect x="128" y="46" width="144" height="98" rx="4" fill="#c8a677" />
      <rect x="136" y="54" width="128" height="82" fill="url(#fuego-cuadro)" />
      <path d="M136 120 L176 92 L206 112 L232 96 L264 118 V136 H136 Z" fill="#2d7a52" opacity=".85" />
      <circle cx="236" cy="74" r="9" fill="#ffe08a" />
      <path d="M58 76 h26 l-6 22 h-14 Z" fill="#f2c46d" />
      <path d="M71 98 v62" stroke="#b08a52" stroke-width="3" />
      <path d="M318 76 h26 l-6 22 h-14 Z" fill="#f2c46d" />
      <path d="M331 98 v62" stroke="#b08a52" stroke-width="3" />
      <rect x="0" y="192" width="400" height="8" fill="#fbfaf7" />
      <rect x="0" y="200" width="400" height="50" fill="#d9c6a4" />
      <rect x="110" y="168" width="180" height="40" rx="10" fill="#1a64c8" />
      <rect x="118" y="156" width="164" height="22" rx="8" fill="#3b7fd8" />
    </svg>
    <canvas ref="lienzo" class="hollin" :class="{ fundido }" aria-hidden="true" />
    <span
      class="esponja"
      :class="{ visible: esponja.visible }"
      :style="{ transform: `translate(${esponja.x}px, ${esponja.y}px) translate(-50%, -50%) rotate(${esponja.giro}deg)` }"
      aria-hidden="true"
    />
    <span v-if="interactivo && !limpio" class="pista">Wipe the soot</span>
    <EstadoEscena texto="Smoke & soot" hecho="Clean" :listo="listo" :dato="dato" />
  </div>
</template>

<style scoped>
.fuego { position: absolute; inset: 0; touch-action: pan-y; }
.fuego.manual { cursor: none; }
.salon, .hollin { position: absolute; inset: 0; width: 100%; height: 100%; }
.hollin { transition: opacity 1s var(--curva); }
.hollin.fundido { opacity: 0; transition: none; }
.esponja {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 2;
  width: 46px;
  height: 30px;
  border-radius: 9px;
  background:
    radial-gradient(circle at 30% 40%, rgba(255, 255, 255, .5) 0 2px, transparent 3px),
    radial-gradient(circle at 70% 60%, rgba(255, 255, 255, .4) 0 2px, transparent 3px),
    linear-gradient(180deg, #ffd25a 0 62%, #2f9e5b 62%);
  box-shadow: 0 6px 14px rgba(0, 0, 0, .35);
  opacity: 0;
  pointer-events: none;
  transition: opacity .2s;
}
.esponja.visible { opacity: 1; }
.pista {
  position: absolute;
  right: 12px;
  bottom: 12px;
  padding: 5px 12px;
  border-radius: var(--pildora);
  background: rgba(255, 255, 255, .92);
  font-size: 12px;
  font-weight: 700;
  color: var(--tinta);
  pointer-events: none;
}
</style>
