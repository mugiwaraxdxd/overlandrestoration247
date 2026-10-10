// Saca de INFO_WEB_ACTUAL.md (el rastreo de su web) el contenido de las páginas de servicio y de
// zona, y lo deja en app/utils/contenidoWeb.json para las páginas nuevas.
// Uso: node scripts/extraer-contenido.mjs
import fs from 'node:fs'

const md = fs.readFileSync('INFO_WEB_ACTUAL.md', 'utf8')

// Las secciones del rastreo, por su ruta
const secciones = {}
let actual = null
for (const linea of md.split('\n')) {
  const m = linea.match(/^## (?:Servicio|Zona de servicio|Página): (\S+)/)
  if (m) { actual = m[1]; secciones[actual] = []; continue }
  if (linea.startsWith('**Imágenes')) { actual = null; continue }
  if (actual) secciones[actual].push(linea)
}

// El rastreo partió algunos párrafos en varias líneas («over 15» / «years…»): se juntan
function bloques(lineas) {
  const out = []
  for (const l of lineas.map(l => l.trim()).filter(Boolean)) {
    if (/^- (URL|Título|Meta)/.test(l) || l === '---') continue
    const previo = out[out.length - 1]
    const esTitulo = l.startsWith('#')
    if (previo && !esTitulo && !previo.startsWith('#') && !/[.!?:”"]$/.test(previo)) {
      out[out.length - 1] = `${previo} ${l}`.replace(/\s+/g, ' ')
    } else out.push(l)
  }
  return out
}

const limpio = (t) => t.replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim()
// En su web el nombre de la empresa iba aparte (un enlace) y el rastreo lo perdió: «has been providing…»
const conNombre = (t) => (/^[a-z]/.test(t) ? `Overland Restoration 24/7 ${t}` : t)
const titulo = (l) => limpio(l.replace(/^#+\s*/, ''))

// Una página de servicio: intro, «Our … Services», «Benefits …» y las preguntas
function servicio(ruta) {
  const b = bloques(secciones[ruta] || [])
  const meta = (secciones[ruta] || []).find(l => l.startsWith('- Meta descripción:'))
  const res = { ruta, meta: meta ? limpio(meta.replace('- Meta descripción:', '')) : '', intro: [], servicios: [], beneficios: [], cierre: [], preguntas: [] }
  let zona = null
  for (let i = 0; i < b.length; i++) {
    const l = b[i]
    if (l.startsWith('#')) {
      const t = titulo(l)
      if (/^Our .*Services?$/i.test(t) || /^Our .*(Restoration|Remediation|Removal|Cleanup|Services)/i.test(t)) { zona = 'servicios'; continue }
      if (/^Benefits/i.test(t)) { zona = 'beneficios'; continue }
      if (/Frequently Asked Questions|^HAPPY CUSTOMERS|^Find us|^INQUIRE|^Contact Us$/i.test(t)) { zona = /Frequently/i.test(t) ? 'preguntas' : null; continue }
      if (l.startsWith('######') && (zona === 'servicios' || zona === 'beneficios')) {
        res[zona].push({ titulo: t, texto: '' })
        continue
      }
      if (l.startsWith('#####') && t.endsWith('?')) {
        zona = 'preguntas'
        res.preguntas.push({ p: t, r: '' })
        continue
      }
      if (l.startsWith('#####')) { zona = 'cierre'; continue }
      if (l.startsWith('####') && zona === null && res.intro.length === 0) { zona = 'intro'; continue }
      continue
    }
    if (/^(Contact Us|Learn More|View More|Button)/.test(l)) continue
    const texto = limpio(l)
    if (zona === 'intro') res.intro.push(conNombre(texto))
    else if ((zona === 'servicios' || zona === 'beneficios') && res[zona].length) res[zona][res[zona].length - 1].texto += texto
    else if (zona === 'preguntas' && res.preguntas.length) res.preguntas[res.preguntas.length - 1].r += texto
    else if (zona === 'cierre') res.cierre.push(texto)
  }
  return res
}

// Las cuatro páginas de servicio nuevas y de qué páginas suyas salen
const HUBS = {
  'water-damage': '/water-damage-restoration',
  'fire-smoke': '/fire-damage-restoration',
  'storm-damage': '/storm-damage-restoration',
  'mold-remediation': '/mold-remediation-and-removal'
}
const servicios = {}
for (const [slug, ruta] of Object.entries(HUBS)) servicios[slug] = servicio(ruta)

// Cada uno de sus 21 servicios, de su propia página: título, resumen (la intro) y lo que incluye
const subservicios = {}
for (const ruta of Object.keys(secciones)) {
  if (ruta.startsWith('/service-area/') || ['/', '/faqs', '/gallery', '/areas-we-serve', '/contact-us', '/reviews'].includes(ruta)) continue
  const s = servicio(ruta)
  const t = (secciones[ruta] || []).find(l => l.startsWith('- Título'))
  const titulo = t ? limpio(t.replace('- Título (title):', '')).replace(/\s*\|.*$/, '') : ruta
  subservicios[ruta] = { titulo, intro: s.intro, puntos: s.servicios.map(x => ({ titulo: x.titulo, texto: x.texto })) }
}

// Las preguntas generales (su página /faqs)
const faqs = []
for (const l of bloques(secciones['/faqs'] || [])) {
  if (l.startsWith('#') && titulo(l).endsWith('?')) faqs.push({ p: titulo(l), r: '' })
  else if (!l.startsWith('#') && faqs.length) faqs[faqs.length - 1].r += limpio(l)
}

// Las páginas de zona: sus textos sobre la ciudad. Se salta el relleno que dejaron publicado
// («Lorem ipsum», «(Location)», «(Company Name)») y la frase «operates from <ciudad>» (está en Cape Coral)
function zona(ruta) {
  const b = bloques(secciones[ruta] || [])
  const res = { ruta, ciudad: '', intro: [], descubre: [], clima: [], retos: [], preguntas: [] }
  const t = (secciones[ruta] || []).find(l => l.startsWith('- Título'))
  res.ciudad = t ? limpio(t).replace(/^.* in /, '').replace(/, FL.*$/, '') : ''
  let parte = null
  for (const l of b) {
    if (/Lorem ipsum|\(Location\)|\(Company Name\)/.test(l)) { if (l.startsWith('#')) parte = 'nada'; continue }
    if (l.startsWith('#')) {
      const h = titulo(l)
      if (l.startsWith('###') && !l.startsWith('####')) parte = 'intro'
      else if (/^Discover/i.test(h)) parte = 'descubre'
      else if (/^Climate/i.test(h)) parte = 'clima'
      else if (/^Local Challenges/i.test(h)) parte = 'retos'
      else if (/^Hire Us/i.test(h)) parte = 'contratar'
      else parte = 'nada'
      continue
    }
    if (/^(- |Core Damage|Mold Remediation Services|Specialized|Structural Drying)/.test(l)) continue
    if (/operates from/i.test(l)) continue
    const texto = limpio(l)
    if (texto.endsWith('?')) { res.preguntas.push({ p: texto, r: '' }); parte = 'pregunta'; continue }
    if (parte === 'pregunta' && res.preguntas.length) { res.preguntas[res.preguntas.length - 1].r += texto; continue }
    if (res[parte] && res[parte].length < 3) res[parte].push(texto)
  }
  // Preguntas de la plantilla del constructor que también dejaron publicadas («What is an FAQ?»…)
  res.preguntas = res.preguntas.filter(q => !/FAQ/.test(q.p) && q.r)
  // «Discover» repite a veces el último párrafo de la intro
  res.intro = res.intro.filter(p => !res.descubre.includes(p))
  return res
}

const zonas = {}
for (const ruta of Object.keys(secciones).filter(r => r.startsWith('/service-area/'))) {
  const z = zona(ruta)
  const slug = z.ciudad.toLowerCase().replace(/\s+/g, '-')
  if (slug) zonas[slug] = z
}

fs.writeFileSync('app/utils/contenidoWeb.json', JSON.stringify({ servicios, subservicios, faqs, zonas }, null, 2))
for (const [k, z] of Object.entries(zonas)) console.log('zona', k, '· intro', z.intro.length, '· clima', z.clima.length, '· retos', z.retos.length, '· preguntas', z.preguntas.length)
for (const [k, s] of Object.entries(servicios)) {
  console.log(k, '· intro', s.intro.length, '· servicios', s.servicios.length, '· beneficios', s.beneficios.length, '· preguntas', s.preguntas.length)
}
console.log('faqs', faqs.length)
