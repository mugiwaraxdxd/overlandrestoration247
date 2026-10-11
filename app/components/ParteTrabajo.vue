<script setup>
import { PASOS } from '~/utils/contenido'

// «How we work», contado como el parte de un trabajo que se rellena solo con el scroll: cada paso
// se apunta con su hora, enseña lo que se hizo (la llamada, el escaneo térmico, la extracción, la
// curva del secado, la revisión final) y se marca; al final el parte se cierra y cae el sello.
// Lo que más le importa al cliente después del susto: que todo queda documentado para el seguro.
// Es un ejemplo (horas, lecturas y cuentas ilustrativas) y el parte lo dice: «Sample job».

const N = PASOS.length
const CUANDO = ['2:07 a.m.', 'Day 1', 'Day 1', 'Days 2–4', 'Day 6']
// Lo apuntado al terminar cada paso (fotos y lecturas de humedad)
const FOTOS = [2, 18, 27, 31, 38]
const LECTURAS = [0, 6, 8, 14, 18]
// Las lecturas del secado (paso 4), día a día, y la meta de «seco»
const SECADO = [38, 27, 18, 12]
const META = 15

const seccion = ref(null)
const fijo = ref(null)
const texto = ref(null)
const escena = ref(null)
const esMovil = ref(false)
const p = ref(0)
const quieta = ref(true)
let objetivo = 0
let bucle = 0
let visible = false
let topeFijo = 0
let observador = null

// El recorrido en fases: los cinco pasos y, al final, el cierre con su sello
const u = computed(() => Math.min(1, Math.max(0, p.value)) * (N + 0.7))
const activo = computed(() => Math.min(N - 1, Math.floor(u.value)))
const t = computed(() => Math.min(1, u.value - activo.value))
const cerrado = computed(() => u.value >= N + 0.15)
const sellado = computed(() => u.value >= N + 0.35)

// El texto de cada paso se escribe en el parte palabra a palabra al empezar el paso
const PALABRAS = PASOS.map(x => x.texto.split(' '))
const palabraVista = (i, k) => tDe(i) > 0.02 + (k / PALABRAS[i].length) * 0.28

const estado = (i) => (cerrado.value || i < activo.value ? 'hecho' : i === activo.value ? 'activo' : 'pendiente')
// El avance dentro del paso i (0 sin empezar, 1 hecho)
const tDe = (i) => (i < activo.value ? 1 : i > activo.value ? 0 : t.value)
// Lo mismo, de «a» a «b» dentro del paso
const tramo = (i, a, b) => Math.min(1, Math.max(0, (tDe(i) - a) / (b - a)))

const acumulado = (lista) => {
  const antes = activo.value > 0 ? lista[activo.value - 1] : 0
  return Math.round(antes + (lista[activo.value] - antes) * Math.min(1, t.value * 1.2))
}
const fotos = computed(() => acumulado(FOTOS))
const lecturas = computed(() => acumulado(LECTURAS))

// Paso 1: suena y lo coge el dueño; el reloj de la llamada
const contestado = computed(() => tDe(0) > 0.16)
const duracion = computed(() => {
  const s = Math.round(tramo(0, 0.16, 1) * 84)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
})
const CONSEJOS = ['Shut off the water main', 'Move what you can off the floor', 'Send us photos before touching anything']

// Paso 2: la cámara térmica barre la pared; las lecturas salen al pasar por cada mancha
const MANCHAS = [{ x: 18, texto: 'Drywall · 38%' }, { x: 52, texto: 'Baseboard · 34%', abajo: true }, { x: 80, texto: 'Subfloor · 29%' }]
const barrido = computed(() => tramo(1, 0.04, 0.82) * 100)

// Paso 3
const extraido = computed(() => Math.round(tramo(2, 0.04, 0.6) * 100))
const MEDIDAS = ['Containment up', 'HEPA air scrubber running', 'Wet materials out']

