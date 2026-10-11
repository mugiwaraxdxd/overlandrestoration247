<script setup>
import { OBRAS, KIT, fotosDe } from '~/utils/obras'

// Sus trabajos reales (su galería), contados como expedientes. Su misma URL: /gallery
useHead({
  title: 'Our work',
  meta: [{ name: 'description', content: 'Real jobs by Overland Restoration 24/7, photo by photo: mold remediation, storm surge cleanup and water damage drying in Cape Coral and Southwest Florida.' }]
})
const total = OBRAS.reduce((n, o) => n + fotosDe(o).length, 0)
</script>

<template>
  <div>
    <section class="cabecera-pagina">
      <div class="envoltura rejilla">
        <div>
          <p class="antetitulo">Our work</p>
          <h1>Real jobs, photo by photo.</h1>
          <p class="entradilla">
            These are our own job-site photos, labels and arrows included: the same record your
            insurance adjuster receives. No stock photos.
          </p>
          <nav class="indice" aria-label="Jobs">
            <a v-for="o in OBRAS" :key="o.id" :href="`#${o.id}`">
              <span>{{ o.tipo }}</span>{{ o.titulo }}
            </a>
          </nav>
        </div>
        <figure class="kit">
          <img :src="KIT.src" :width="KIT.ancho" :height="KIT.alto" :alt="KIT.texto">
          <figcaption>{{ KIT.texto }}</figcaption>
        </figure>
      </div>
    </section>

    <ExpedienteObra v-for="o in OBRAS" :key="o.id" :obra="o" />

    <section class="seccion seccion--bruma">
      <div class="envoltura">
        <Contacto />
      </div>
    </section>
  </div>
</template>

<style scoped>
.cabecera-pagina { padding: 56px 0 24px; background: linear-gradient(180deg, var(--azul-suave), var(--blanco)); }
.rejilla { display: grid; gap: 32px; align-items: center; }
h1 { margin: 10px 0 14px; font-size: clamp(34px, 5vw, 56px); font-weight: 800; line-height: 1.08; letter-spacing: -.025em; max-width: 18ch; }
.indice { display: grid; gap: 8px; margin-top: 22px; }
.indice a {
  display: grid;
  gap: 2px;
  padding: 12px 16px;
  border: 1px solid var(--linea);
  border-radius: 14px;
  background: var(--blanco);
  color: var(--tinta);
  font-weight: 700;
  text-decoration: none;
  transition: border-color .2s var(--curva), translate .2s var(--curva);
}
.indice a:hover { border-color: #bcd3f2; translate: 4px 0; }
.indice span { font-size: 13px; font-weight: 600; color: var(--azul); }

/* El kit: una copia pequeña (la foto es pequeña), un poco girada */
.kit { justify-self: center; display: grid; gap: 10px; justify-items: center; margin: 0; max-width: 300px; text-align: center; }
.kit img {
  width: 200px;
  height: auto;
  padding: 8px 8px 22px;
  background: #fff;
  border-radius: 3px;
  box-shadow: 0 1px 2px rgba(15, 36, 64, .12), 0 12px 30px rgba(15, 36, 64, .16);
  rotate: -4deg;
}
.kit figcaption { font-size: 14px; color: var(--tinta-3); }

@media (min-width: 900px) {
  .cabecera-pagina { padding: 80px 0 32px; }
  .rejilla { grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr); gap: 56px; }
  .indice { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
</style>
