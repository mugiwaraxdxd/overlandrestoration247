<script setup>
import { SITIO } from '~/utils/sitio'
import { SERVICIOS, TOTAL_SERVICIOS } from '~/utils/contenido'

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
          <!-- El menú grande: todos sus servicios en sus cuatro grupos -->
          <div v-show="servicios" class="panel">
            <div v-for="s in SERVICIOS" :key="s.slug" class="columna">
              <NuxtLink :to="`/services/${s.slug}`" class="grupo-menu">
                <span class="icono-circulo"><Icono :nombre="s.icono" /></span>
                <b>{{ s.titulo }}</b>
              </NuxtLink>
              <NuxtLink v-for="x in s.catalogo" :key="x.ancla" :to="`/services/${s.slug}#${x.ancla}`" class="sub">{{ x.titulo }}</NuxtLink>
            </div>
            <p class="pie-menu"><span class="disponible" aria-hidden="true" />{{ TOTAL_SERVICIOS }} services · on call 24/7 across Southwest Florida</p>
          </div>
        </Transition>
      </div>
      <NuxtLink to="/areas" class="enlace">Areas</NuxtLink>
      <NuxtLink to="/reviews" class="enlace">Reviews</NuxtLink>
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
      <details v-for="s in SERVICIOS" :key="s.slug" class="grupo-movil">
        <summary class="fila">
          <span class="icono-circulo"><Icono :nombre="s.icono" /></span>{{ s.titulo }}
          <span class="cuantos">{{ s.catalogo.length }}</span>
        </summary>
        <NuxtLink :to="`/services/${s.slug}`" class="sub-movil todo">All {{ s.nombre.toLowerCase() }} services →</NuxtLink>
        <NuxtLink v-for="x in s.catalogo" :key="x.ancla" :to="`/services/${s.slug}#${x.ancla}`" class="sub-movil">{{ x.titulo }}</NuxtLink>
      </details>
      <p class="grupo">More</p>
      <NuxtLink to="/areas" class="fila sencilla">Areas we serve</NuxtLink>
      <NuxtLink to="/reviews" class="fila sencilla">Reviews</NuxtLink>
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
  background: var(--blanco);
  border-bottom: 1px solid var(--linea);
}
/* El cristal esmerilado, solo con ratón: en el móvil desenfocar lo de detrás cuesta en cada
   fotograma del scroll (y al 94 % casi no se nota) */
@media (hover: hover) and (min-width: 900px) {
  .cabecera { background: rgba(255, 255, 255, .94); backdrop-filter: saturate(1.4) blur(10px); }
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
/* El menú grande, centrado bajo la cabecera */
.panel {
  position: fixed;
  top: calc(var(--alto-cabecera) - 6px);
  left: 50%;
  transform: translateX(-50%);
  width: min(1120px, calc(100vw - 48px));
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px 20px;
  padding: 22px;
  background: var(--blanco);
  border-radius: var(--radio);
  box-shadow: var(--sombra-alta);
}
.panel::before { content: ''; position: absolute; left: 0; right: 0; top: -30px; height: 30px; }
.columna { display: grid; align-content: start; gap: 2px; }
.grupo-menu {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  margin-bottom: 4px;
  border-radius: 14px;
  text-decoration: none;
  transition: background-color .2s var(--curva);
}
.grupo-menu:hover { background: var(--bruma); }
.grupo-menu .icono-circulo { width: 40px; height: 40px; border-radius: 12px; }
.grupo-menu .icono-circulo svg { width: 20px; height: 20px; }
.grupo-menu b { font-size: 15px; line-height: 1.25; }
.sub {
  padding: 7px 10px;
  border-radius: 10px;
  font-size: 14px;
  color: var(--tinta-2);
  text-decoration: none;
  transition: background-color .2s var(--curva), color .2s var(--curva);
}
.sub:hover { background: var(--azul-suave); color: var(--azul); }
.pie-menu {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
  padding-top: 14px;
  border-top: 1px solid var(--linea);
  font-size: 14px;
  color: var(--tinta-3);
}
.pie-menu .disponible { background: var(--verde); }
.pie-menu .disponible::after { background: var(--verde); }

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
.grupo-movil summary { list-style: none; cursor: pointer; }
.grupo-movil summary::-webkit-details-marker { display: none; }
.cuantos { margin-left: auto; min-width: 28px; height: 24px; display: grid; place-items: center; border-radius: var(--pildora); background: var(--bruma); font-size: 13px; color: var(--tinta-3); }
.grupo-movil[open] .cuantos { background: var(--azul); color: #fff; }
.sub-movil { display: block; padding: 9px 6px 9px 64px; font-size: 15px; color: var(--tinta-2); text-decoration: none; }
.sub-movil.todo { color: var(--azul); font-weight: 700; }
.fila.sencilla { padding: 12px 6px; border-bottom: 1px solid var(--linea); border-radius: 0; }
.cortina .llamar { margin-top: 24px; }

.menu-enter-active, .menu-leave-active { transition: opacity .2s var(--curva), transform .2s var(--curva); }
.menu-enter-from, .menu-leave-to { opacity: 0; transform: translate(-50%, -6px); }
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