// Paso 4: la curva del secado (en un lienzo de 300 × 110)
const xDia = (i) => 26 + i * 86
const yHum = (v) => 10 + ((40 - v) / 30) * 82
const curva = SECADO.map((v, i) => `${i ? 'L' : 'M'} ${xDia(i)} ${yHum(v).toFixed(1)}`).join(' ')
const LARGO_CURVA = SECADO.slice(1).reduce((s, v, i) => s + Math.hypot(xDia(i + 1) - xDia(i), yHum(v) - yHum(SECADO[i])), 0)
const dibujado = computed(() => tramo(3, 0.04, 0.86))

// Paso 5
const ARREGLOS = ['Drywall & baseboards replaced', 'Painted to match', 'Air quality & moisture verified']

// Lo que se queda fijo: en el ordenador, todo; en el móvil, solo el parte (el título pasa antes)
const pegado = () => (esMovil.value ? escena.value : fijo.value)

function medirTope() {
  topeFijo = pegado() ? parseFloat(getComputedStyle(pegado()).top) || 0 : 0
}

function medir() {
  const s = seccion.value
  const f = pegado()
  if (!s || !f) return
  const inicio = esMovil.value && texto.value ? texto.value.offsetTop + texto.value.offsetHeight : 0
  const recorrido = s.offsetHeight - inicio - f.offsetHeight
  const arriba = s.getBoundingClientRect().top + inicio - topeFijo
  objetivo = recorrido > 0 ? Math.min(1, Math.max(0, -arriba / recorrido)) : 0
}

// El valor persigue al scroll con suavidad; sin nada que perseguir, no hay bucle
function cuadro() {
  bucle = 0
  const d = objetivo - p.value
  p.value = Math.abs(d) < 0.0004 ? objetivo : p.value + d * 0.14
  if (visible && p.value !== objetivo) bucle = requestAnimationFrame(cuadro)
}

function alMoverse() {
  if (!visible) return
  medir()
  if (!bucle) bucle = requestAnimationFrame(cuadro)
}

function alCambiarTamano() {
  medirTope()
  alMoverse()
}

