<script setup>
import { PASOS } from '~/utils/contenido'
import { crearAgua, SUELO, ZOCALO } from '~/utils/escenaAgua'

// «How we work»: una estancia inundada que se vacía con el scroll, a pantalla completa. El texto de
// cada paso flota dentro del agua, en blanco, y se mece con ella; al vaciarse, emerge: la línea del
// agua lo corta (blanco debajo, oscuro encima) y baja por él hasta dejarlo seco sobre la pared.
// 1 el agua sube y gotea; 2 salen las lecturas de humedad en la pared; 3 el agua se va; 4 el suelo y
// el cerco se secan con el aire y el medidor baja; 5 la pintura nueva borra la marca: «Restored».

const N = PASOS.length
const CUANDO = ['2:07 a.m.', 'Day 1', 'Day 1', 'Days 2–4', 'Day 6']

const seccion = ref(null)
const fijo = ref(null)
const lienzo = ref(null)
const cabeza = ref(null)
const capas = []   // el texto del paso dos veces: seco (oscuro) y mojado (blanco), cortados por el agua
const p = ref(0)
const quieta = ref(true)
const esMovil = ref(false)
let objetivo = 0
let bucle = 0
let visible = false
let reducido = false
let topeFijo = 0
let observador = null
let agua = null

const u = computed(() => Math.min(1, Math.max(0, p.value)) * N)
const activo = computed(() => Math.min(N - 1, Math.floor(u.value)))
const suave = (x) => x * x * (3 - 2 * x)
const tramo = (a, b) => suave(Math.min(1, Math.max(0, (u.value - a) / (b - a))))

// Lo que pasa en la estancia, según por dónde va el scroll
const nivelMax = computed(() => (esMovil.value ? 0.5 : 0.45))
const estado = computed(() => {
  const vaciado = tramo(2.05, 2.9)
  return {
    nivel: nivelMax.value * (0.84 + 0.16 * tramo(0, 0.8)) * (1 - vaciado) - 0.02 * vaciado,
    marca: nivelMax.value + 0.035,
    agitacion: 0.15 + 0.85 * Math.sin(Math.PI * tramo(2, 3)),
    mancha: 1 - 0.65 * tramo(3.05, 3.85),
    pintado: tramo(4.05, 4.75),
    sueloMojado: tramo(2.55, 2.9) * (1 - tramo(3.1, 3.85)),
    aire: tramo(3, 3.12) * (1 - tramo(3.85, 4)),
    goteo: u.value < 2.2
  }
})
const humedad = computed(() => Math.round(38 - 26 * tramo(3.05, 3.85)))
const seco = computed(() => humedad.value <= 15)
const lecturas = computed(() => u.value >= 1.08 && u.value < 4.85)
const restaurado = computed(() => u.value > 4.8)

function medirTope() {
  topeFijo = fijo.value ? parseFloat(getComputedStyle(fijo.value).top) || 0 : 0
}

function medir() {
  const s = seccion.value
  const f = fijo.value
  if (!s || !f) return
  const recorrido = s.offsetHeight - f.offsetHeight
  const arriba = s.getBoundingClientRect().top - topeFijo
  objetivo = recorrido > 0 ? Math.min(1, Math.max(0, -arriba / recorrido)) : 0
}

