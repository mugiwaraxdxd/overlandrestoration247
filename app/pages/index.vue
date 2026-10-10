<template>
  <div>
    <!-- La página es la pared: detrás de todo, empieza donde acaba el hero -->
    <ParedPagina />
    <Cabecera />
    <main>
      <HeroLimpieza />
      <Problemas />
      <Noche />
      <Final />
    </main>
    <Pie />
    <BarraMovil />
  </div>
</template>

<style scoped>
main { position: relative; z-index: 1; }
</style>
