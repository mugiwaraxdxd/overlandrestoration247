<script setup>
import { RESENAS, TOTAL_RESENAS, NOTA_MEDIA, POR_PLATAFORMA, TIPOS_RESENA, ENLACES_RESENAS } from '~/utils/resenas'

// Sus reseñas reales, todas (las que traen texto), filtrables por el trabajo que cuentan
useHead({
  title: 'Reviews',
  meta: [{ name: 'description', content: `Read ${TOTAL_RESENAS} reviews of Overland Restoration 24/7: water damage, mold remediation, fire and storm restoration in Cape Coral and Southwest Florida.` }]
})

const filtro = ref('todas')
const FILTROS = [
  { id: 'todas', nombre: 'All', icono: null, cuantas: RESENAS.length },
  ...TIPOS_RESENA.map(t => ({ ...t, cuantas: RESENAS.filter(r => r.tipos.includes(t.id)).length })).filter(t => t.cuantas)
]
const vistas = computed(() => (filtro.value === 'todas' ? RESENAS : RESENAS.filter(r => r.tipos.includes(filtro.value))))
const soloFotos = TOTAL_RESENAS - RESENAS.length
const plataformas = Object.entries(POR_PLATAFORMA).map(([p, n]) => `${n} on ${p}`).join(' · ')
</script>

<template>
  <div>
    <section class="cabecera-pagina">
      <div class="envoltura rejilla">
        <div>
          <p class="antetitulo">Reviews</p>
          <h1>What our customers say.</h1>
          <p class="entradilla">
            Every review here is real and public on Google or Yelp, exactly as the customer wrote it.
            Most of them are about Danny, the owner, who works directly with every customer.
          </p>
        </div>
        <div class="nota">
          <b class="cifra">{{ NOTA_MEDIA.toFixed(1) }}</b>
          <EstrellasAgua :nota="NOTA_MEDIA" class="estrellas-grandes" />
          <p>{{ TOTAL_RESENAS }} reviews · {{ plataformas }}</p>
          <div class="botones">
            <a class="btn-sec" :href="ENLACES_RESENAS.google" target="_blank" rel="noopener">See them on Google</a>
            <a class="btn-sec" :href="ENLACES_RESENAS.escribir" target="_blank" rel="noopener">Leave a review</a>
          </div>
        </div>
      </div>
    </section>

    <section class="seccion muro-seccion">
      <div class="envoltura">
        <div class="filtros" role="group" aria-label="Filter reviews by job">
          <button
            v-for="f in FILTROS" :key="f.id" type="button" class="filtro"
            :class="{ activo: filtro === f.id }" :aria-pressed="filtro === f.id" @click="filtro = f.id"
          >
            <Icono v-if="f.icono" :nombre="f.icono" />{{ f.nombre }}<span class="cuantas">{{ f.cuantas }}</span>
          </button>
        </div>

        <TransitionGroup tag="div" name="resena" class="muro">
          <ResenaTarjeta v-for="r in vistas" :key="r.id" :resena="r" />
        </TransitionGroup>

        <p v-if="soloFotos > 0" class="nota-fotos">
          {{ soloFotos }} more five-star reviews have photos only:
          <a :href="ENLACES_RESENAS.google" target="_blank" rel="noopener">see them on Google</a>.
          Also on <a :href="ENLACES_RESENAS.yelp" target="_blank" rel="noopener">Yelp</a>.
        </p>
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
.cabecera-pagina { padding: 56px 0 40px; background: linear-gradient(180deg, var(--azul-suave), var(--blanco)); }
.rejilla { display: grid; gap: 32px; align-items: end; }
h1 { margin: 10px 0 14px; font-size: clamp(34px, 5vw, 56px); font-weight: 800; line-height: 1.08; letter-spacing: -.025em; max-width: 18ch; }
.muro-seccion { padding-top: 24px; }
.nota { display: grid; gap: 10px; justify-items: start; }
.cifra { font-size: clamp(64px, 8vw, 96px); font-weight: 800; line-height: .9; letter-spacing: -.04em; color: var(--tinta); }
.estrellas-grandes { font-size: 34px; }
.nota p { font-size: 15px; color: var(--tinta-3); }
.botones { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 6px; }

.filtros { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 28px; }
.filtro {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 42px;
  padding: 0 14px;
  border: 1px solid var(--linea);
  border-radius: var(--pildora);
  background: var(--blanco);
  color: var(--tinta);
  font: inherit;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color .2s var(--curva), border-color .2s var(--curva), color .2s var(--curva);
}
.filtro svg { width: 18px; height: 18px; flex: none; color: var(--azul); }
.cuantas { font-size: 13px; color: var(--tinta-3); }
.filtro.activo { background: var(--tinta); border-color: var(--tinta); color: #fff; }
.filtro.activo svg, .filtro.activo .cuantas { color: #cfe0f5; }

/* El muro: columnas como un tablón (cada tarjeta, su alto) */
.muro { columns: 1; column-gap: 18px; }
.muro > * { margin-bottom: 18px; }
.resena-enter-active, .resena-leave-active { transition: opacity .3s var(--curva), transform .3s var(--curva); }
.resena-enter-from, .resena-leave-to { opacity: 0; transform: translateY(10px); }
.resena-leave-active { display: none; }

.nota-fotos { margin-top: 12px; font-size: 15px; color: var(--tinta-3); }
.nota-fotos a { color: var(--azul); font-weight: 600; }

@media (min-width: 700px) { .muro { columns: 2; } }
@media (min-width: 1100px) { .muro { columns: 3; } }
@media (min-width: 900px) {
  .cabecera-pagina { padding: 80px 0 56px; }
  .rejilla { grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr); gap: 56px; }
  .nota { justify-items: end; text-align: right; }
  .botones { justify-content: flex-end; }
}
</style>
