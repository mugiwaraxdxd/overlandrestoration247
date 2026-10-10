<script setup>
import { SITIO } from '~/utils/sitio'
import { useLimpieza } from '~/composables/useLimpieza'

// El final del recorrido: la pared ya está limpia, el sello, llamar o mandar fotos
const { progresoPagina } = useLimpieza()
const porcentaje = computed(() => Math.round(progresoPagina.value * 100))
const restaurada = computed(() => progresoPagina.value > 0.97)

const PROBLEMAS = ['Water', 'Mold', 'Fire & smoke', 'Storm']
const problema = ref('Water')
const fotos = ref([])
const enviado = ref(false)

function elegirFotos(e) {
  fotos.value = [...(e.target.files || [])].map(f => f.name)
}
// Demo: el formulario aún no manda nada (en la web de verdad iría directo al teléfono del dueño)
function enviar() {
  enviado.value = true
}
</script>

<template>
  <section id="final" class="final">
    <div class="contenido">
      <p class="etiqueta-mono estado" :class="{ hecho: restaurada }">
        <span class="punto" />Cleanup · {{ porcentaje }}%
      </p>
      <h2 class="sobre-pared"><span class="tira">Back to normal.<br>Like it never happened.</span></h2>
      <p class="texto sobre-pared-2"><span class="tira">
        Water, mold, fire or storm: call now and the owner answers, day or night.
        Or send photos of the damage and we'll call you back.
      </span></p>
      <a class="llamar" :href="SITIO.telefonoEnlace">
        <span class="disponible" aria-hidden="true" />
        <span>Call now</span>
        <span class="numero">{{ SITIO.telefono }}</span>
      </a>
    </div>

    <form id="fotos" class="formulario" @submit.prevent="enviar">
      <p class="etiqueta-mono titulo">Send photos of the damage</p>
      <template v-if="!enviado">
        <div class="campo">
          <label for="f-nombre">Name</label>
          <input id="f-nombre" type="text" autocomplete="name" required>
        </div>
        <div class="campo">
          <label for="f-tel">Phone</label>
          <input id="f-tel" type="tel" autocomplete="tel" required>
        </div>
        <fieldset class="campo">
          <legend>What happened?</legend>
          <div class="opciones">
            <label v-for="p in PROBLEMAS" :key="p" class="opcion" :class="{ elegida: problema === p }">
              <input v-model="problema" type="radio" name="problema" :value="p">{{ p }}
            </label>
          </div>
        </fieldset>
        <div class="campo">
          <label for="f-fotos">Photos</label>
          <label class="subir" for="f-fotos">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 7h3l2-3h6l2 3h3v12H4z M12 10.5a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" /></svg>
            {{ fotos.length ? `${fotos.length} photo${fotos.length > 1 ? 's' : ''} selected` : 'Take or choose photos' }}
          </label>
          <input id="f-fotos" class="oculto" type="file" accept="image/*" multiple @change="elegirFotos">
        </div>
        <button class="llamar enviar" type="submit">Send to the owner</button>
      </template>
      <div v-else class="gracias" role="status">
        <p class="etiqueta-mono">Demo</p>
        <p>In the live site, this goes straight to the owner's phone. For now, call {{ SITIO.telefono }}.</p>
      </div>
    </form>

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
  gap: 40px;
  padding: 112px var(--margen) 120px;
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
  font-size: clamp(38px, 5.6vw, 88px);
  line-height: .96;
  letter-spacing: -.01em;
  text-transform: uppercase;
}
.texto { max-width: 50ch; font-size: 18px; }

/* El formulario: una ficha de informe */
.formulario {
  display: grid;
  gap: 16px;
  align-content: start;
  padding: 24px;
  background: var(--papel);
  box-shadow: inset 0 0 0 1px var(--carbon), 6px 6px 0 var(--carbon);
  max-width: 520px;
}
.titulo { padding-bottom: 12px; border-bottom: 1px solid var(--hormigon); }
.campo { display: grid; gap: 6px; border: 0; padding: 0; margin: 0; }
.campo > label, legend { font-size: 14px; font-weight: 500; }
legend { margin-bottom: 6px; }
input[type='text'], input[type='tel'] {
  height: 52px;
  padding: 0 14px;
  border: 1px solid var(--hormigon);
  border-radius: var(--radio);
  font: inherit;
  background: var(--papel);
}
input[type='text']:focus, input[type='tel']:focus { outline: none; border-color: var(--carbon); box-shadow: 0 0 0 1px var(--carbon); }
.opciones { display: flex; flex-wrap: wrap; gap: 6px; }
.opcion {
  display: inline-flex;
  align-items: center;
  height: 38px;
  padding: 0 14px;
  border-radius: var(--radio-pildora);
  box-shadow: inset 0 0 0 1px var(--carbon);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color .2s var(--curva), color .2s var(--curva);
}
.opcion input { position: absolute; opacity: 0; pointer-events: none; }
.opcion.elegida { background: var(--carbon); color: var(--papel); }
.subir {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 64px;
  border: 1px dashed var(--carbon);
  border-radius: var(--radio);
  font-weight: 500;
  cursor: pointer;
  transition: background-color .2s var(--curva);
}
.subir:hover { background: var(--niebla); }
.oculto { position: absolute; width: 1px; height: 1px; opacity: 0; }
.enviar { justify-content: center; border: 0; cursor: pointer; height: 52px; }
.gracias { display: grid; gap: 8px; padding: 8px 0; }
.gracias .etiqueta-mono { justify-self: start; padding: 3px 8px; background: var(--obra); }

.sello {
  position: absolute;
  right: clamp(16px, 6vw, 120px);
  top: 70px;
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

@media (min-width: 1000px) {
  .final { grid-template-columns: 1.2fr 1fr; align-items: center; column-gap: clamp(32px, 6vw, 96px); }
  .sello { top: 64px; }
}
</style>
