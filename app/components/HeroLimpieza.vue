<script setup>
import { SITIO } from '~/utils/sitio'
import { crearParedDanada } from '~/utils/paredDanada'

// El hero: la pared dañada se queda fija mientras se hace scroll, y el scroll la limpia.
// p: 0 = como la encontramos, 1 = restaurada. Los tramos de cada capa son los del shader.
const ENCHUFE = [0.36, 0.24]

const seccion = ref(null)
const fijo = ref(null)
const lienzo = ref(null)
const p = ref(0)
const sinWebgl = ref(false)

const tramo = (a, b) => computed(() => {
  const t = Math.min(1, Math.max(0, (p.value - a) / (b - a)))
  return t * t * (3 - 2 * t)
})
const pHollin = tramo(0, 0.32)
const pMoho = tramo(0.06, 0.86)
const pAgua = tramo(0.3, 0.9)
const pTotal = tramo(0, 0.9)

const humedad = computed(() => Math.round(38 - 26 * pAgua.value))
const seco = computed(() => humedad.value <= 16)
const limpieza = computed(() => Math.round(pTotal.value * 100))
const restaurada = computed(() => p.value > 0.91)

// Lo que hacen, a la vista desde el primer segundo (iconos de trazo, 24×24)
const SERVICIOS = [
  { nombre: 'Water', icono: 'M12 3.5c3.2 4 5.5 7 5.5 10a5.5 5.5 0 0 1-11 0c0-3 2.3-6 5.5-10z' },
  { nombre: 'Fire & smoke', icono: 'M12 3c.5 3 3.5 4.5 3.5 8.5a3.5 3.5 0 0 1-7 0c0-1.6.7-2.7 1.6-3.6.2 1.4.9 2.1 1.9 2.6C12.4 8.6 11.4 6 12 3zM7.5 14.5a4.5 4.5 0 0 0 9 0' },
  { nombre: 'Storm', icono: 'M4 9.5h11a3 3 0 1 0-3-3M3 13.5h15a3 3 0 1 1-3 3M5 17.5h6' },
  { nombre: 'Mold', icono: 'M7 9.5a1.6 1.6 0 1 0 0 .01M12.5 6.5a2.2 2.2 0 1 0 0 .01M16.5 11a1.4 1.4 0 1 0 0 .01M10 14a2.6 2.6 0 1 0 0 .01M15.5 16.5a1.8 1.8 0 1 0 0 .01M6.5 16.5a1 1 0 1 0 0 .01' }
]

// Las anotaciones, colocadas para que no se pisen ni con el medidor (ordenador y móvil)
const esMovil = ref(false)
const ANOTACIONES = {
  ordenador: {
    hollin: { x: 54, y: 13, dx: -44, dy: 42 },
    moho: { x: 40, y: 69, dx: 58, dy: -64 },
    agua: { x: 80, y: 74, dx: -30, dy: -58 }
  },
  movil: {
    hollin: { x: 86, y: 10, dx: -26, dy: 46 },
    moho: { x: 40, y: 68, dx: 34, dy: -62 },
    agua: { x: 84, y: 80, dx: -18, dy: -46 }
  }
}
const sitio = computed(() => ANOTACIONES[esMovil.value ? 'movil' : 'ordenador'])

let pared = null
let objetivo = 0
let animando = false
let reducido = false

function medirObjetivo() {
  const s = seccion.value
  const f = fijo.value
  if (!s || !f) return
  const recorrido = s.offsetHeight - f.offsetHeight
  const arriba = s.getBoundingClientRect().top - (parseFloat(getComputedStyle(f).top) || 0)
  objetivo = recorrido > 0 ? Math.min(1, Math.max(0, -arriba / recorrido)) : 0
}

// El valor persigue al scroll con suavidad: limpiar se siente como pasar la bayeta, no a saltos
function paso() {
  const d = objetivo - p.value
  p.value = Math.abs(d) < 0.0008 ? objetivo : p.value + d * 0.16
  pared?.dibujar(p.value)
  if (p.value !== objetivo) requestAnimationFrame(paso)
  else animando = false
}