onMounted(() => {
  const movil = window.matchMedia('(max-width: 899px)')
  esMovil.value = movil.matches
  movil.addEventListener('change', (e) => {
    esMovil.value = e.matches
    nextTick(alCambiarTamano)
  })
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    p.value = 1
    return
  }
  medirTope()
  observador = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting
    quieta.value = !visible
    if (visible) alMoverse()
  })
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
      <div class="envoltura rejilla">
        <div ref="texto" class="texto">
          <p class="antetitulo">How we work</p>
          <h2 class="titulo-2">From your call to a dry, restored home.</h2>
          <p class="entrada">
            Every job follows the same five steps, and every step goes on the record:
            photos, moisture readings and a clear report your insurance can work with.
          </p>
          <div class="avance" aria-hidden="true">
            <span v-for="(x, i) in PASOS" :key="x.titulo" :class="estado(i)"><i :style="{ transform: `scaleX(${tDe(i)})` }" /></span>
          </div>
          <p class="paso-de" aria-hidden="true">
            <template v-if="cerrado">Job closed · report ready</template>
            <template v-else>Step {{ activo + 1 }} of {{ N }} · {{ PASOS[activo].titulo }}</template>
          </p>
        </div>

        <div ref="escena" class="escena">
          <article class="parte" :class="{ cerrado, sellado }" aria-label="Sample job report: how a job runs, step by step">
            <header class="cabeza">
              <p class="nombre-parte">Job report</p>
              <span class="estado-parte"><span class="luz" />{{ cerrado ? 'Closed' : 'In progress' }}</span>
              <p class="sub">Sample job · Water leak &amp; mold · Cape Coral, FL</p>
            </header>

            <ol class="lineas">
              <li v-for="(x, i) in PASOS" :key="x.titulo" :class="estado(i)">
                <span class="marca" aria-hidden="true">
                  <svg viewBox="0 0 24 24"><path d="M6 12.5l4 4 8-9" /></svg>
                </span>
                <span class="cuando">{{ CUANDO[i] }}</span>
                <div class="cuerpo">
                  <h3>{{ x.titulo }}</h3>
                  <div class="plegable">
                    <div class="dentro">
                      <p class="que">
                        <template v-for="(w, k) in PALABRAS[i]" :key="k"><span :class="{ vista: palabraVista(i, k) }">{{ w }}</span>{{ ' ' }}</template>
                      </p>

                      <!-- 1 · la llamada -->
                      <div v-if="i === 0" class="detalle llamada" aria-hidden="true">
                        <div class="linea-llamada" :class="{ contestado }">
                          <span class="tel"><Icono nombre="telefono" /></span>
                          <span>{{ contestado ? 'The owner, on the line' : 'Incoming call…' }}</span>
                          <b v-if="contestado">{{ duracion }}</b>
                        </div>
                        <ul class="lista">
                          <li v-for="(c, k) in CONSEJOS" :key="c" :class="{ visto: tDe(0) > 0.34 + k * 0.2 }"><Icono nombre="check" />{{ c }}</li>
                        </ul>
                      </div>

                      <!-- 2 · la cámara térmica -->
                      <div v-else-if="i === 1" class="detalle termica" aria-hidden="true" :style="{ '--barrido': `${barrido}%` }">
                        <div class="pared-ir">
                          <div class="ir" />
                          <span class="linea-ir" />
                          <span v-for="m in MANCHAS" :key="m.x" class="lectura-ir" :class="{ visto: barrido > m.x + 4, abajo: m.abajo }" :style="{ left: `${m.x}%` }">{{ m.texto }}</span>
                        </div>
                      </div>

                      <!-- 3 · extracción y contención -->
                      <div v-else-if="i === 2" class="detalle extraccion" aria-hidden="true">
                        <div class="fila-barra"><span>Water extracted</span><b>{{ extraido }}%</b></div>
                        <div class="barra"><span :style="{ transform: `scaleX(${extraido / 100})` }" /></div>
                        <div class="chips">
                          <span v-for="(m, k) in MEDIDAS" :key="m" :class="{ visto: tDe(2) > 0.3 + k * 0.2 }"><Icono nombre="check" />{{ m }}</span>
                        </div>
                      </div>

                      <!-- 4 · la curva del secado -->
                      <div v-else-if="i === 3" class="detalle secado" aria-hidden="true">
                        <svg viewBox="0 0 300 118">
                          <line class="meta" x1="10" :y1="yHum(META)" x2="296" :y2="yHum(META)" />
                          <text class="meta-texto" x="10" :y="yHum(META) + 15">Dry goal {{ META }}%</text>
                          <path class="curva" :d="curva" :style="{ strokeDasharray: LARGO_CURVA, strokeDashoffset: LARGO_CURVA * (1 - dibujado) }" />
                          <g v-for="(v, k) in SECADO" :key="k" class="punto" :class="{ visto: dibujado >= k / (SECADO.length - 1) - 0.001, ultimo: k === SECADO.length - 1 }">
                            <circle :cx="xDia(k)" :cy="yHum(v)" r="4.5" />
                            <text :x="xDia(k)" :y="yHum(v) - 10" text-anchor="middle">{{ v }}%</text>
                            <text class="dia" :x="xDia(k)" y="116" text-anchor="middle">Day {{ k + 1 }}</text>
                          </g>
                        </svg>
                      </div>

                      <!-- 5 · arreglos y revisión final -->
                      <ul v-else class="detalle lista" aria-hidden="true">
                        <li v-for="(a, k) in ARREGLOS" :key="a" :class="{ visto: tDe(4) > 0.12 + k * 0.24 }"><Icono nombre="check" />{{ a }}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </li>
            </ol>

            <footer class="pie" aria-hidden="true">
              <span><Icono nombre="camara" /><b>{{ fotos }}</b> photos</span>
              <span><Icono nombre="medidor" /><b>{{ lecturas }}</b> readings</span>
              <span><Icono nombre="documento" />Report <b>{{ cerrado ? 'ready' : 'in progress' }}</b></span>
            </footer>

            <div class="sello" :class="{ visible: sellado }" aria-hidden="true">
              <span class="sello-1"><Icono nombre="check" />Clearance passed</span>
              <span class="sello-2">Ready for your insurer</span>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Alto de sobra para que cada paso dure una pantalla larga; lo de dentro se queda fijo */
.trabajo { position: relative; height: 520vh; background: var(--blanco); }
.fijo {
  position: sticky;
  top: var(--alto-cabecera);
  height: calc(100vh - var(--alto-cabecera));
  display: grid;
  align-items: center;
  overflow: hidden;
}
.rejilla { display: grid; grid-template-columns: minmax(0, .85fr) minmax(0, 1.15fr); gap: 56px; align-items: center; }

