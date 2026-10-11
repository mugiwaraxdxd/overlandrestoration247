<script setup>
import { SITIO } from '~/utils/sitio'
import { crearParedDanada } from '~/utils/paredDanada'
import { crearParedFotos } from '~/utils/paredFotos'
import { PARED_HERO, cubrir } from '~/utils/paredesHorneadas'
import { SERVICIOS } from '~/utils/contenido'

// El hero: la pared dañada se queda fija mientras se hace scroll, y el scroll la limpia.
// p: 0 = como la encontramos, 1 = restaurada. Los tramos de cada capa son los del shader.
// En el ordenador, texto y pared a medias y fijos. En el móvil, en dos tiempos: primero el texto
// con la pared asomando y, al llegar arriba, la pared se queda fija a toda pantalla y se limpia.
// Con ratón la pared se pinta en vivo (shader); en las pantallas táctiles son sus fotos horneadas.
const ENCHUFE = PARED_HERO.enchufe

const seccion = ref(null)
const fijo = ref(null)
const texto = ref(null)
const muro = ref(null)
const lienzo = ref(null)
const p = ref(0)
const sinPared = ref(false)
const lista = ref(false)
// Con las fotos, dónde cae la foto en la pared (px CSS) y el tamaño de la pared; en vivo, null
const encuadre = ref(null)
const caja = ref({ w: 1, h: 1 })

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

// El enchufe, en % de la pared: donde cae en la foto (cada móvil la recorta un poco distinto)
const enchufe = computed(() => {
  const e = encuadre.value
  if (!e) return { x: ENCHUFE[0] * 100, y: (1 - ENCHUFE[1]) * 100 }
  return {
    x: ((e.x + ENCHUFE[0] * e.w) / caja.value.w) * 100,
    y: ((e.y + (1 - ENCHUFE[1]) * e.h) / caja.value.h) * 100
  }
})

// Las anotaciones, colocadas para que no se pisen ni con el medidor (ordenador y móvil). La del moho,
// junto al enchufe («cerca»: % desde él), que es donde nace
const esMovil = ref(false)
const ANOTACIONES = {
  ordenador: {
    hollin: { x: 56, y: 13, dx: 44, dy: 42 },
    moho: { cerca: [4, -7], dx: 58, dy: -64 },
    agua: { x: 82, y: 76, dx: -40, dy: -66 }
  },
  movil: {
    hollin: { x: 74, y: 17, dx: -22, dy: 46 },
    moho: { cerca: [8, -6], dx: 24, dy: -58 },
    agua: { x: 80, y: 90, dx: -24, dy: -22 }
  }
}
const sitio = computed(() => {
  const s = ANOTACIONES[esMovil.value ? 'movil' : 'ordenador']
  const { cerca, ...moho } = s.moho
  return { ...s, moho: { ...moho, x: enchufe.value.x + cerca[0], y: enchufe.value.y + cerca[1] } }
})

let pared = null
let objetivo = 0
let animando = false
let reducido = false
let visible = true
let topeFijo = 0
let observador = null
let desmontado = false

// Lo que se queda fijo: en el ordenador, todo; en el móvil, solo la pared
const pegado = () => (esMovil.value ? muro.value : fijo.value)

function medirTope() {
  topeFijo = pegado() ? parseFloat(getComputedStyle(pegado()).top) || 0 : 0
}

function medirObjetivo() {
  const s = seccion.value
  const f = pegado()
  if (!s || !f) return
  // en el móvil la limpieza empieza cuando la pared, debajo del texto, llega arriba
  const inicio = esMovil.value && texto.value ? texto.value.offsetTop + texto.value.offsetHeight : 0
  const recorrido = s.offsetHeight - inicio - f.offsetHeight
  const arriba = s.getBoundingClientRect().top + inicio - topeFijo
  objetivo = recorrido > 0 ? Math.min(1, Math.max(0, -arriba / recorrido)) : 0
}

