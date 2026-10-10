// La landing empieza siempre arriba: el hero se limpia con el scroll y tiene que verse desde el
// principio. Sin esto, al recargar, el navegador volvía a donde estabas o saltaba al ancla de la
// dirección (#fotos, en el formulario del final, justo encima del pie).
// Los enlaces internos (#servicios, #fotos…) se desplazan suavemente sin dejar el # en la dirección.
export default defineNuxtPlugin(() => {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
  if (location.hash) history.replaceState(null, '', location.pathname + location.search)
  window.scrollTo(0, 0)

  document.addEventListener('click', (e) => {
    const enlace = e.target.closest?.('a[href^="#"]')
    if (!enlace) return
    const id = enlace.getAttribute('href').slice(1)
    e.preventDefault()
    if (!id) return
    const destino = document.getElementById(id)
    if (!destino) return
    const cabecera = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--alto-cabecera')) || 0
    const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: destino.getBoundingClientRect().top + window.scrollY - cabecera, behavior: reducido ? 'auto' : 'smooth' })
  })
})