/* ---- El texto ---- */
.texto { display: grid; gap: 14px; }
.entrada { color: var(--tinta-2); font-size: 18px; max-width: 46ch; }
.avance { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; margin-top: 12px; max-width: 420px; }
.avance span { height: 4px; border-radius: 2px; background: var(--linea); overflow: hidden; }
.avance i { display: block; height: 100%; background: var(--azul); transform-origin: left; }
.avance .hecho i { background: var(--verde); }
.paso-de { font-size: 15px; font-weight: 600; color: var(--tinta-2); min-height: 1.5em; }

/* ---- El parte: de alto fijo (no salta al abrirse y plegarse los pasos); el sello cae en el hueco de abajo ---- */
.parte {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: min(580px, calc(100vh - var(--alto-cabecera) - 48px));
  background: var(--blanco);
  border: 1px solid var(--linea);
  border-radius: 22px;
  box-shadow: var(--sombra-alta);
  overflow: hidden;
}
.parte.sellado { animation: golpe .35s var(--curva) .08s; }
@keyframes golpe { 30% { transform: translateY(3px) scale(.995); } }
.cabeza {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  column-gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--linea);
}
.nombre-parte { font-size: 17px; font-weight: 800; color: var(--tinta); }
.sub { grid-column: 1 / -1; font-size: 13px; color: var(--tinta-3); }
.estado-parte {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 30px;
  padding: 0 12px;
  border-radius: var(--pildora);
  background: var(--azul-suave);
  color: var(--azul);
  font-size: 13px;
  font-weight: 700;
  transition: background-color .4s var(--curva), color .4s var(--curva);
}
.luz { width: 8px; height: 8px; border-radius: 50%; background: currentColor; animation: latir 1.6s ease-in-out infinite; }
.cerrado .estado-parte { background: #dcfce7; color: var(--verde); }
.cerrado .luz { animation: none; }
@keyframes latir { 50% { opacity: .35; } }

/* Las líneas: hechas (verde, plegadas), la de ahora (abierta, con su detalle) y las que faltan (grises) */
.lineas { flex: 1; list-style: none; padding: 6px 0; }
.lineas > li {
  display: grid;
  grid-template-columns: 26px 78px minmax(0, 1fr);
  grid-template-areas: "marca cuando cuerpo";
  column-gap: 12px;
  padding: 9px 20px;
  transition: background-color .35s var(--curva);
}
.lineas > li.activo { background: linear-gradient(90deg, var(--azul-suave), rgba(232, 240, 251, 0)); }
.marca { grid-area: marca; padding-top: 1px; }
.cuando {
  grid-area: cuando;
  padding-top: 3px;
  font-size: 13px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--tinta-3);
  white-space: nowrap;
}
.cuerpo { grid-area: cuerpo; min-width: 0; }
h3 { font-size: 16px; font-weight: 800; line-height: 1.35; color: var(--tinta); transition: color .35s var(--curva); }
.pendiente h3, .pendiente .cuando { color: #b4bfcc; }

.marca svg {
  display: block;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid var(--linea);
  background: var(--blanco);
  transition: background-color .3s var(--curva), border-color .3s var(--curva);
}
.marca path {
  fill: none;
  stroke: #fff;
  stroke-width: 2.6;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 20;
  stroke-dashoffset: 20;
  transition: stroke-dashoffset .35s var(--curva) .1s;
}
.activo .marca svg { border-color: var(--azul); box-shadow: 0 0 0 4px rgba(26, 100, 200, .14); }
.hecho .marca svg { background: var(--verde); border-color: var(--verde); }
.hecho .marca path { stroke-dashoffset: 0; }

/* Se abre y se pliega con su alto de verdad (grid 0fr → 1fr) */
.plegable { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .45s var(--curva); }
.activo .plegable { grid-template-rows: 1fr; }
.dentro { min-height: 0; overflow: hidden; opacity: 0; transition: opacity .3s var(--curva); }
.activo .dentro { opacity: 1; transition-delay: .12s; }
.detalle { margin: 12px 0 6px; }

/* El texto del paso, que se escribe palabra a palabra */
.que { color: var(--tinta-2); font-size: 15px; margin-top: 2px; }
.que span { opacity: 0; transition: opacity .2s linear; }
.que span.vista { opacity: 1; }

/* Lo que aparece de uno en uno */
.lista { list-style: none; padding: 0; display: grid; gap: 6px; }
.lista li, .chips span {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--tinta);
  opacity: 0;
  transform: translateY(6px);
  transition: opacity .3s var(--curva), transform .3s var(--curva);
}
.lista li.visto, .chips span.visto { opacity: 1; transform: none; }
.lista svg, .chips svg { width: 16px; height: 16px; flex: none; color: var(--verde); stroke-width: 2.6; }

