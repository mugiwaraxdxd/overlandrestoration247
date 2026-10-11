<script setup>
import { fotosDe } from '~/utils/obras'

// Un trabajo real, contado con sus fotos: con el scroll van cayendo una a una sobre la mesa, como
// las copias impresas de un expediente, cada una con su giro, y se apilan. Al lado, el paso en el
// que va y lo que se ve en la foto de arriba. En el móvil, en dos tiempos: el texto pasa y luego la
// mesa se queda fija a toda pantalla.
const props = defineProps({ obra: { type: Object, required: true } })

const fotos = fotosDe(props.obra)
const N = fotos.length
const seccion = ref(null)
const fijo = ref(null)
const texto = ref(null)
const escena = ref(null)
const copias = []
const p = ref(0)
const cargar = ref(false)
const esMovil = ref(false)
let objetivo = 0
let bucle = 0
let visible = false
let reducido = false
let topeFijo = 0
let observador = null

// Cuántas copias han caído ya (la primera está siempre en la mesa)
const u = computed(() => 1 + Math.min(1, Math.max(0, p.value)) * (N - 1))
const arriba = computed(() => Math.min(N - 1, Math.max(0, Math.round(u.value - 0.55))))
const actual = computed(() => fotos[arriba.value])

// El giro y el sitio de cada copia en la mesa (fijos, como si se hubieran ido dejando caer)
const GIRO = fotos.map((_, i) => (((i * 37) % 11) - 5) * 1.15)
const DX = fotos.map((_, i) => (((i * 53) % 7) - 3) * 9)
const DY = fotos.map((_, i) => (((i * 29) % 5) - 2) * 7)

// Lo que cae: desde arriba de la mesa, girando más y algo más grande; al tocar, se asienta
function colocar() {
  for (let i = 0; i < N; i++) {
    const el = copias[i]
    if (!el) continue
    const q = Math.min(1, Math.max(0, u.value - i))
    const e = 1 - (1 - q) ** 3
    const y = (1 - e) * -120
    const giro = GIRO[i] + (1 - e) * (GIRO[i] * 2 + 9)
    const escala = 1 + (1 - e) * 0.14
    el.style.transform = `translate3d(calc(-50% + ${DX[i]}px), calc(-50% + ${DY[i]}px + ${y.toFixed(2)}vh), 0) rotate(${giro.toFixed(2)}deg) scale(${escala.toFixed(3)})`
    el.style.opacity = q <= 0 ? '0' : '1'
  }
}

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
  const desde = s.getBoundingClientRect().top + inicio - topeFijo
  objetivo = recorrido > 0 ? Math.min(1, Math.max(0, -desde / recorrido)) : 0
}

function cuadro() {
  bucle = 0
  const d = objetivo - p.value
  p.value = reducido || Math.abs(d) < 0.0004 ? objetivo : p.value + d * 0.16
  colocar()
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
  reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const movil = window.matchMedia('(max-width: 899px)')
  esMovil.value = movil.matches
  movil.addEventListener('change', (e) => {
    esMovil.value = e.matches
    nextTick(alCambiarTamano)
  })
  medirTope()
  colocar()
  // las fotos se piden al acercarse, no al abrir la página
  observador = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting
    if (visible) {
      cargar.value = true
      alMoverse()
    }
  }, { rootMargin: '100% 0px' })
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
  <section :id="obra.id" ref="seccion" class="expediente" :style="{ '--fotos': N }">
    <div ref="fijo" class="fijo">
      <div class="envoltura rejilla">
        <div ref="texto" class="texto">
          <p class="antetitulo">{{ obra.tipo }} · <span class="lugar">{{ obra.lugar }}</span></p>
          <h2 class="titulo-2">{{ obra.titulo }}</h2>
          <p class="resumen">{{ obra.resumen }}</p>
          <ol class="pasos" aria-label="Steps of the job">
            <li v-for="(paso, i) in obra.pasos" :key="paso.titulo" :class="{ ahora: i === actual.paso, hecho: i < actual.paso }">
              <span class="num">{{ String(i + 1).padStart(2, '0') }}</span>{{ paso.titulo }}
            </li>
          </ol>
        </div>

        <div ref="escena" class="escena">
          <div class="mesa">
            <figure
              v-for="(x, i) in fotos" :key="x.src" :ref="(el) => { copias[i] = el }"
              class="copia" :style="{ '--ancho': x.ancho, '--alto': x.alto, zIndex: i + 1 }"
            >
              <img v-if="cargar" :src="x.src" :width="x.ancho" :height="x.alto" :alt="x.texto" decoding="async">
            </figure>
          </div>
          <div class="pie-foto" aria-live="polite">
            <p class="paso-actual"><b>{{ String(actual.paso + 1).padStart(2, '0') }}</b> {{ actual.nombrePaso }} <span>· photo {{ arriba + 1 }} of {{ N }}</span></p>
            <Transition name="leyenda" mode="out-in">
              <p :key="actual.src" class="leyenda">{{ actual.texto }}</p>
            </Transition>
          </div>
        </div>
      </div>
    </div>
    <!-- en el móvil, el recorrido de scroll durante el que la mesa se queda fija -->
    <div class="recorrido" aria-hidden="true" />
  </section>
