<script setup>
// La anotación del informe de obra (DESIGN.md): un punto, una línea fina y su rótulo amarillo.
// Al terminar el trabajo («hecho»), el rótulo pasa a blanco con su punto verde.
const props = defineProps({
  x: { type: Number, required: true },     // % desde la izquierda
  y: { type: Number, required: true },     // % desde arriba
  dx: { type: Number, default: 60 },       // px hasta el rótulo
  dy: { type: Number, default: -60 },
  texto: { type: String, required: true },
  textoHecho: { type: String, required: true },
  hecho: { type: Boolean, default: false },
  retraso: { type: Number, default: 0 }    // ms, para que se dibujen una tras otra
})

const largo = computed(() => Math.hypot(props.dx, props.dy))
</script>

<template>
  <div
    class="anotacion"
    :class="{ hecho, izquierda: dx < 0, abajo: dy > 0 }"
    :style="{ left: `${x}%`, top: `${y}%`, '--retraso': `${retraso}ms`, '--largo': largo }"
  >
    <span class="punto" />
    <svg class="trazo" :width="Math.abs(dx) + 2" :height="Math.abs(dy) + 2" aria-hidden="true">
      <line
        :x1="dx < 0 ? Math.abs(dx) + 1 : 1" :y1="dy < 0 ? Math.abs(dy) + 1 : 1"
        :x2="dx < 0 ? 1 : Math.abs(dx) + 1" :y2="dy < 0 ? 1 : Math.abs(dy) + 1"
      />
    </svg>
    <span class="rotulo" :style="{ transform: `translate(${dx}px, ${dy}px)` }">
      <span class="cara antes">{{ texto }}</span>
      <span class="cara despues"><span class="check" />{{ textoHecho }}</span>
    </span>
  </div>
</template>

<style scoped>
.anotacion {
  position: absolute;
  width: 0;
  height: 0;
  pointer-events: none;
}

.punto {
  position: absolute;
  left: -5px;
  top: -5px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--obra);
  border: 2px solid var(--carbon);
  animation: aparecer .3s var(--curva) both;
  animation-delay: var(--retraso);
}

/* La línea crece desde el punto */
.trazo {
  position: absolute;
  max-width: none;
  overflow: visible;
  left: -1px;
  top: -1px;
}
.anotacion.izquierda .trazo { left: auto; right: -1px; }
.anotacion:not(.abajo) .trazo { top: auto; bottom: -1px; }
.trazo line {
  stroke: var(--carbon);
  stroke-width: 1.25;
  stroke-dasharray: calc(var(--largo) * 1px);
  stroke-dashoffset: calc(var(--largo) * 1px);
  animation: trazar .5s var(--curva) forwards;
  animation-delay: calc(var(--retraso) + 150ms);
}

.rotulo {
  position: absolute;
  left: 0;
  top: 0;
  display: grid;
  animation: aparecer .35s var(--curva) both;
  animation-delay: calc(var(--retraso) + 550ms);
}
.rotulo > .cara { margin-top: -14px; }
.anotacion.izquierda .rotulo > .cara { translate: -100% 0; }

.cara {
  grid-area: 1 / 1;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 28px;
  padding: 0 10px;
  white-space: nowrap;
  font-family: var(--fuente-datos);
  font-weight: 500;
  font-size: 11.5px;
  letter-spacing: .06em;
  text-transform: uppercase;
  color: var(--carbon);
  transition: opacity .35s var(--curva), transform .35s var(--curva);
}
.antes { background: var(--obra); }
.despues {
  background: var(--papel);
  box-shadow: inset 0 0 0 1px var(--carbon);
  opacity: 0;
  transform: translateY(6px);
}
.check {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--seco);
}
.hecho .antes { opacity: 0; transform: translateY(-6px); }
.hecho .despues { opacity: 1; transform: none; }
.hecho .punto { background: var(--seco); transition: background-color .35s var(--curva); }

@keyframes trazar { to { stroke-dashoffset: 0; } }
@keyframes aparecer { from { opacity: 0; scale: .85; } to { opacity: 1; scale: 1; } }
</style>