/* 1 · la llamada */
.linea-llamada {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: 700;
  color: var(--tinta-2);
}
.linea-llamada b { margin-left: auto; font-variant-numeric: tabular-nums; color: var(--verde); }
.tel {
  position: relative;
  flex: none;
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--azul);
  color: #fff;
  transition: background-color .3s var(--curva);
}
.tel svg { width: 16px; height: 16px; }
.tel::after { content: ''; position: absolute; inset: -4px; border-radius: 50%; border: 2px solid var(--azul); animation: sonar 1.1s ease-out infinite; }
.contestado .tel { background: var(--verde); }
.contestado .tel::after { display: none; }
@keyframes sonar { from { transform: scale(.85); opacity: .9; } to { transform: scale(1.35); opacity: 0; } }

/* 2 · la cámara térmica: la pared normal y, por donde ha pasado, su imagen en infrarrojo */
.pared-ir {
  position: relative;
  height: 96px;
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(180deg, #efe9de, #e3dacb 78%, #f7f5f0 78%, #f7f5f0 84%, #cfb48c 84%);
}
.ir {
  position: absolute;
  inset: 0;
  clip-path: inset(0 calc(100% - var(--barrido)) 0 0);
  background:
    radial-gradient(ellipse 15% 42% at 18% 70%, #3b1d8f 0%, #2563eb 40%, rgba(34, 211, 238, .7) 68%, transparent 82%),
    radial-gradient(ellipse 12% 30% at 52% 82%, #3b1d8f 0%, #2563eb 42%, rgba(34, 211, 238, .7) 70%, transparent 84%),
    radial-gradient(ellipse 14% 26% at 80% 92%, #4c1d95 0%, #2563eb 40%, rgba(34, 211, 238, .6) 70%, transparent 84%),
    linear-gradient(120deg, #f97316, #fbbf24 45%, #f59e0b 70%, #ef4444);
}
.linea-ir {
  position: absolute;
  top: 0;
  bottom: 0;
  left: var(--barrido);
  width: 2px;
  background: #fff;
  box-shadow: 0 0 10px 2px rgba(255, 255, 255, .8);
}
.lectura-ir {
  position: absolute;
  top: 10px;
  translate: -50% 0;
  padding: 3px 8px;
  border-radius: var(--pildora);
  background: rgba(15, 36, 64, .88);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
  opacity: 0;
  transition: opacity .3s var(--curva);
}
.lectura-ir.visto { opacity: 1; }
.lectura-ir.abajo { top: auto; bottom: 10px; }

/* 3 · extracción */
.fila-barra { display: flex; justify-content: space-between; font-size: 14px; font-weight: 600; color: var(--tinta-2); }
.fila-barra b { font-variant-numeric: tabular-nums; color: var(--azul); }
.barra { height: 8px; margin: 6px 0 12px; border-radius: 4px; background: var(--bruma); overflow: hidden; }
.barra span { display: block; height: 100%; background: linear-gradient(90deg, #5fa2ea, var(--azul)); transform-origin: left; }
.chips { display: flex; flex-wrap: wrap; gap: 6px 14px; }

/* 4 · la curva del secado */
.secado svg { display: block; width: 100%; max-width: 420px; height: auto; overflow: visible; }
.meta { stroke: var(--verde); stroke-width: 1.5; stroke-dasharray: 5 5; }
.meta-texto { font-size: 11px; font-weight: 700; fill: var(--verde); }
.curva { fill: none; stroke: var(--azul); stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
.punto { opacity: 0; transition: opacity .25s var(--curva); }
.punto.visto { opacity: 1; }
.punto circle { fill: var(--blanco); stroke: var(--azul); stroke-width: 2.5; }
.punto text { font-size: 12px; font-weight: 800; fill: var(--tinta); }
.punto .dia { font-size: 11px; font-weight: 600; fill: var(--tinta-3); }
.punto.ultimo circle { fill: var(--verde); stroke: var(--verde); }
.punto.ultimo text:not(.dia) { fill: var(--verde); }

/* El pie: lo que va quedando documentado */
.pie {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 18px;
  padding: 12px 20px;
  border-top: 1px solid var(--linea);
  background: #fafbfd;
  font-size: 13px;
  color: var(--tinta-3);
}
.pie span { display: inline-flex; align-items: center; gap: 6px; }
.pie svg { width: 16px; height: 16px; flex: none; color: var(--tinta-3); }
.pie b { color: var(--tinta); font-variant-numeric: tabular-nums; }

/* El sello del cierre: cae en el hueco que dejan los pasos plegados */
.sello {
  position: absolute;
  right: 28px;
  bottom: 74px;
  display: grid;
  justify-items: center;
  gap: 2px;
  padding: 10px 18px 12px;
  border: 3px solid var(--verde);
  border-radius: 12px;
  background: rgba(255, 255, 255, .9);
  color: var(--verde);
  rotate: -8deg;
  opacity: 0;
  scale: 1.7;
  pointer-events: none;
  transition: opacity .2s var(--curva), scale .4s cubic-bezier(.2, 1.4, .45, 1);
}
.sello.visible { opacity: 1; scale: 1; }
.sello-1 { display: inline-flex; align-items: center; gap: 6px; font-size: 18px; font-weight: 800; letter-spacing: .04em; text-transform: uppercase; }
.sello-1 svg { width: 20px; height: 20px; stroke-width: 3; }
.sello-2 { font-size: 12px; font-weight: 700; }

.quieta .luz, .quieta .tel::after { animation-play-state: paused; }

/* ---- Móvil, en dos tiempos: el título pasa y luego el parte se queda fijo a toda pantalla ---- */
@media (max-width: 899px) {
  .trabajo { height: 480svh; }
  .fijo, .rejilla { display: contents; }
  .texto { gap: 10px; padding: 56px var(--margen) 8px; }
  .titulo-2 { font-size: 28px; }
  .entrada { font-size: 16px; }
  .avance, .paso-de { display: none; }
  .escena {
    position: sticky;
    top: var(--alto-cabecera);
    height: calc(100svh - var(--alto-cabecera) - var(--alto-barra-movil));
    display: flex;
    align-items: center;
    padding: 14px var(--margen) 16px;
  }
  .parte { flex: 1; height: min(100%, 600px); min-height: 0; border-radius: 20px; }
  .lineas { min-height: 0; overflow: hidden; }
  .cabeza { padding: 12px 16px; }
  .nombre-parte { font-size: 16px; }
  .sub { font-size: 12px; }
  /* la hora, solo en el paso de ahora */
  .lineas > li {
    grid-template-columns: 26px minmax(0, 1fr);
    grid-template-areas: "marca cuerpo";
    column-gap: 10px;
    padding: 7px 16px;
  }
  .lineas > li.activo { grid-template-areas: "marca cuando" "marca cuerpo"; }
  .cuando { display: none; padding-top: 0; font-size: 12px; line-height: 1.3; }
  .activo .cuando { display: block; }
  h3 { font-size: 15px; }
  .que { font-size: 14px; }
  .detalle { margin: 8px 0 4px; }
  .pared-ir { height: 96px; }
  .pie { gap: 4px 14px; padding: 10px 16px; font-size: 12px; }
  .pie span { gap: 4px; white-space: nowrap; }
  .pie svg { width: 14px; height: 14px; }
  .sello { right: 18px; bottom: 62px; }
}
/* Móviles bajos: sin la explicación de cada paso, que el parte quepa entero */
@media (max-width: 899px) and (max-height: 700px) {
  .que { display: none; }
}
</style>
