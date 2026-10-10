// La portada empieza siempre arriba: el hero se limpia con el scroll y tiene que verse desde el
// principio (sin esto, al recargar, el navegador volvía a donde estabas o saltaba al ancla).
// En las demás páginas, el ancla manda (/contact#fotos baja al formulario).
// Los enlaces internos de la misma página (#fotos…) se desplazan suavemente sin dejar el # en la dirección.
export default defineNuxtPlugin(() => {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
  if (location.pathname === '/') {
    if (location.hash) history.replaceState(null, '', location.pathname + location.search)
    window.scrollTo(0, 0)
  }

  document.addEventListener('click', (e) => {
    const enlace = e.target.closest?.('a[href]')
    if (!enlace) return
    const url = new URL(enlace.href, location.href)
    if (url.pathname !== location.pathname || !url.hash) return
    const destino = document.getElementById(url.hash.slice(1))
    if (!destino) return
    e.preventDefault()
    const cabecera = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--alto-cabecera')) || 0
    const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: destino.getBoundingClientRect().top + window.scrollY - cabecera - 16, behavior: reducido ? 'auto' : 'smooth' })
  }, true)
})
