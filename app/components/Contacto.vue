<script setup>
import { SITIO } from '~/utils/sitio'
import { SERVICIOS } from '~/utils/contenido'

// Llamar o mandar fotos del daño (el formulario de su web también admitía archivos).
// Demo: el formulario aún no envía nada; en la web de verdad iría al teléfono/correo del dueño
const props = defineProps({ servicio: { type: String, default: '' } })

const problema = ref(props.servicio || SERVICIOS[0].slug)
const fotos = ref([])
const enviado = ref(false)

function elegirFotos(e) {
  fotos.value = [...(e.target.files || [])].map(f => f.name)
}
function enviar() {
  enviado.value = true
}
</script>

<template>
  <div class="contacto">
    <div class="info">
      <p v-aparecer class="aparece antetitulo"><span class="disponible" aria-hidden="true" />On call right now</p>
      <h2 v-aparecer="80" class="aparece titulo-2">Let's get your home back to normal.</h2>
      <p v-aparecer="140" class="aparece entradilla">
        Call now and the owner answers, day or night. Or send photos of the damage and we'll call you back.
      </p>
      <a v-aparecer="200" class="aparece llamar" :href="SITIO.telefonoEnlace"><Icono nombre="telefono" />Call {{ SITIO.telefono }}</a>
      <ul v-aparecer="260" class="aparece datos">
        <li><Icono nombre="pin" />{{ SITIO.direccion }}</li>
        <li><Icono nombre="reloj" />Open 24 hours, 7 days a week</li>
        <li><Icono nombre="correo" /><a :href="`mailto:${SITIO.email}`">{{ SITIO.email }}</a></li>
      </ul>
    </div>

    <form id="fotos" v-aparecer="120" class="aparece tarjeta formulario" @submit.prevent="enviar">
      <template v-if="!enviado">
        <h3>Send photos of the damage</h3>
        <div class="dos">
          <div class="campo">
            <label for="f-nombre">Name</label>
            <input id="f-nombre" type="text" autocomplete="name" required>
          </div>
          <div class="campo">
            <label for="f-tel">Phone</label>
            <input id="f-tel" type="tel" autocomplete="tel" required>
          </div>
        </div>
        <fieldset class="campo">
          <legend>What happened?</legend>
          <div class="opciones">
            <label v-for="s in SERVICIOS" :key="s.slug" class="opcion" :class="{ elegida: problema === s.slug }">
              <input v-model="problema" type="radio" name="problema" :value="s.slug"><Icono :nombre="s.icono" />{{ s.nombre }}
            </label>
          </div>
        </fieldset>
        <div class="campo">
          <label for="f-mensaje">Anything we should know? <span class="opcional">(optional)</span></label>
          <textarea id="f-mensaje" rows="3" />
        </div>
        <label class="subir" for="f-fotos">
          <Icono nombre="camara" />
          {{ fotos.length ? `${fotos.length} photo${fotos.length > 1 ? 's' : ''} selected` : 'Take or choose photos' }}
        </label>
        <input id="f-fotos" class="oculto" type="file" accept="image/*" multiple @change="elegirFotos">
        <button class="btn-enviar" type="submit">Send to the owner</button>
      </template>
      <div v-else class="gracias" role="status">
        <span class="icono-circulo"><Icono nombre="check" /></span>
        <h3>Demo form</h3>
        <p>In the live site this goes straight to the owner. For now, call {{ SITIO.telefono }}.</p>
      </div>
    </form>
  </div>
</template>

<style scoped>
.contacto { display: grid; gap: 40px; align-items: start; }
.info { display: grid; gap: 18px; justify-items: start; }
.llamar svg { width: 20px; height: 20px; }
.datos { list-style: none; padding: 0; display: grid; gap: 12px; margin-top: 8px; color: var(--tinta-2); }
.datos li { display: flex; align-items: center; gap: 12px; }
.datos svg { width: 20px; height: 20px; color: var(--azul); flex: none; }
.datos a { color: var(--azul); }

.formulario { display: grid; gap: 18px; padding: 28px; }
.formulario h3 { font-size: 22px; font-weight: 800; }
.dos { display: grid; gap: 18px; }
.campo { display: grid; gap: 8px; border: 0; padding: 0; margin: 0; }
.campo > label, legend { font-size: 15px; font-weight: 700; }
legend { margin-bottom: 8px; }
.opcional { font-weight: 500; color: var(--tinta-3); }
input[type='text'], input[type='tel'], textarea {
  width: 100%;
  min-height: 52px;
  padding: 12px 16px;
  border: 1px solid transparent;
  border-radius: var(--radio-sm);
  background: var(--bruma);
  font: inherit;
  color: var(--tinta);
  transition: border-color .2s var(--curva), background-color .2s var(--curva);
}
textarea { resize: vertical; }
input:focus, textarea:focus { outline: none; border-color: var(--azul); background: var(--blanco); }
.opciones { display: flex; flex-wrap: wrap; gap: 8px; }
.opcion {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 42px;
  padding: 0 16px 0 12px;
  border-radius: var(--pildora);
  background: var(--bruma);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color .2s var(--curva), color .2s var(--curva);
}
.opcion svg { width: 18px; height: 18px; color: var(--azul); }
.opcion input { position: absolute; opacity: 0; pointer-events: none; }
.opcion.elegida { background: var(--azul); color: #fff; }
.opcion.elegida svg { color: #fff; }
.subir {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 64px;
  border: 2px dashed #c3d3e8;
  border-radius: var(--radio-sm);
  color: var(--azul);
  font-weight: 700;
  cursor: pointer;
  transition: background-color .2s var(--curva), border-color .2s var(--curva);
}
.subir:hover { background: var(--azul-suave); border-color: var(--azul); }
.subir svg { width: 22px; height: 22px; }
.oculto { position: absolute; width: 1px; height: 1px; opacity: 0; }
.btn-enviar {
  min-height: 54px;
  border: 0;
  border-radius: var(--pildora);
  background: var(--tinta);
  color: #fff;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  transition: background-color .2s var(--curva), transform .15s var(--curva);
}
.btn-enviar:hover { background: #1c3a63; }
.btn-enviar:active { transform: scale(.98); }
.gracias { display: grid; gap: 10px; justify-items: start; padding: 10px 0; }
.gracias .icono-circulo { background: #dcfce7; color: var(--verde); }
.gracias p { color: var(--tinta-2); }

@media (min-width: 700px) { .dos { grid-template-columns: 1fr 1fr; } }
@media (min-width: 1000px) { .contacto { grid-template-columns: 1fr 1.05fr; gap: 64px; } }
</style>