</template>

<style scoped>
/* Cada copia, un buen trozo de scroll; la mesa se queda fija mientras caen */
.expediente { position: relative; height: calc(var(--fotos) * 34vh + 100vh); overflow-x: clip; }   /* las copias giradas no desbordan (clip no rompe el sticky) */
.fijo {
  position: sticky;
  top: var(--alto-cabecera);
  height: calc(100vh - var(--alto-cabecera));
  display: grid;
  align-items: center;
}
.rejilla { display: grid; grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr); gap: 48px; align-items: center; }
.recorrido { display: none; }

/* ---- El texto ---- */
.texto { display: grid; gap: 14px; }
.lugar { color: var(--tinta-3); font-weight: 600; }
.resumen { color: var(--tinta-2); font-size: 17px; max-width: 46ch; }
.pasos { list-style: none; padding: 0; margin-top: 8px; display: grid; gap: 4px; }
.pasos li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 7px 12px;
  border-radius: 12px;
  font-weight: 700;
  color: #9aa7b8;
  transition: background-color .3s var(--curva), color .3s var(--curva);
}
.num { font-size: 13px; font-variant-numeric: tabular-nums; }
.pasos .hecho { color: var(--tinta-2); }
.pasos .ahora { color: var(--tinta); background: var(--azul-suave); }
.pasos .ahora .num { color: var(--azul); }

/* ---- La mesa y las copias ---- */
.escena { display: grid; gap: 16px; }
.mesa { position: relative; height: min(64vh, 620px); }
.copia {
  position: absolute;
  left: 50%;
  top: 50%;
  margin: 0;
  /* a su tamaño real como mucho (las fotos pequeñas no se amplían) y que quepa en la mesa */
  width: min(calc(var(--ancho) * 1px), 380px, calc(min(64vh, 620px) * .82 * var(--ancho) / var(--alto)));
  aspect-ratio: var(--ancho) / var(--alto);
  padding: 10px 10px 30px;
  box-sizing: content-box;
  background: #fff;
  border-radius: 3px;
  box-shadow: 0 1px 2px rgba(15, 36, 64, .12), 0 14px 34px rgba(15, 36, 64, .18);
  opacity: 0;
  will-change: transform;
}
.copia img { display: block; width: 100%; height: 100%; object-fit: cover; background: #e9edf2; }
.pie-foto { display: grid; gap: 6px; justify-items: center; text-align: center; min-height: 80px; }
.paso-actual { font-size: 14px; font-weight: 700; color: var(--tinta); }
.paso-actual b { color: var(--azul); margin-right: 4px; }
.paso-actual span { color: var(--tinta-3); font-weight: 600; }
.leyenda { font-size: 17px; color: var(--tinta-2); max-width: 44ch; }
.leyenda-enter-active, .leyenda-leave-active { transition: opacity .2s var(--curva), transform .2s var(--curva); }
.leyenda-enter-from { opacity: 0; transform: translateY(6px); }
.leyenda-leave-to { opacity: 0; transform: translateY(-4px); }

/* ---- Móvil, en dos tiempos: el texto pasa y luego la mesa se queda fija a toda pantalla ---- */
@media (max-width: 899px) {
  .expediente { height: auto; }
  .fijo, .rejilla { display: contents; }
  .recorrido { display: block; height: calc(var(--fotos) * 30svh); }
  .texto { padding: 56px var(--margen) 12px; }
  .resumen { font-size: 16px; }
  .pasos { display: none; }
  .escena {
    position: sticky;
    top: var(--alto-cabecera);
    height: calc(100svh - var(--alto-cabecera) - var(--alto-barra-movil));
    grid-template-rows: minmax(0, 1fr) auto;
    padding: 12px var(--margen) 14px;
  }
  .mesa { height: 100%; }
  .copia {
    width: min(calc(var(--ancho) * 1px), 270px, calc((100svh - var(--alto-cabecera) - var(--alto-barra-movil) - 170px) * .9 * var(--ancho) / var(--alto)));
    padding: 8px 8px 24px;
  }
  .leyenda { font-size: 15px; }
}
</style>