// El valor persigue al scroll con suavidad: limpiar se siente como pasar la bayeta, no a saltos.
// Fuera de la pantalla no se anima ni se pinta (saltar con un enlace hasta abajo pintaba la
// limpieza entera sin que nadie la viera)
function paso() {
  if (!visible) {
    p.value = objetivo
    animando = false
    return
  }
  const d = objetivo - p.value
  p.value = Math.abs(d) < 0.0008 ? objetivo : p.value + d * 0.16
  pared?.dibujar(p.value)
  if (p.value !== objetivo) requestAnimationFrame(paso)
  else animando = false
}

function alMoverse() {
  if (reducido || !visible) return
  medirObjetivo()
  if (!animando) {
    animando = true
    requestAnimationFrame(paso)
  }
}

// Dónde cae la foto en la pared (con las fotos; la misma cuenta que hace paredFotos al pintarla)
let conFotos = false
function medirEncuadre() {
  if (!conFotos || !lienzo.value) return
  const w = Math.max(1, lienzo.value.clientWidth)
  const h = Math.max(1, lienzo.value.clientHeight)
  caja.value = { w, h }
  encuadre.value = cubrir(PARED_HERO.ancho / PARED_HERO.alto, w, h)
}

function alCambiarTamano() {
  medirTope()
  medirEncuadre()
  pared?.medir()
  pared?.dibujar(p.value)
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
  if (reducido) p.value = 1
  medirTope()
  medirObjetivo()
  p.value = reducido ? 1 : objetivo
  // En el móvil (o una pantalla táctil), sus fotos; en el ordenador, en vivo (el shader compila en
  // segundo plano). Mientras, se ve la pared limpia y la suciedad aparece fundida
  conFotos = window.matchMedia('(hover: none), (max-width: 899px)').matches
  medirEncuadre()
  const creada = conFotos
    ? crearParedFotos(lienzo.value)
    : crearParedDanada(lienzo.value, { enchufe: ENCHUFE })
  creada.then((x) => {
    if (desmontado) { x?.destruir(); return }
    if (!x) { sinPared.value = true; return }
    pared = x
    pared.dibujar(p.value)
    lista.value = true
  })
  window.addEventListener('scroll', alMoverse, { passive: true })
  window.addEventListener('resize', alCambiarTamano)
  observador = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting
    if (!visible) return
    medirObjetivo()
    p.value = reducido ? 1 : objetivo
    pared?.dibujar(p.value)
  })
  observador.observe(seccion.value)
})

onBeforeUnmount(() => {
  desmontado = true
  observador?.disconnect()
  window.removeEventListener('scroll', alMoverse)
  window.removeEventListener('resize', alCambiarTamano)
  pared?.destruir()
})
</script>
<template>
  <section id="hero" ref="seccion" class="hero" :class="{ 'sin-pared': sinPared, lista }">
    <div ref="fijo" class="fijo">
      <div ref="texto" class="texto">
        <p class="antetitulo"><span class="disponible" aria-hidden="true" />24/7 emergency restoration · Cape Coral, FL</p>
        <h1>
          <span class="linea"><span>Water, fire &amp; storm</span></span>
          <span class="linea"><span>damage restoration.</span></span>
          <span class="linea azul"><span>Mold removal.</span></span>
        </h1>
        <p class="entradilla">
          We make it like it never happened. Owner-operated, licensed mold remediator,
          on call 24/7 across Cape Coral and Southwest Florida.
        </p>
        <ul class="servicios" aria-label="What we restore">
          <li v-for="s in SERVICIOS" :key="s.slug">
            <NuxtLink :to="`/services/${s.slug}`"><Icono :nombre="s.icono" />{{ s.nombre }}</NuxtLink>
          </li>
        </ul>
        <div class="acciones">
          <a class="llamar" :href="SITIO.telefonoEnlace">
            <Icono nombre="telefono" />
            Call now · {{ SITIO.telefono }}
          </a>
          <NuxtLink class="btn-sec" to="/contact#fotos"><Icono nombre="camara" />Send photos</NuxtLink>
        </div>
      </div>

      <div ref="muro" class="pared">
        <canvas ref="lienzo" class="lienzo" aria-hidden="true" />
        <Enchufe class="enchufe" :style="{ left: `${enchufe.x}%`, top: `${enchufe.y}%` }" />

        <Anotacion v-bind="sitio.hollin" texto="Smoke & soot" texto-hecho="Soot cleaned" :hecho="pHollin > 0.92" :retraso="900" />
        <Anotacion v-bind="sitio.moho" texto="Mold growth" texto-hecho="Mold removed" :hecho="pMoho > 0.96" :retraso="1150" />
        <Anotacion v-bind="sitio.agua" texto="Water damage" texto-hecho="Dry" :hecho="seco" :retraso="1400" />

        <div class="medidor" :class="{ seco }">
          <div class="fila">
            <span>Moisture</span>
            <span class="estado">{{ seco ? 'Dry' : 'Wet' }}</span>
          </div>
          <div class="lectura">{{ humedad }}<span>%</span></div>
          <div class="barra"><span :style="{ transform: `scaleX(${pTotal})` }" /></div>
          <div class="fila pie-medidor"><span>Restored</span><span>{{ limpieza }}%</span></div>
        </div>

        <div class="pista" :class="{ oculta: p > 0.04 }" aria-hidden="true">
          Scroll to restore
          <svg viewBox="0 0 12 16" width="10" height="14"><path d="M6 1v13M1 9l5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </div>

        <div class="sello" :class="{ visible: restaurada }" aria-hidden="true">
          <Icono nombre="check" />Restored
        </div>
      </div>
    </div>
    <!-- en el móvil, el recorrido de scroll durante el que la pared se queda fija -->
    <div class="recorrido" aria-hidden="true" />
  </section>
