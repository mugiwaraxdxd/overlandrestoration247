// v-aparecer: el bloque entra (sube un poco y aparece) la primera vez que se ve.
// Con «v-aparecer="120"», con ese retraso en ms. Sin IntersectionObserver o con
// movimiento reducido, se ve directamente.
// El elemento lleva la clase «aparece» escrita en la plantilla (así el servidor y el
// cliente la tienen igual y no hay avisos de hidratación); aquí solo se le pone «visto».
export default defineNuxtPlugin((nuxtApp) => {
  let observador = null

  nuxtApp.vueApp.directive('aparecer', {
    getSSRProps: () => ({}),
    mounted(el, { value }) {
      if (value) el.style.setProperty('--retraso-aparecer', `${value}ms`)
      const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reducido || !('IntersectionObserver' in window)) {
        el.classList.add('visto')
        return
      }
      observador ??= new IntersectionObserver((entradas) => {
        for (const e of entradas) {
          if (e.isIntersecting) {
            e.target.classList.add('visto')
            observador.unobserve(e.target)
          }
        }
      }, { rootMargin: '0px 0px -12% 0px' })
      observador.observe(el)
    },
    unmounted(el) {
      observador?.unobserve(el)
    }
  })
})
