<script setup>
useHead({ title: 'Areas we serve in Southwest Florida' })
</script>

<template>
  <div>
    <section class="cabecera-pagina">
      <div class="envoltura">
        <p class="antetitulo"><Icono nombre="pin" />Areas we serve</p>
        <h1>Based in Cape Coral. On call across Southwest Florida.</h1>
        <p class="entradilla">Water, fire, storm and mold restoration in Cape Coral, Fort Myers, Lehigh Acres and the communities around them. Pick your area to see what we do there.</p>
      </div>
    </section>
    <section class="seccion">
      <div class="envoltura">
        <ZonasChips />
      </div>
    </section>
    <BandaNoche />
    <section class="seccion">
      <div class="envoltura">
        <Contacto />
      </div>
    </section>
  </div>
</template>

<style scoped>
.cabecera-pagina { padding: 56px 0 24px; background: linear-gradient(180deg, var(--azul-suave), var(--blanco)); }
.cabecera-pagina .envoltura { display: grid; gap: 16px; }
.cabecera-pagina .antetitulo svg { width: 18px; height: 18px; }
h1 { font-size: clamp(34px, 5vw, 56px); font-weight: 800; line-height: 1.08; letter-spacing: -.025em; max-width: 18ch; }
.seccion { padding-top: 40px; }
</style>
