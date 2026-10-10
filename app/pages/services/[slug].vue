<script setup>
import { SITIO } from '~/utils/sitio'
import { servicioDe } from '~/utils/contenido'

// La página de un servicio: todo su contenido sale de la página equivalente de su web
const route = useRoute()
const s = computed(() => servicioDe(route.params.slug))
if (!s.value) throw createError({ statusCode: 404, statusMessage: 'Service not found', fatal: true })

// La primera frase o dos de su intro (sus párrafos son muy largos para la cabecera)
function resumen(t = '') {
  const frases = t.match(/[^.!?]+[.!?]+/g) || [t]
  let r = ''
  for (const f of frases) { if ((r + f).length > 260 && r) break; r += f }
  return r.trim()
}

// Las descripciones de los subservicios, en dos frases: las tarjetas no son muros de texto
function corto(t = '') {
  const frases = t.match(/[^.!?]+[.!?]+/g) || [t]
  return frases.slice(0, 2).join('').trim()
}

useHead(() => ({
  title: `${s.value.titulo} in Cape Coral, FL`,
  meta: [{ name: 'description', content: s.value.web.meta }]
}))
</script>

<template>
  <div v-if="s">
    <section class="cabecera-servicio">
      <div class="envoltura rejilla">
        <div class="texto">
          <NuxtLink to="/#servicios" class="migas">Services</NuxtLink>
          <span class="icono-circulo grande"><Icono :nombre="s.icono" /></span>
          <h1>{{ s.titulo }}</h1>
          <p class="entradilla">{{ resumen(s.web.intro[0]) }}</p>
          <div class="acciones">
            <a class="llamar" :href="SITIO.telefonoEnlace"><Icono nombre="telefono" />Call 24/7 · {{ SITIO.telefono }}</a>
            <NuxtLink class="btn-sec" to="#fotos"><Icono nombre="camara" />Send photos</NuxtLink>
          </div>
          <ul class="incluye">
            <li v-for="sub in s.sub" :key="sub"><Icono nombre="check" />{{ sub }}</li>
          </ul>
        </div>
        <!-- Su animación, grande y en bucle: dañado, restaurado, y otra vez -->
        <div class="marco-escena">
          <EscenaServicio :tipo="s.icono" ciclo />
          <p class="nota"><span class="disponible" aria-hidden="true" />On call 24/7 across Southwest Florida</p>
        </div>
      </div>
    </section>

    <section class="seccion">
      <div class="envoltura">
        <div class="cabeza-seccion">
          <p v-aparecer class="aparece antetitulo">What we do</p>
          <h2 v-aparecer="80" class="aparece titulo-2">Our {{ s.titulo.toLowerCase() }} services</h2>
        </div>
        <div class="rejilla-3">
          <div v-for="(x, i) in s.web.servicios" :key="x.titulo" v-aparecer="(i % 3) * 80" class="aparece tarjeta item">
            <span class="numero">{{ String(i + 1).padStart(2, '0') }}</span>
            <h3>{{ x.titulo }}</h3>
            <p>{{ corto(x.texto) }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="seccion seccion--bruma">
      <div class="envoltura dos-columnas">
        <div class="cabeza-seccion">
          <p v-aparecer class="aparece antetitulo">Why it matters</p>
          <h2 v-aparecer="80" class="aparece titulo-2">Done right, the first time.</h2>
          <p v-for="(t, i) in s.web.intro" :key="i" v-aparecer="140" class="aparece cuerpo">{{ t }}</p>
        </div>
        <div class="beneficios">
          <div v-for="(b, i) in s.web.beneficios" :key="b.titulo" v-aparecer="(i % 2) * 80" class="aparece beneficio">
            <span class="icono-circulo"><Icono nombre="check" /></span>
            <div>
              <h3>{{ b.titulo }}</h3>
              <p>{{ b.texto }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="seccion">
      <div class="envoltura">
        <div class="cabeza-seccion">
          <p v-aparecer class="aparece antetitulo">How we work</p>
          <h2 v-aparecer="80" class="aparece titulo-2">From your call to a restored home.</h2>
        </div>
        <Pasos />
      </div>
    </section>

    <BandaNoche />

    <section class="seccion seccion--bruma">
      <div class="envoltura dos-columnas">
        <div class="cabeza-seccion">
          <p v-aparecer class="aparece antetitulo">FAQ</p>
          <h2 v-aparecer="80" class="aparece titulo-2">{{ s.nombre }}: common questions</h2>
        </div>
        <PreguntasLista :preguntas="s.web.preguntas" />
      </div>
    </section>

    <section class="seccion">
      <div class="envoltura">
        <div class="cabeza-seccion">
          <p v-aparecer class="aparece antetitulo">Other services</p>
          <h2 v-aparecer="80" class="aparece titulo-2">We also restore</h2>
        </div>
        <TarjetasServicios :menos="s.slug" />
      </div>
    </section>

    <section class="seccion seccion--bruma">
      <div class="envoltura">
        <Contacto :servicio="s.slug" />
      </div>
    </section>
  </div>
</template>

<style scoped>
.cabecera-servicio {
  padding: 40px 0 64px;
  background: linear-gradient(180deg, var(--azul-suave), var(--blanco));
}
.rejilla { display: grid; gap: 32px; align-items: center; }
.texto { display: grid; gap: 18px; justify-items: start; }
.migas { font-size: 14px; font-weight: 600; color: var(--azul); text-decoration: none; }
.migas::after { content: ' /'; color: var(--tinta-3); }
.icono-circulo.grande { width: 64px; height: 64px; border-radius: 20px; background: var(--blanco); box-shadow: var(--sombra); }
.icono-circulo.grande svg { width: 32px; height: 32px; }
h1 { font-size: clamp(34px, 5vw, 60px); font-weight: 800; line-height: 1.05; letter-spacing: -.025em; }
.acciones { display: flex; flex-wrap: wrap; gap: 12px; }
.acciones svg { width: 20px; height: 20px; }
.incluye { list-style: none; padding: 0; display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px; }
.incluye li { display: inline-flex; align-items: center; gap: 6px; height: 34px; padding: 0 12px 0 10px; border-radius: var(--pildora); background: var(--blanco); box-shadow: inset 0 0 0 1px var(--linea); font-size: 14px; font-weight: 600; }
.incluye li svg { width: 16px; height: 16px; color: var(--verde); stroke-width: 2.4; flex: none; }
.marco-escena { display: grid; gap: 12px; padding: 10px; border-radius: 24px; background: var(--blanco); box-shadow: var(--sombra-alta); }
.nota { display: flex; align-items: center; gap: 10px; padding: 2px 8px 4px; color: var(--tinta-3); font-size: 14px; }
.nota .disponible { background: var(--verde); }
.nota .disponible::after { background: var(--verde); }

.rejilla-3 { display: grid; gap: 20px; }
.item { display: grid; gap: 10px; align-content: start; padding: 26px; }
.numero { font-weight: 800; color: var(--azul); font-size: 15px; }
.item h3, .beneficio h3 { font-size: 19px; font-weight: 800; line-height: 1.3; }
.item p, .beneficio p { color: var(--tinta-2); font-size: 16px; }
.cuerpo { color: var(--tinta-2); }

.beneficios { display: grid; gap: 24px; }
.beneficio { display: flex; gap: 16px; align-items: start; }
.beneficio .icono-circulo { width: 40px; height: 40px; border-radius: 12px; background: #dcfce7; color: var(--verde); }
.beneficio .icono-circulo svg { width: 20px; height: 20px; stroke-width: 2.4; }

@media (min-width: 800px) { .rejilla-3 { grid-template-columns: repeat(2, 1fr); } .beneficios { grid-template-columns: 1fr 1fr; } }
@media (min-width: 1000px) {
  .cabecera-servicio { padding: 64px 0 88px; }
  .rejilla { grid-template-columns: 1.1fr 1fr; gap: 56px; }
  .rejilla-3 { grid-template-columns: repeat(3, 1fr); }
  .dos-columnas { display: grid; grid-template-columns: 1fr 1.5fr; gap: 56px; align-items: start; }
  .beneficios { grid-template-columns: 1fr; }
}
</style>
