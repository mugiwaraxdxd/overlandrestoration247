// Sus reseñas reales (Google y Yelp), tal cual las enseña el widget de su web: las saca
// scripts/extraer-resenas.mjs a resenasWeb.json. Aquí solo se ordenan: el tipo de trabajo (para
// filtrar), la frase que se subraya de cada una y las citas que acompañan a cada promesa de la web.
// Las frases son literales: si alguna no está en su reseña, no se subraya nada (y no se inventa).
import web from './resenasWeb.json'

export const ENLACES_RESENAS = {
  google: 'https://www.google.com/maps/place/Overland+Restoration+24%2F7/@26.5087155,-81.9581925,248974m/data=!3m2!1e3!4b1!4m6!3m5!1s0xa99b8874e1be6fd1:0xa7f6869f5cb4a852!8m2!3d26.5087155!4d-81.9581925!16s%2Fg%2F11w1pvqjys?entry=ttu',
  escribir: 'https://search.google.com/local/writereview?placeid=ChIJ0W--4XSIm6kRUqi0XJ-G9qc',
  yelp: 'https://yelp.com/biz/overland-restoration-24-7-cape-coral'
}

// La frase de cada una que se subraya (literal)
const FRASES = {
  'Amy Dawes': 'From the first phone call to the final walkthrough, their team was professional, prompt, super knowledgeable, and very reassuring.',
  'Karen & Steve McClarren': 'When I called, Danny answered the phone immediately.',
  'Kathy Forrester': 'Danny operates his business with integrity.',
  'Joshua Foree': 'Provided a picture report of the project from start to finish.',
  'Dianna Rioli': 'He made a very unnerving mold situation feel manageable and all of us safe again !',
  'Stanley Dyck': 'None surpasses Danny for expertise, integrity, responsiveness, clear communication, passion for doing the job right',
  'Darin Docken': 'he kept us informed every step of the way with clear and consistent communication.',
  'Nancy Fansler': 'always came to work with a smile and told me it was going to be ok.',
  'Kathy Noble': 'I don’t think you could go wrong by hiring Danny and his team!',
  'Jane N': 'To see the results is to see a new house',
  'Celia DePaolis': 'Our home was left extremely clean and it passed testing with flying colors.',
  'Sharon Nelson': 'He gave us the right papers we needed for insurance.',
  'jackie tingle': 'he worked the weekend when others would not',
  'Judith Phillips': 'He is thorough and left everything in tip/top shape.',
  'Steven Twerion': 'He kept in constant communication and did really good work.',
  'Robert Castellucci': 'He went above and beyond.',
  'Andre LaBau': 'The absolute best and most reliable company I’ve ever worked with!',
  'leslie izzo': 'He handled everything for us through emails and over the phone !!!',
  'Joshua Coman': 'Danny and his team were professional, efficient, and very knowledgeable',
  'Mark Fischer': 'There were some water damage issues that had to be mitigated immediately in order to close on property',
  'Peter Meyer': 'The home was left immaculate.',
  'Julianne R.': 'If you need help, call Danny Labau today.'
}

// El tipo de trabajo, por lo que cuenta cada una (las que no lo dicen, solo en «All»)
export const TIPOS_RESENA = [
  { id: 'moho', nombre: 'Mold', icono: 'moho', re: /mold|microbial/i },
  { id: 'agua', nombre: 'Water', icono: 'agua', re: /\bwater\b(?!front)|leak|flood/i },
  { id: 'fuego', nombre: 'Fire', icono: 'fuego', re: /\bfire\b|smoke/i },
  { id: 'tormenta', nombre: 'Storm', icono: 'tormenta', re: /hurricane|storm|\bIan\b/i }
]

// «jackie tingle» → «Jackie Tingle» (solo la mayúscula inicial; el nombre, el suyo)
const nombreVisible = (n) => n.replace(/(^|[\s'-])([a-z])/g, (m, a, b) => a + b.toUpperCase())

const mes = (fecha) => new Date(`${fecha}T12:00:00Z`).toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })

export const RESENAS = web.resenas
  .filter(r => r.texto)
  .map((r, i) => {
    const frase = FRASES[r.nombre]
    return {
      id: `resena-${i + 1}`,
      nombre: nombreVisible(r.nombre),
      fecha: r.fecha,
      mes: mes(r.fecha),
      plataforma: r.plataforma,
      estrellas: r.estrellas,
      texto: r.texto,
      frase: frase && r.texto.includes(frase) ? frase : null,
      tipos: TIPOS_RESENA.filter(t => t.re.test(r.texto)).map(t => t.id)
    }
  })

export const TOTAL_RESENAS = web.total
export const NOTA_MEDIA = Math.round((web.resenas.reduce((s, r) => s + r.estrellas, 0) / web.resenas.length) * 10) / 10
export const POR_PLATAFORMA = web.resenas.reduce((n, r) => ({ ...n, [r.plataforma]: (n[r.plataforma] || 0) + 1 }), {})

// Una cita de una reseña: su frase subrayada u otra suya (literal; si no está, ninguna)
const cita = (nombre, texto = null) => {
  const r = RESENAS.find(x => x.nombre === nombreVisible(nombre))
  const t = texto ?? r?.frase
  return r && t && r.texto.includes(t) ? { texto: t, nombre: r.nombre, plataforma: r.plataforma, mes: r.mes } : null
}

// Lo que dicen, junto a lo que prometemos
export const CITAS = {
  llamada: cita('Karen & Steve McClarren'),
  fotos: cita('Joshua Foree'),
  prueba: cita('Celia DePaolis'),
  seguro: cita('Sharon Nelson'),
  integridad: cita('Kathy Forrester'),
  precio: cita('Dianna Rioli', 'he wasn’t the cheapest or most expensive he was absolutely fair !'),
  dueno: cita('Karen & Steve McClarren', 'He is a small company and does the work himself with a small crew.'),
  atajos: cita('Celia DePaolis', 'He truly went above and beyond running the machines longer and doing extra work outside the original scope just to be helpful.')
}