// El texto del paso: flota bajo la superficie (y se mece) mientras cabe sobre el zócalo; si no, se
// queda apoyado ahí y el agua baja a través de él. Las dos capas, cortadas por la línea del agua
function colocarBloque(t) {
  const [seco, mojado] = capas
  const escena = lienzo.value
  if (!seco || !mojado || !escena) return
  const w = escena.clientWidth
  const h = escena.clientHeight
  const alto = seco.offsetHeight
  const sup = agua && estado.value.nivel > 0 ? h * (1 - estado.value.nivel) : Infinity
  const apoyado = h * (1 - SUELO - ZOCALO) - 18 - alto
  const flotando = sup + 30 < apoyado
  const minimo = cabeza.value ? cabeza.value.offsetTop + cabeza.value.offsetHeight + 12 : 0
  const y = Math.max(minimo, flotando ? sup + 30 + Math.sin(t * 1.3) * 3 : apoyado)
  const mover = `translate3d(0, ${y.toFixed(1)}px, 0)`
  seco.style.transform = mover
  mojado.style.transform = mover
  if (sup === Infinity) {
    seco.style.clipPath = 'none'
    mojado.style.clipPath = 'inset(100% 0 0 0)'
    return
  }
  // la línea del agua, en coordenadas del texto (con su ola)
  const linea = []
  for (let i = 0; i <= 8; i++) {
    const x = (w * i) / 8
    const c = Math.min(alto + 10, Math.max(-10, agua.superficie(x) - y))
    linea.push(`${x.toFixed(0)}px ${c.toFixed(1)}px`)
  }
  mojado.style.clipPath = `polygon(${linea.join(', ')}, 100% 100%, 0 100%)`
  seco.style.clipPath = `polygon(0 0, 100% 0, ${linea.slice().reverse().join(', ')})`
}

// Persigue al scroll con suavidad; mientras hay agua (o aire, o una gota cayendo) la escena se
// mueve sola. Sin nada de eso, no hay bucle
function cuadro(ahora) {
  bucle = 0
  const d = objetivo - p.value
  if (d !== 0) p.value = reducido || Math.abs(d) < 0.0004 ? objetivo : p.value + d * 0.12
  const t = reducido ? 0 : ahora / 1000
  const e = estado.value
  agua?.dibujar(e, t)
  colocarBloque(t)
  const seMueve = !reducido && (e.nivel > 0 || e.aire > 0.01 || agua?.quedaMovimiento())
  if (visible && (p.value !== objetivo || seMueve)) bucle = requestAnimationFrame(cuadro)
}

function arrancar() {
  if (!bucle && visible) bucle = requestAnimationFrame(cuadro)
}

function alMoverse() {
  if (!visible) return
  medir()
  arrancar()
}

function alCambiarTamano() {
  medirTope()
  agua?.medir()
  alMoverse()
}

onMounted(() => {
  reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const movil = window.matchMedia('(max-width: 899px)')
  esMovil.value = movil.matches
  movil.addEventListener('change', (e) => {
    esMovil.value = e.matches
    nextTick(alCambiarTamano)
  })
  medirTope()
  // La textura de la luz del agua se calcula al acercarse, no al cargar la página
  observador = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting
    quieta.value = !visible
    if (visible && !agua) agua = crearAgua(lienzo.value)
    if (visible) alMoverse()
  }, { rootMargin: '300px 0px' })
  observador.observe(seccion.value)
  window.addEventListener('scroll', alMoverse, { passive: true })
  window.addEventListener('resize', alCambiarTamano)
})
onBeforeUnmount(() => {
  cancelAnimationFrame(bucle)
  observador?.disconnect()
  window.removeEventListener('scroll', alMoverse)
  window.removeEventListener('resize', alCambiarTamano)
})
</script>

