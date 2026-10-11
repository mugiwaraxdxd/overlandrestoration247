<script setup>
import { SEGURO } from '~/utils/contenido'
import { CITAS } from '~/utils/resenas'

// Cada cosa que documentan, con lo que dice de ella un cliente en su reseña
const CITAS_SEGURO = [CITAS.fotos, CITAS.prueba, CITAS.seguro]
</script>

<!-- El seguro: lo que documentan (de su web: «We document the damage, provide detailed reports…») -->
<template>
  <div class="seguro">
    <div class="cabeza-seccion">
      <p v-aparecer class="aparece antetitulo"><Icono nombre="documento" />Insurance claims</p>
      <h2 v-aparecer="80" class="aparece titulo-2">We document everything your adjuster needs.</h2>
      <p v-aparecer="140" class="aparece entradilla">
        Most homeowner policies cover sudden water damage; gradual damage may not.
        Either way, proper documentation is what gets a claim approved. That part is on us.
      </p>
    </div>
    <div class="rejilla">
      <div v-for="(d, i) in SEGURO" :key="d.titulo" v-aparecer="i * 90" class="aparece tarjeta item">
        <span class="icono-circulo"><Icono :nombre="d.icono" /></span>
        <h3>{{ d.titulo }}</h3>
        <p>{{ d.texto }}</p>
        <CitaResena :cita="CITAS_SEGURO[i]" class="lo-dicen" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.rejilla { display: grid; gap: 20px; }
.item { display: grid; gap: 12px; align-content: start; padding: 26px; }
h3 { font-size: 19px; font-weight: 800; }
.item p { color: var(--tinta-2); font-size: 16px; }
.lo-dicen { margin-top: 6px; }
@media (min-width: 900px) { .rejilla { grid-template-columns: repeat(3, 1fr); } }
</style>
