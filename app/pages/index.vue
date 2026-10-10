<template>
  <div>
    <!-- La página es la pared: detrás de todo, empieza donde acaba el hero -->
    <ParedPagina />
    <Cabecera />
    <main>
      <HeroLimpieza />
      <!-- Cada capítulo del informe se abre con su cinta de obra -->
      <Cinta n="01" texto="What happened" :inclinacion="-1.4" />
      <Problemas />
      <Cinta n="02" texto="How we work" :inclinacion="1.2" />
      <ComoTrabajamos />
      <Cinta n="03" texto="On call 24/7" :inclinacion="-1.6" />
      <Noche />
      <Cinta n="04" texto="Your insurance" :inclinacion="1.4" />
      <Seguro />
      <Cinta n="05" texto="Owner-operated" :inclinacion="-1.2" />
      <PorQue />
      <Cinta n="06" texto="Areas we serve" :inclinacion="1.5" />
      <Zonas />
      <Cinta n="07" texto="Questions" :inclinacion="-1.3" />
      <Preguntas />
      <Cinta n="08" texto="Restored" :inclinacion="1.2" />
      <Final />
    </main>
    <Pie />
    <BarraMovil />
  </div>
</template>

<style scoped>
main { position: relative; }
</style>
