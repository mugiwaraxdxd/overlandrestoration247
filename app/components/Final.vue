<script setup>
import { SITIO } from '~/utils/sitio'
import { useLimpieza } from '~/composables/useLimpieza'

// El final del recorrido: la pared ya está limpia, el sello, y llamar
const { progresoPagina } = useLimpieza()
const porcentaje = computed(() => Math.round(progresoPagina.value * 100))
const restaurada = computed(() => progresoPagina.value > 0.97)
</script>

<template>
  <section id="final" class="final">
    <div class="contenido" data-limpio>
      <p class="etiqueta-mono estado" :class="{ hecho: restaurada }">
        <span class="punto" />Cleanup · {{ porcentaje }}%
      </p>
      <h2>Back to normal.<br>Like it never happened.</h2>
      <p class="texto">
        Water, mold, fire or storm: call now and the owner answers, day or night.
        We document everything for your insurance.
      </p>
      <div class="acciones">
        <a class="llamar" :href="SITIO.telefonoEnlace">
          <span class="disponible" aria-hidden="true" />
          <span>Call now</span>
          <span class="numero">{{ SITIO.telefono }}</span>
        </a>
        <a class="btn-sec" href="#fotos">Send photos of the damage</a>
      </div>
    </div>
    <div class="sello" :class="{ visible: restaurada }" aria-hidden="true">
      <span class="check" />Restored
    </div>
  </section>
</template>

<style scoped>
.final {
  position: relative;
  min-height: 100svh;
  display: grid;
  align-content: center;
  padding: 96px var(--margen) 120px;
}
.contenido { display: grid; gap: 20px; justify-items: start; max-width: 760px; }
.estado {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: var(--obra);
  transition: background-color .4s var(--curva), color .4s var(--curva);
}
.estado .punto { width: 8px; height: 8px; border-radius: 50%; background: var(--carbon); }
.estado.hecho { background: var(--seco); color: var(--papel); }
.estado.hecho .punto { background: var(--papel); }
h2 {
  font-weight: 500;
  font-size: clamp(38px, 6vw, 92px);
  line-height: .96;
  letter-spacing: -.01em;
  text-transform: uppercase;
}
.texto { color: var(--hierro); max-width: 50ch; font-size: 18px; }
.acciones { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 6px; }

.sello {
  position: absolute;
  right: clamp(16px, 8vw, 140px);
  top: 18%;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  background: var(--papel);
  box-shadow: inset 0 0 0 2px var(--carbon), 4px 4px 0 var(--carbon);
  font-family: var(--fuente-datos);
  font-weight: 600;
  font-size: clamp(16px, 2vw, 24px);
  letter-spacing: .12em;
  text-transform: uppercase;
  opacity: 0;
  scale: 1.3;
  rotate: -5deg;
  transition: opacity .25s var(--curva), scale .4s cubic-bezier(.3, 1.4, .5, 1);
}
.sello.visible { opacity: 1; scale: 1; }
.sello .check { width: 10px; height: 10px; border-radius: 50%; background: var(--seco); }
@media (max-width: 899px) { .sello { top: 64px; } }
</style>