<template>
  <section id="como-trabajamos" ref="seccion" class="trabajo" :class="{ quieta }">
    <div ref="fijo" class="fijo">
      <div class="escena">
        <div class="zocalo" />
        <div class="suelo" />
        <canvas ref="lienzo" class="lienzo" aria-hidden="true" />

        <div ref="cabeza" class="envoltura cabeza">
          <p class="antetitulo">How we work</p>
          <h2 class="titulo-2">From your call to a dry, restored home.</h2>
          <div class="fila" aria-hidden="true">
            <div class="avance">
              <span v-for="(x, i) in PASOS" :key="x.titulo" :class="{ hecho: i < activo || restaurado, ahora: i === activo && !restaurado }" />
            </div>
            <div class="medidor" :class="{ seco }">
              Moisture <b>{{ humedad }}%</b><span class="estado">{{ seco ? 'Dry' : 'Wet' }}</span>
            </div>
          </div>
        </div>

        <!-- el paso de ahora, dos veces: seco y mojado, cortados por la línea del agua -->
        <div
          v-for="(capa, k) in ['seca', 'mojada']" :key="capa"
          :ref="(el) => { capas[k] = el }" class="bloque" :class="capa" aria-hidden="true"
        >
          <div class="envoltura">
            <Transition name="paso" mode="out-in">
              <div :key="activo" class="paso">
                <p class="cuando"><b>0{{ activo + 1 }}</b> · {{ CUANDO[activo] }}</p>
                <h3>{{ PASOS[activo].titulo }}</h3>
                <p class="texto">{{ PASOS[activo].texto }}</p>
              </div>
            </Transition>
          </div>
        </div>

        <!-- lo que encuentran las lecturas -->
        <div v-if="lecturas" class="lecturas" aria-hidden="true">
          <template v-if="esMovil">
            <Anotacion :x="70" :y="41" :dx="-22" :dy="-26" texto="Wet drywall · 38%" texto-hecho="Dry · 12%" :hecho="seco" />
          </template>
          <template v-else>
            <Anotacion :x="66" :y="45" :dx="56" :dy="-46" texto="Wet drywall · 38%" texto-hecho="Dry · 12%" :hecho="seco" />
            <Anotacion :x="84" :y="90" :dx="-36" :dy="-62" texto="Wet baseboard" texto-hecho="Dry" :hecho="seco" :retraso="200" />
          </template>
        </div>

        <div class="sello" :class="{ visible: restaurado }" aria-hidden="true">
          <Icono nombre="check" />Restored
        </div>
      </div>

      <!-- los pasos, para quien no ve la escena -->
      <ol class="solo-lector">
        <li v-for="(x, i) in PASOS" :key="x.titulo">{{ CUANDO[i] }}: {{ x.titulo }}. {{ x.texto }}</li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
/* Alto de sobra para que cada paso dure una pantalla; la estancia se queda fija */
.trabajo { position: relative; height: 520vh; background: var(--blanco); }
.fijo {
  position: sticky;
  top: var(--alto-cabecera);
  height: calc(100svh - var(--alto-cabecera) - var(--alto-barra-movil));
  overflow: hidden;
}

