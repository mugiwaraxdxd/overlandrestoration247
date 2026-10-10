<script setup>
import { SITIO } from '~/utils/sitio'
import { SERVICIOS } from '~/utils/contenido'

// La cabecera: el logo en su placa negra (está hecho sobre negro), el menú y llamar.
// En el ordenador, Services despliega los cuatro servicios; en el móvil, un menú a pantalla completa.
const abierto = ref(false)       // el menú del móvil
const servicios = ref(false)     // el desplegable de Services
const route = useRoute()
watch(() => route.fullPath, () => { abierto.value = false; servicios.value = false })
watch(abierto, (v) => { if (import.meta.client) document.documentElement.style.overflow = v ? 'hidden' : '' })
</script>

<template>
  <header class="cabecera">
    <NuxtLink class="placa" to="/" aria-label="Overland Restoration 24/7, home">
      <img class="simbolo" src="/logo/simbolo.png" alt="" width="448" height="495">
      <span class="nombre">
        <img class="overland" src="/logo/overland.png" alt="Overland" width="1324" height="176">
        <img class="restoration" src="/logo/restoration.png" alt="Restoration 24/7" width="1289" height="204">
      </span>
    </NuxtLink>

    <nav class="enlaces" aria-label="Main">
      <div class="desplegable" @mouseenter="servicios = true" @mouseleave="servicios = false">
        <button class="enlace" :aria-expanded="servicios" @click="servicios = !servicios">
          Services
          <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="M3 4.5l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </button>
        <Transition name="menu">
          <div v-show="servicios" class="panel">
            <NuxtLink v-for="s in SERVICIOS" :key="s.slug" :to="`/services/${s.slug}`" class="opcion">
              <span class="icono-circulo"><Icono :nombre="s.icono" /></span>
              <span>
                <b>{{ s.titulo }}</b>
                <small>{{ s.corto }}</small>
              </span>
            </NuxtLink>
          </div>
        </Transition>
      </div>
      <NuxtLink to="/areas" class="enlace">Areas</NuxtLink>
      <NuxtLink to="/faq" class="enlace">FAQ</NuxtLink>
      <NuxtLink to="/contact" class="enlace">Contact</NuxtLink>
    </nav>

    <a class="llamar" :href="SITIO.telefonoEnlace">
      <span class="disponible" aria-hidden="true" />
      Call 24/7 · {{ SITIO.telefono }}
    </a>

    <a class="boton-redondo llamar-movil" :href="SITIO.telefonoEnlace" aria-label="Call 24/7"><Icono nombre="telefono" /></a>
    <button class="boton-redondo menu-movil" :aria-expanded="abierto" aria-label="Menu" @click="abierto = !abierto">
      <Icono :nombre="abierto ? 'cerrar' : 'menu'" />
    </button>
  </header>

  <!-- El menú del móvil -->
  <Transition name="cortina">
    <nav v-show="abierto" class="cortina" aria-label="Mobile">
      <p class="grupo">Services</p>
      <NuxtLink v-for="s in SERVICIOS" :key="s.slug" :to="`/services/${s.slug}`" class="fila">
        <span class="icono-circulo"><Icono :nombre="s.icono" /></span>{{ s.titulo }}
      </NuxtLink>
      <p class="grupo">More</p>
      <NuxtLink to="/areas" class="fila sencilla">Areas we serve</NuxtLink>
      <NuxtLink to="/faq" class="fila sencilla">FAQ</NuxtLink>
      <NuxtLink to="/contact" class="fila sencilla">Contact</NuxtLink>
      <a class="llamar" :href="SITIO.telefonoEnlace"><span class="disponible" aria-hidden="true" />Call 24/7 · {{ SITIO.telefono }}</a>
    </nav>
  </Transition>
</template>

<style scoped>
.cabecera {
  position: fixed;
  inset: 0 0 auto;
  z-index: 50;
  height: var(--alto-cabecera);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 var(--margen);
  background: rgba(255, 255, 255, .94);
  backdrop-filter: saturate(1.4) blur(10px);
  border-bottom: 1px solid var(--linea);
}