</template>

<style scoped>
/* La sección es más alta que la pantalla: mientras se recorre, la pared se queda fija y se limpia.
   Móvil: el texto y, debajo, la pared, que al llegar arriba se queda fija a toda pantalla durante
   el «recorrido» (el ordenador, abajo) */
.hero {
  position: relative;
  background: var(--blanco);
}
.fijo { display: contents; }
.recorrido { height: 150svh; }

/* ---- El texto ---- */
.texto {
  padding: 22px var(--margen) 26px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.antetitulo { font-size: 13px; }
.antetitulo .disponible { background: var(--verde); }
.antetitulo .disponible::after { background: var(--verde); }
h1 {
  font-weight: 800;
  font-size: clamp(30px, 8.4vw, 64px);
  line-height: 1.05;
  letter-spacing: -.025em;
}
.linea { display: block; overflow: hidden; padding-bottom: .06em; }
.linea > span { display: block; animation: subir .8s var(--curva) both; }
.linea:nth-child(2) > span { animation-delay: 90ms; }
.linea:nth-child(3) > span { animation-delay: 180ms; }
.linea.azul { color: var(--azul); }
@keyframes subir { from { transform: translateY(105%); } to { transform: none; } }

.entradilla { font-size: 16px; animation: entrar .7s var(--curva) .35s both; }
@keyframes entrar { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }

.servicios {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-top: 4px;
  padding: 0;
  list-style: none;
  animation: entrar .7s var(--curva) .42s both;
}
.servicios a {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 40px;
  padding: 0 10px;
  border-radius: var(--pildora);
  background: var(--azul-suave);
  color: var(--tinta);
  font-size: 15px;
  font-weight: 600;
  white-space: nowrap;
  text-decoration: none;
  transition: background-color .2s var(--curva);
}
.servicios a:hover { background: #d6e6fa; }
.servicios svg { width: 20px; height: 20px; flex: none; color: var(--azul); }
.acciones { display: none; }

/* ---- La pared ---- */
.pared {
  position: sticky;
  top: var(--alto-cabecera);
  height: calc(100svh - var(--alto-cabecera) - var(--alto-barra-movil));
  overflow: hidden;
  container-type: size;
  background: #ecebe6;
}
.lienzo { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; transition: opacity .7s var(--curva); }
.lista .lienzo { opacity: 1; }
.enchufe { position: absolute; width: 5.2cqh; min-width: 26px; translate: -50% -50%; }

/* El medidor de humedad: una tarjeta blanca */
.medidor {
  position: absolute;
  left: 14px;
  top: 14px;
  width: 168px;
  padding: 14px 16px;
  background: var(--blanco);
  border-radius: 16px;
  box-shadow: var(--sombra);
  display: grid;
  gap: 6px;
  animation: entrar .6s var(--curva) .7s both;
}
.fila { display: flex; justify-content: space-between; align-items: center; font-size: 13px; font-weight: 600; color: var(--tinta-3); }
.estado {
  padding: 2px 10px;
  border-radius: var(--pildora);
  background: #fde7dc;
  color: var(--naranja);
  font-weight: 700;
  transition: background-color .3s var(--curva), color .3s var(--curva);
}
.medidor.seco .estado { background: #dcfce7; color: var(--verde); }
.lectura { font-size: 44px; font-weight: 800; line-height: 1; letter-spacing: -.03em; color: var(--tinta); }
.lectura span { font-size: 20px; color: var(--tinta-3); margin-left: 2px; }
.barra { height: 6px; border-radius: 3px; background: var(--bruma); overflow: hidden; }
.barra span { display: block; height: 100%; background: var(--azul); transform-origin: left; transition: background-color .3s var(--curva); }
.medidor.seco .barra span { background: var(--verde); }
.pie-medidor { font-size: 12px; }

/* «Scroll to restore»: invita, y se va en cuanto se empieza */
.pista {
  position: absolute;
  left: 50%;
  bottom: 18px;
  translate: -50% 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 38px;
  padding: 0 16px;
  border-radius: var(--pildora);
  background: var(--blanco);
  box-shadow: var(--sombra);
  color: var(--tinta);
  font-size: 14px;
  font-weight: 600;
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
  top: 40%;
  translate: -50% -50%;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 24px 14px 18px;
  border-radius: var(--pildora);
  background: var(--verde);
  color: #fff;
  box-shadow: 0 10px 30px rgba(22, 163, 74, .35);
  font-weight: 800;
  font-size: 20px;
  opacity: 0;
  scale: .85;
  transition: opacity .3s var(--curva), scale .45s cubic-bezier(.3, 1.4, .5, 1);
}
.sello svg { width: 24px; height: 24px; stroke-width: 2.4; }
.sello.visible { opacity: 1; scale: 1; }

.sin-pared .medidor, .sin-pared .pista { display: none; }

/* Móvil: el medidor, una píldora (Moisture · Wet · 38 %, con su barra) */
@media (max-width: 899px) {
  .medidor {
    left: 12px;
    top: 12px;
    width: auto;
    padding: 9px 12px 10px;
    border-radius: 14px;
    grid-template-columns: auto auto;
    align-items: center;
    gap: 6px 14px;
  }
  .medidor .fila:first-child { gap: 8px; }
  .lectura { font-size: 24px; }
  .lectura span { font-size: 13px; }
  .barra { grid-column: 1 / -1; height: 4px; }
  .pie-medidor { display: none; }
}

/* ---- Escritorio: mitad texto, mitad pared, y todo fijo ---- */
@media (min-width: 900px) {
  .hero { height: 260vh; }
  .fijo {
    position: sticky;
    top: var(--alto-cabecera);
    height: calc(100vh - var(--alto-cabecera));
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }
  .pared { position: relative; top: auto; height: auto; }
  .recorrido { display: none; }
  .texto {
    justify-content: center;
    gap: 22px;
    padding: 40px clamp(32px, 4vw, 72px);
  }
  .antetitulo { font-size: 14px; }
  h1 { font-size: clamp(40px, 4.4vw, 68px); }
  .entradilla { font-size: 19px; }
  .servicios { display: flex; flex-wrap: wrap; margin: 0; }
  .servicios a { display: inline-flex; gap: 8px; padding: 0 16px 0 12px; }
  .acciones {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 6px;
    animation: entrar .7s var(--curva) .5s both;
  }
  .acciones svg { width: 20px; height: 20px; }
  .medidor { left: 24px; top: 24px; width: 188px; }
  .lectura { font-size: 52px; }
  .pista { bottom: 28px; }
  .sello { top: 46%; font-size: 24px; }
}
</style>
