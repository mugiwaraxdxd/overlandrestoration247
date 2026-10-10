<script setup>
import { PREGUNTAS, SERVICIOS } from '~/utils/contenido'

useHead({ title: 'Frequently asked questions' })
</script>

<template>
  <div>
    <section class="cabecera-pagina">
      <div class="envoltura">
        <p class="antetitulo">FAQ</p>
        <h1>Straight answers to common questions.</h1>
        <p class="entradilla">Can't find yours? Call us any time: the owner answers.</p>
      </div>
    </section>

    <section class="seccion">
      <div class="envoltura bloque">
        <h2 class="titulo-3">General</h2>
        <PreguntasLista :preguntas="PREGUNTAS" />
      </div>
      <div v-for="s in SERVICIOS" :key="s.slug" class="envoltura bloque">
        <h2 class="titulo-3"><span class="icono-circulo"><Icono :nombre="s.icono" /></span>{{ s.titulo }}</h2>
        <PreguntasLista :preguntas="s.web.preguntas" />
        <NuxtLink :to="`/services/${s.slug}`" class="enlace-flecha">More about {{ s.nombre.toLowerCase() }} <span>→</span></NuxtLink>
      </div>
    </section>

    <section class="seccion seccion--bruma">
      <div class="envoltura">
        <Contacto />
      </div>
    </section>
  </div>
</template>

<style scoped>
.cabecera-pagina { padding: 56px 0 24px; background: linear-gradient(180deg, var(--azul-suave), var(--blanco)); }
.cabecera-pagina .envoltura { display: grid; gap: 16px; }
h1 { font-size: clamp(34px, 5vw, 56px); font-weight: 800; line-height: 1.08; letter-spacing: -.025em; max-width: 18ch; }
.seccion { padding-top: 32px; }
.bloque { display: grid; gap: 18px; max-width: 900px; margin-bottom: 56px; }
.titulo-3 { display: flex; align-items: center; gap: 14px; font-size: 26px; font-weight: 800; letter-spacing: -.01em; }
.titulo-3 .icono-circulo { width: 44px; height: 44px; border-radius: 12px; }
.titulo-3 .icono-circulo svg { width: 22px; height: 22px; }
</style>