function alMoverse() {
  if (reducido) return
  medirObjetivo()
  if (!animando) {
    animando = true
    requestAnimationFrame(paso)
  }
}

function alCambiarTamano() {
  pared?.medir()
  pared?.dibujar(p.value)
  alMoverse()
}

onMounted(() => {
  reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const movil = window.matchMedia('(max-width: 899px)')
  esMovil.value = movil.matches
  movil.addEventListener('change', (e) => { esMovil.value = e.matches })
  pared = crearParedDanada(lienzo.value, { enchufe: ENCHUFE })
  if (!pared) sinWebgl.value = true
  if (reducido) p.value = 1
  pared?.dibujar(p.value)
  medirObjetivo()
  p.value = reducido ? 1 : objetivo
  pared?.dibujar(p.value)
  window.addEventListener('scroll', alMoverse, { passive: true })
  window.addEventListener('resize', alCambiarTamano)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', alMoverse)
  window.removeEventListener('resize', alCambiarTamano)
  pared?.destruir()
})
</script>

<template>
  <section id="hero" ref="seccion" class="hero" :class="{ 'sin-webgl': sinWebgl }">
    <div ref="fijo" class="fijo">
      <div class="texto">
        <p class="etiqueta-mono antetitulo">24/7 emergency restoration · Cape Coral, FL</p>
        <h1>
          <span class="linea"><span>Water, fire</span></span>
          <span class="linea"><span>&amp; storm damage.</span></span>
          <span class="linea"><span>Mold removal.</span></span>
        </h1>
        <p class="entradilla">
          Restoration that makes it like it never happened. Owner-operated, licensed mold
          remediator, on call 24/7 across Cape Coral and Southwest Florida.
        </p>
        <ul class="servicios" aria-label="What we restore">
          <li v-for="s in SERVICIOS" :key="s.nombre">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path :d="s.icono" /></svg>
            {{ s.nombre }}
          </li>
        </ul>
        <div class="acciones">
          <a class="llamar" :href="SITIO.telefonoEnlace">
            <span class="disponible" aria-hidden="true" />
            <span>Call now</span>
            <span class="numero">{{ SITIO.telefono }}</span>
          </a>
          <a class="btn-sec" href="#fotos">Send photos of the damage</a>
        </div>
        <dl class="datos">
          <div><dt class="etiqueta-mono">Emergency line</dt><dd>24/7</dd></div>
          <div><dt class="etiqueta-mono">Experience</dt><dd>{{ SITIO.anos }}+ yrs</dd></div>
          <div><dt class="etiqueta-mono">FL mold license</dt><dd>{{ SITIO.licencia }}</dd></div>
          <div><dt class="etiqueta-mono">Insurance claims</dt><dd>We document</dd></div>
        </dl>
      </div>

      <div class="pared">
        <canvas ref="lienzo" class="lienzo" aria-hidden="true" />
        <Enchufe class="enchufe" :style="{ left: `${ENCHUFE[0] * 100}%`, top: `${(1 - ENCHUFE[1]) * 100}%` }" />

        <Anotacion v-bind="sitio.hollin" texto="Smoke & soot" texto-hecho="Soot · cleaned" :hecho="pHollin > 0.92" :retraso="900" />
        <Anotacion v-bind="sitio.moho" texto="Active mold growth" texto-hecho="Mold · removed" :hecho="pMoho > 0.96" :retraso="1150" />
        <Anotacion v-bind="sitio.agua" texto="Water intrusion" texto-hecho="Structure · dry" :hecho="seco" :retraso="1400" />

        <div class="medidor" :class="{ seco }">
          <div class="medidor-fila">
            <span class="etiqueta-mono">Moisture</span>
            <span class="estado etiqueta-mono">{{ seco ? 'Dry' : 'Wet' }}</span>
          </div>
          <div class="lectura">{{ humedad }}<span>%</span></div>
          <div class="medidor-fila">
            <span class="etiqueta-mono">Cleanup</span>
            <span class="etiqueta-mono">{{ limpieza }}%</span>
          </div>
          <div class="barra"><span :style="{ transform: `scaleX(${pTotal})` }" /></div>
        </div>

        <div class="pista etiqueta-mono" :class="{ oculta: p > 0.04 }" aria-hidden="true">
          Scroll to clean
          <svg viewBox="0 0 12 16" width="10" height="14"><path d="M6 1v13M1 9l5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.5" /></svg>
        </div>

        <div class="sello" :class="{ visible: restaurada }" aria-hidden="true">
          <span class="check" />Restored
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* La sección es más alta que la pantalla: mientras se recorre, la pared se queda fija y se limpia */
.hero {
  position: relative;
  height: 230svh;
  background: var(--papel);   /* tapa la pared de la página: el hero tiene la suya */
}
.fijo {
  position: sticky;
  top: var(--alto-cabecera);
  height: calc(100svh - var(--alto-cabecera) - var(--alto-barra-movil));
  display: grid;
  grid-template-rows: auto 1fr;
}

