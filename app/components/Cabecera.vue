<script setup>
import { SITIO } from '~/utils/sitio'
import { useLimpieza } from '~/composables/useLimpieza'

const { progresoPagina } = useLimpieza()
</script>

<template>
  <header class="cabecera">
    <a class="placa" href="/" aria-label="Overland Restoration 24/7, inicio">
      <img class="simbolo" src="/logo/simbolo.png" alt="" width="448" height="495">
      <span class="nombre">
        <img class="overland" src="/logo/overland.png" alt="Overland" width="1324" height="176">
        <img class="restoration" src="/logo/restoration.png" alt="Restoration 24/7" width="1289" height="204">
      </span>
    </a>

    <nav class="enlaces" aria-label="Principal">
      <a href="#servicios">Services</a>
      <a href="#como-trabajamos">How we work</a>
      <a href="#zonas">Areas</a>
      <a href="#preguntas">FAQ</a>
    </nav>

    <a class="llamar" :href="SITIO.telefonoEnlace">
      <span class="disponible" aria-hidden="true" />
      <span>Call 24/7</span>
      <span class="numero">{{ SITIO.telefono }}</span>
    </a>
    <a class="llamar-icono" :href="SITIO.telefonoEnlace" aria-label="Call 24/7">
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z" /></svg>
    </a>

    <!-- Lo que se ha limpiado camino del botón final -->
    <span class="progreso" :class="{ hecho: progresoPagina >= 1 }" :style="{ transform: `scaleX(${progresoPagina})`, opacity: progresoPagina > 0 ? 1 : 0 }" aria-hidden="true" />
  </header>
</template>

<style scoped>
.cabecera {
  position: fixed;
  inset: 0 0 auto;
  z-index: 50;
  height: var(--alto-cabecera);
  display: flex;
  align-items: center;
  gap: 32px;
  padding: 0 var(--margen);
  background: var(--papel);
  border-bottom: 1px solid var(--hormigon);
}

/* Su logo está hecho sobre negro: vive en su placa, como la pegatina de la furgoneta */
.placa {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 48px;
  padding: 0 12px 0 8px;
  border-radius: var(--radio);
  background: var(--placa);
  text-decoration: none;
}
.simbolo { height: 36px; width: auto; }
.nombre { display: flex; flex-direction: column; gap: 3px; }
.overland { height: 16px; width: auto; }
.restoration { height: 13px; width: auto; display: none; }

.enlaces { display: none; gap: 28px; margin-left: auto; }
.enlaces a {
  font-size: 13px;
  font-weight: 500;
  letter-spacing: .06em;
  text-transform: uppercase;
  color: var(--ceniza);
  text-decoration: none;
  transition: color .2s var(--curva);
}
.enlaces a:hover { color: var(--carbon); }

.cabecera > .llamar { display: none; }

.llamar-icono {
  margin-left: auto;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--obra);
  color: var(--carbon);
  box-shadow: var(--sombra-accion);
}
.llamar-icono:active { transform: scale(.95); }

.progreso {
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 3px;
  background: var(--obra);
  transform-origin: left;
  transition: opacity .3s var(--curva), background-color .4s var(--curva);
}
.progreso.hecho { background: var(--seco); }

@media (min-width: 900px) {
  .placa { height: 56px; padding: 0 16px 0 10px; gap: 10px; }
  .simbolo { height: 42px; }
  .overland { height: 19px; }
  .restoration { display: block; height: 15px; }
  .enlaces { display: flex; }
  .cabecera > .llamar { display: inline-flex; }
  .llamar-icono { display: none; }
}
</style>