/* ---- La estancia: pared, zócalo y suelo (el agua, el cerco y lo demás los pinta el lienzo) ---- */
.escena {
  position: relative;
  height: 100%;
  background:
    radial-gradient(110% 70% at 15% 0%, rgba(255, 255, 255, .6), transparent 60%),
    linear-gradient(180deg, #efece6, #e2ddd3);
}
.escena::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: .5;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='r'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .45 0 0 0 0 .42 0 0 0 0 .38 0 0 0 .09 0'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23r)'/%3E%3C/svg%3E");
  pointer-events: none;
}
.suelo {
  position: absolute;
  inset: auto 0 0;
  height: 8%;
  background:
    repeating-linear-gradient(90deg, rgba(60, 38, 16, .16) 0 1px, transparent 1px 190px),
    linear-gradient(180deg, #c8a678, #ad8657);
}
.zocalo {
  position: absolute;
  inset: auto 0 8%;
  height: 3.5%;
  background: linear-gradient(180deg, #fbfaf7, #ebe7df);
  border-top: 1px solid rgba(0, 0, 0, .07);
  box-shadow: 0 -2px 6px rgba(0, 0, 0, .04);
}
.lienzo { position: absolute; inset: 0; width: 100%; height: 100%; }

/* ---- El título y cómo va ---- */
.cabeza { position: relative; padding-top: clamp(20px, 5vh, 56px); display: grid; gap: 10px; }
.titulo-2 { max-width: 18ch; }
.fila { display: flex; flex-wrap: wrap; align-items: center; gap: 12px 20px; margin-top: 6px; }
.avance { display: grid; grid-template-columns: repeat(5, 34px); gap: 6px; }
.avance span { height: 4px; border-radius: 2px; background: rgba(15, 36, 64, .12); transition: background-color .35s var(--curva); }
.avance .ahora { background: var(--azul); }
.avance .hecho { background: var(--verde); }
.medidor {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  padding: 0 6px 0 14px;
  border-radius: var(--pildora);
  background: var(--blanco);
  box-shadow: var(--sombra);
  font-size: 13px;
  font-weight: 600;
  color: var(--tinta-3);
}
.medidor b { font-size: 16px; font-weight: 800; color: var(--tinta); font-variant-numeric: tabular-nums; }
.estado {
  padding: 3px 10px;
  border-radius: var(--pildora);
  background: #fde7dc;
  color: var(--naranja);
  font-weight: 700;
  transition: background-color .3s var(--curva), color .3s var(--curva);
}
.seco .estado { background: #dcfce7; color: var(--verde); }

/* ---- El paso de ahora: flota en el agua (su altura y su corte los pone el bucle) ---- */
/* sin bucle todavía (o si no llega a arrancar), apoyado en la parte de abajo, nunca encima del título */
.bloque { position: absolute; inset: 0 0 auto; transform: translate3d(0, 52vh, 0); will-change: transform; }
.mojada { clip-path: inset(100% 0 0 0); }
.mojada .cuando, .mojada .texto { color: rgba(255, 255, 255, .86); }
.mojada .cuando b { color: #cfe4ff; }
.mojada h3 { color: #fff; }
.mojada .paso { text-shadow: 0 1px 2px rgba(8, 40, 90, .25); }
.paso { max-width: 560px; display: grid; gap: 8px; }
.cuando { font-size: 15px; font-weight: 600; color: var(--tinta-2); }
.cuando b { color: var(--azul); font-weight: 800; }
h3 { font-size: clamp(30px, 3.4vw, 46px); font-weight: 800; line-height: 1.08; letter-spacing: -.02em; color: var(--tinta); }
.texto { font-size: 18px; color: var(--tinta-2); max-width: 46ch; }
.paso-enter-active, .paso-leave-active { transition: opacity .28s var(--curva), transform .28s var(--curva); }
.paso-enter-from { opacity: 0; transform: translateY(14px); }
.paso-leave-to { opacity: 0; transform: translateY(-10px); }

.lecturas { position: absolute; inset: 0; pointer-events: none; }

/* El sello del final */
.sello {
  position: absolute;
  left: 50%;
  top: 46%;
  translate: -50% -50%;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 26px 14px 20px;
  border-radius: var(--pildora);
  background: var(--verde);
  color: #fff;
  box-shadow: 0 10px 30px rgba(22, 163, 74, .35);
  font-size: 22px;
  font-weight: 800;
  opacity: 0;
  scale: .85;
  transition: opacity .3s var(--curva), scale .45s cubic-bezier(.3, 1.4, .5, 1);
}
.sello svg { width: 24px; height: 24px; stroke-width: 2.6; }
.sello.visible { opacity: 1; scale: 1; }

.solo-lector {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/* ---- Móvil: el título más corto ---- */
@media (max-width: 899px) {
  .trabajo { height: 500svh; }
  .cabeza { padding-top: 18px; gap: 6px; }
  .antetitulo { display: none; }
  .titulo-2 { font-size: 24px; }
  .fila { gap: 10px 14px; }
  .avance { grid-template-columns: repeat(5, 22px); }
  .medidor { height: 32px; font-size: 12px; }
  .medidor b { font-size: 14px; }
  h3 { font-size: 26px; }
  .cuando { font-size: 13px; }
  .texto { font-size: 15px; }
  .sello { top: 40%; font-size: 19px; }
}
@media (min-width: 900px) {
  .fijo { height: calc(100vh - var(--alto-cabecera)); }
}
</style>