/* ---- El texto ---- */
.texto {
  padding: 20px var(--margen) 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.antetitulo { color: var(--ceniza); }
h1 {
  font-weight: 500;
  font-size: clamp(34px, 10vw, 96px);
  line-height: .95;
  letter-spacing: -.01em;
  text-transform: uppercase;
}
.linea { display: block; overflow: hidden; padding-bottom: .04em; }
.linea > span {
  display: block;
  animation: subir .8s var(--curva) both;
}
.linea:nth-child(2) > span { animation-delay: 90ms; }
.linea:nth-child(3) > span { animation-delay: 180ms; }
@keyframes subir { from { transform: translateY(105%); } to { transform: none; } }

.entradilla {
  color: var(--hierro);
  font-size: 16px;
  max-width: 46ch;
  animation: entrar .7s var(--curva) .35s both;
}
@keyframes entrar { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }

.acciones, .datos { display: none; }

.servicios {
  display: flex;
  flex-wrap: nowrap;
  gap: 6px;
  margin: 0 calc(-1 * var(--margen));
  padding: 0 var(--margen);
  overflow-x: auto;
  scrollbar-width: none;
  list-style: none;
  animation: entrar .7s var(--curva) .42s both;
}
.servicios::-webkit-scrollbar { display: none; }
.servicios li {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 12px 0 9px;
  border-radius: var(--radio-pildora);
  box-shadow: inset 0 0 0 1px var(--carbon);
  font-size: 14px;
  font-weight: 500;
}
.servicios svg { fill: none; stroke: var(--carbon); stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }

/* ---- La pared ---- */
.pared {
  position: relative;
  overflow: hidden;
  container-type: size;
  background: #ecebe6;
}
.lienzo { position: absolute; inset: 0; width: 100%; height: 100%; }
.enchufe {
  position: absolute;
  width: 5.2cqh;
  min-width: 26px;
  translate: -50% -50%;
}

/* El medidor de humedad: un instrumento de verdad de su trabajo */
.medidor {
  position: absolute;
  left: 12px;
  top: 12px;
  width: 150px;
  padding: 10px 12px 12px;
  background: var(--papel);
  box-shadow: inset 0 0 0 1px var(--carbon);
  border-radius: 4px;
  display: grid;
  gap: 4px;
  animation: entrar .6s var(--curva) .7s both;
}
.medidor-fila { display: flex; justify-content: space-between; align-items: center; }
.medidor-fila .etiqueta-mono { font-size: 10.5px; color: var(--ceniza); }
.estado {
  padding: 2px 6px;
  background: var(--obra);
  color: var(--carbon) !important;
  transition: background-color .3s var(--curva), color .3s var(--curva);
}
.medidor.seco .estado { background: var(--seco); color: var(--papel) !important; }
.lectura {
  font-family: var(--fuente-datos);
  font-weight: 500;
  font-size: 40px;
  line-height: 1;
  letter-spacing: -.02em;
  font-variant-numeric: tabular-nums;
  margin: 2px 0 6px;
}
.lectura span { font-size: 20px; margin-left: 2px; color: var(--ceniza); }
.barra { height: 4px; background: var(--niebla); overflow: hidden; }
.barra span { display: block; height: 100%; background: var(--carbon); transform-origin: left; }

/* «Scroll to clean»: invita a limpiar, y se va en cuanto se empieza */
.pista {
  position: absolute;
  left: 50%;
  bottom: 18px;
  translate: -50% 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 34px;
  padding: 0 14px;
  border-radius: var(--radio-pildora);
  background: var(--carbon);
  color: var(--papel);
  transition: opacity .3s var(--curva), translate .3s var(--curva);
  animation: entrar .6s var(--curva) 1.8s backwards;
}
.pista svg { animation: bajar 1.6s var(--curva) infinite; }
.pista.oculta { opacity: 0; translate: -50% 10px; }
@keyframes bajar { 0%, 100% { transform: translateY(-2px); } 50% { transform: translateY(3px); } }

/* El sello del final */
.sello {
  position: absolute;
  left: 50%;
  top: 38%;
  translate: -50% -50%;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  background: var(--papel);
  box-shadow: inset 0 0 0 2px var(--carbon), 4px 4px 0 var(--carbon);
  font-family: var(--fuente-datos);
  font-weight: 600;
  font-size: 18px;
  letter-spacing: .12em;
  text-transform: uppercase;
  opacity: 0;
  scale: 1.25;
  rotate: -4deg;
  transition: opacity .25s var(--curva), scale .35s cubic-bezier(.3, 1.4, .5, 1);
}
.sello.visible { opacity: 1; scale: 1; }
.sello .check { width: 10px; height: 10px; border-radius: 50%; background: var(--seco); }

/* Sin WebGL: la pared limpia, con todo hecho */
.sin-webgl .medidor, .sin-webgl .pista { display: none; }

/* ---- Escritorio: mitad texto, mitad pared; la costura es el diseño ---- */
@media (min-width: 900px) {
  .hero { height: 260vh; }
  .fijo {
    height: calc(100vh - var(--alto-cabecera));
    grid-template-rows: none;
    grid-template-columns: 1fr 1fr;
  }
  .texto {
    justify-content: center;
    gap: 22px;
    padding: 40px clamp(32px, 4vw, 72px);
  }
  h1 { font-size: clamp(44px, 4.6vw, 80px); }
  .servicios { flex-wrap: wrap; overflow: visible; margin: 0; padding: 0; }
  .servicios li { height: 36px; font-size: 15px; padding: 0 14px 0 11px; }
  .entradilla { font-size: 18px; }
  .acciones {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 6px;
    animation: entrar .7s var(--curva) .45s both;
  }
  .datos {
    display: grid;
    grid-template-columns: repeat(4, auto);
    justify-content: start;
    margin-top: 18px;
    border-top: 1px solid var(--hormigon);
    animation: entrar .7s var(--curva) .55s both;
  }
  .datos > div { padding: 14px 22px 0 0; margin-right: 22px; border-right: 1px solid var(--hormigon); }
  .datos > div:last-child { border-right: 0; margin-right: 0; }
  .datos dt { color: var(--ceniza); font-size: 11px; }
  .datos dd { font-family: var(--fuente-datos); font-weight: 500; font-size: 19px; letter-spacing: .02em; margin-top: 4px; white-space: nowrap; }
  .medidor { left: 24px; top: 24px; width: 172px; }
  .lectura { font-size: 48px; }
  .pista { bottom: 28px; }
  .sello { font-size: 22px; top: 46%; }
}
</style>