/* Su logo está hecho sobre negro: vive en su placa */
.placa {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 48px;
  padding: 0 12px 0 8px;
  border-radius: 12px;
  background: #000;
  text-decoration: none;
  flex: none;
}
.simbolo { height: 36px; width: auto; }
/* Las dos piezas, con su proporción (sin estirarse) y casi el mismo ancho, como en su logo */
.nombre { display: flex; flex-direction: column; align-items: flex-start; gap: 3px; }
.nombre img { object-fit: contain; }
.overland { height: 16px; width: auto; }
.restoration { height: 13px; width: auto; display: none; }

.enlaces { display: none; align-items: center; gap: 6px; margin-left: auto; }
.enlace {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  border: 0;
  border-radius: var(--pildora);
  background: none;
  color: var(--tinta-2);
  font-weight: 600;
  font-size: 15px;
  text-decoration: none;
  cursor: pointer;
  transition: background-color .2s var(--curva), color .2s var(--curva);
}
.enlace:hover, .enlace.router-link-active { background: var(--bruma); color: var(--tinta); }

.desplegable { position: relative; }
.panel {
  position: absolute;
  top: calc(100% + 8px);
  left: -12px;
  width: 420px;
  display: grid;
  gap: 4px;
  padding: 10px;
  background: var(--blanco);
  border-radius: var(--radio);
  box-shadow: var(--sombra-alta);
}
.panel::before { content: ''; position: absolute; left: 0; right: 0; top: -12px; height: 12px; }
.opcion {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px;
  border-radius: 14px;
  text-decoration: none;
  transition: background-color .2s var(--curva);
}
.opcion:hover { background: var(--bruma); }
.opcion .icono-circulo { width: 44px; height: 44px; border-radius: 12px; }
.opcion .icono-circulo svg { width: 22px; height: 22px; }
.opcion b { display: block; font-size: 15px; }
.opcion small { display: block; font-size: 13px; color: var(--tinta-3); line-height: 1.4; }

.cabecera > .llamar { display: none; min-height: 46px; font-size: 15px; }

.boton-redondo {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border: 0;
  border-radius: 50%;
  cursor: pointer;
}
.boton-redondo svg { width: 22px; height: 22px; }
.llamar-movil { margin-left: auto; background: var(--naranja); color: #fff; }
.menu-movil { background: var(--bruma); color: var(--tinta); }

.cortina {
  position: fixed;
  inset: var(--alto-cabecera) 0 0;
  z-index: 49;
  overflow-y: auto;
  display: grid;
  align-content: start;
  gap: 6px;
  padding: 20px var(--margen) 40px;
  background: var(--blanco);
}
.grupo { margin: 14px 0 4px; font-size: 13px; font-weight: 700; color: var(--tinta-3); }
.fila {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 6px;
  border-radius: 14px;
  font-weight: 700;
  font-size: 17px;
  text-decoration: none;
}
.fila .icono-circulo { width: 44px; height: 44px; border-radius: 12px; }
.fila .icono-circulo svg { width: 22px; height: 22px; }
.fila.sencilla { padding: 12px 6px; border-bottom: 1px solid var(--linea); border-radius: 0; }
.cortina .llamar { margin-top: 24px; }

.menu-enter-active, .menu-leave-active { transition: opacity .2s var(--curva), transform .2s var(--curva); }
.menu-enter-from, .menu-leave-to { opacity: 0; transform: translateY(-6px); }
.cortina-enter-active, .cortina-leave-active { transition: opacity .25s var(--curva), transform .25s var(--curva); }
.cortina-enter-from, .cortina-leave-to { opacity: 0; transform: translateY(-10px); }

@media (min-width: 1000px) {
  .cabecera { gap: 28px; }
  .placa { height: 56px; padding: 0 16px 0 10px; gap: 10px; }
  .simbolo { height: 42px; }
  .overland { height: 19px; }
  .restoration { display: block; height: auto; width: 139px; }
  .enlaces { display: flex; }
  .cabecera > .llamar { display: inline-flex; }
  .llamar-movil, .menu-movil { display: none; }
  .cortina { display: none !important; }
}
</style>
