// Saca sus reseñas reales del widget de Trustindex que tiene su web en /reviews (las de Google y
// Yelp) y las guarda tal cual en app/utils/resenasWeb.json: nombre, fecha, plataforma, estrellas,
// texto y cuántas fotos trae. Volver a correrlo cuando entren reseñas nuevas:
//   node scripts/extraer-resenas.mjs
import { writeFileSync } from 'node:fs'

const WIDGET = '733322862625399b1a86caceda7'   // el de https://www.overlandrestoration247.com/reviews
const ORIGEN = `https://cdn.trustindex.io/widgets/${WIDGET.slice(0, 2)}/${WIDGET}/content.html`

const ENTIDADES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }
const texto = (html) => html
  .replace(/<br\s*\/?>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&(#x?[0-9a-f]+|\w+);/gi, (m, e) => {
    if (e[0] === '#') return String.fromCodePoint(e[1] === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10))
    return ENTIDADES[e] ?? m
  })
  .replace(/\s+/g, ' ')
  .trim()

const res = await fetch(ORIGEN, { headers: { 'User-Agent': 'Mozilla/5.0' } })
if (!res.ok) throw new Error(`Trustindex respondió ${res.status}`)
const html = await res.text()

const total = Number((html.match(/(\d+)\s+reviews/) || [])[1]) || null
const resenas = html.split(/<div[^>]*class="ti-review-item/).slice(1).map((it) => {
  const uno = (re) => { const m = it.match(re); return m ? texto(m[1]) : '' }
  const ts = Number((it.match(/data-time="(\d+)"/) || [])[1]) || null
  const plataforma = (it.match(/platform-icon[^>]*?(?:alt|title)="([^"]+)"/) || it.match(/\/platform\/([A-Za-z]+)/) || [])[1] || ''
  const cuerpo = uno(/class="ti-review-content"[^>]*>([\s\S]*?)<\/div>/)
  const fotos = (it.match(/class="ti-review-image/g) || []).length
  return {
    nombre: uno(/class="ti-name"[^>]*>([\s\S]*?)<\/div>/),
    fecha: ts ? new Date(ts * 1000).toISOString().slice(0, 10) : null,
    plataforma,
    estrellas: (it.match(/class="ti-star f/g) || []).length,
    // las que solo traen fotos dejan aquí «+N» (las fotos que no caben): sin texto
    texto: /^\+\d+$/.test(cuerpo) ? '' : cuerpo,
    fotos
  }
})

const salida = {
  fuente: `Trustindex (widget de su web /reviews), ${ORIGEN}`,
  extraido: new Date().toISOString().slice(0, 10),
  total: total ?? resenas.length,
  resenas
}
writeFileSync(new URL('../app/utils/resenasWeb.json', import.meta.url), JSON.stringify(salida, null, 2) + '\n')
console.log(`${resenas.length} reseñas (${resenas.filter(r => r.texto).length} con texto); total del widget: ${salida.total}`)
