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
  left: -6px;
  top: -6px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--naranja);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, .9), 0 2px 6px rgba(15, 36, 64, .3);
  animation: aparecer .3s var(--curva) both;
  animation-delay: var(--retraso);
  transition: background-color .35s var(--curva);
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
  stroke: rgba(255, 255, 255, .95);
  stroke-width: 1.5;
  stroke-linecap: round;
  filter: drop-shadow(0 1px 1px rgba(15, 36, 64, .35));
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
.rotulo > .cara { margin-top: -17px; }
.anotacion.izquierda .rotulo > .cara { translate: -100% 0; }

.cara {
  grid-area: 1 / 1;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 34px;
  padding: 0 14px 0 12px;
  border-radius: var(--pildora);
  background: var(--blanco);
  box-shadow: var(--sombra);
  white-space: nowrap;
  font-size: 14px;
  font-weight: 700;
  color: var(--tinta);
  transition: opacity .35s var(--curva), transform .35s var(--curva);
}
.antes::before {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--naranja);
}
.despues { opacity: 0; transform: translateY(6px); color: var(--verde); }
.check { width: 8px; height: 8px; border-radius: 50%; background: var(--verde); }
.hecho .antes { opacity: 0; transform: translateY(-6px); }
.hecho .despues { opacity: 1; transform: none; }
.hecho .punto { background: var(--verde); }

@keyframes trazar { to { stroke-dashoffset: 0; } }
@keyframes aparecer { from { opacity: 0; scale: .85; } to { opacity: 1; scale: 1; } }
</style>
