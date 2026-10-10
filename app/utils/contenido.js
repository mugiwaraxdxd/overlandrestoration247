// El contenido de la web: todo sale de su web actual (INFO_WEB_ACTUAL.md → contenidoWeb.json con
// scripts/extraer-contenido.mjs). Aquí solo se ordena: cuatro servicios en el orden de su web
// (agua, fuego, tormenta y luego moho), con sus subservicios agrupados como en su menú.
import web from './contenidoWeb.json'

export const SERVICIOS = [
  {
    slug: 'water-damage',
    nombre: 'Water damage',
    titulo: 'Water damage restoration',
    icono: 'agua',
    corto: 'Leaks, burst pipes and floods. Extraction and structural drying, started within hours.',
    sub: ['Emergency water extraction', 'Structural drying & dehumidification', 'Flood damage repair & cleanup', 'Sewage backup & cleanup', 'Water intrusion restoration', 'Content cleaning & pack-out'],
    antiguas: ['/water-damage-restoration', '/flood-damage-repair-and-cleanup', '/sewage-backup-and-cleanup', '/structural-drying-and-repairs', '/water-intrusion-restoration', '/content-cleaning-and-pack-out-services']
  },
  {
    slug: 'fire-smoke',
    nombre: 'Fire & smoke',
    titulo: 'Fire & smoke damage restoration',
    icono: 'fuego',
    corto: 'Soot and smoke removal, odor treatment, board-up and the rebuild after it.',
    sub: ['Fire damage restoration', 'Smoke & soot clean-up', 'Odor removal & deodorization', 'Board-up & tarping', 'Reconstruction & repair'],
    antiguas: ['/fire-damage-restoration', '/smoke-and-soot-clean-up', '/odor-removal-and-deodorization', '/reconstruction-and-repair-services']
  },
  {
    slug: 'storm-damage',
    nombre: 'Storm',
    titulo: 'Storm & hurricane damage restoration',
    icono: 'tormenta',
    corto: 'Hurricane, wind and hail. Tarping first, then everything the storm reached.',
    sub: ['Storm damage restoration', 'Hail & wind damage', 'Emergency board-up & tarping', 'Commercial large loss', 'Structural & property services', '24/7 emergency response'],
    antiguas: ['/storm-damage-restoration', '/hail-and-wind-damage-restoration', '/board-up-and-tarping-services', '/commercial-large-loss-restoration', '/structural-and-property-services', '/emergency-24/7-response-services']
  },
  {
    slug: 'mold-remediation',
    nombre: 'Mold',
    titulo: 'Mold remediation & removal',
    icono: 'moho',
    corto: 'Testing, containment and removal by a Florida licensed mold remediator.',
    sub: ['Mold inspection & testing', 'Containment & air filtration', 'Professional mold removal', 'Sanitization & disinfection', 'Post-remediation clearance testing'],
    antiguas: ['/mold-remediation-and-removal', '/mold-inspection-and-testing', '/containment-and-air-filtration', '/professional-mold-removal', '/sanitization-and-disinfection-treatments', '/post-remediation-verification-and-clearance-testing']
  }
].map(s => ({
  ...s,
  web: web.servicios[s.slug],
  // Su catálogo: cada página de servicio de su web que cae en este grupo (con su texto)
  catalogo: s.antiguas
    .filter(r => web.subservicios[r]?.intro?.length)
    .map(r => ({ ruta: r, ancla: anclaDe(r), ...web.subservicios[r] }))
}))

// El ancla de un servicio de su web dentro de la página de su grupo («/emergency-24/7-…» → «emergency-24-7-…»)
export function anclaDe(ruta) {
  return ruta.replace(/^\//, '').replace(/\//g, '-')
}

// Cuántos servicios suyos hay en total (los de su web)
export const TOTAL_SERVICIOS = SERVICIOS.reduce((n, s) => n + s.catalogo.length, 0)

export const servicioDe = (slug) => SERVICIOS.find(s => s.slug === slug)

// Las zonas: las 11 de su lista y las 4 que tienen página propia en su web
const NOMBRES_ZONAS = ['Cape Coral', 'Fort Myers', 'Lehigh Acres', 'North Fort Myers', 'Bonita Springs', 'Estero', 'San Carlos Park', 'Iona', 'Villas', 'Cypress Lake', 'Fort Myers Beach', 'Naples', 'Bonita Beach', 'Sanibel', 'Marco Island']
export const ZONAS = NOMBRES_ZONAS.map((nombre, i) => {
  const slug = nombre.toLowerCase().replace(/\s+/g, '-')
  return { nombre, slug, base: i === 0, web: web.zonas[slug] || null }
})
export const zonaDe = (slug) => ZONAS.find(z => z.slug === slug)

// Cómo trabajan (de lo que cuentan en sus páginas de agua y de moho)
export const PASOS = [
  { icono: 'telefono', titulo: 'You call, the owner answers', texto: 'Day or night. You get what to do right now, before we even arrive.' },
  { icono: 'buscar', titulo: 'We find all the damage', texto: 'Moisture meters and thermal imaging map what is hiding behind walls and under floors.' },
  { icono: 'escudo', titulo: 'Extraction & containment', texto: 'Standing water out; for mold, the area sealed off and the air filtered so spores don\'t travel.' },
  { icono: 'aire', titulo: 'Drying & cleaning', texto: 'Industrial air movers and dehumidifiers dry the structure; surfaces cleaned and sanitized.' },
  { icono: 'casa', titulo: 'Repairs & final check', texto: 'We rebuild what had to come out and verify the result. Then it\'s like it never happened.' }
]

// Por qué ellos («Why choose us?» de su portada, con sus palabras)
export const VALORES = [
  { icono: 'escudo', titulo: 'Integrity-driven service', texto: 'We do the right thing every time, even when no one is watching. Honesty and transparency with every homeowner and property manager.' },
  { icono: 'check', titulo: 'No shortcuts, ever', texto: 'We never rush a job or cut corners to save time or cost. Every project is done thoroughly and correctly.' },
  { icono: 'etiqueta', titulo: 'Straightforward pricing', texto: 'Fair, honest and explained from the start. No hidden fees, no surprise charges.' },
  { icono: 'persona', titulo: 'Owner-direct service', texto: 'The owner works directly with every customer, start to finish. One person accountable for your job.' }
]

// Lo que documentan para el seguro
export const SEGURO = [
  { icono: 'camara', titulo: 'Photos of every step', texto: 'Before, during and after. The adjuster sees exactly what was there and what was done.' },
  { icono: 'medidor', titulo: 'Moisture readings', texto: 'Readings and moisture mapping, day by day until it is dry. Numbers, not opinions.' },
  { icono: 'documento', titulo: 'A clear, detailed report', texto: 'The scope of work, the damage and the cause, written so your claim moves without delays.' }
]

// Las preguntas generales (su página /faqs)
export const PREGUNTAS = web.faqs
