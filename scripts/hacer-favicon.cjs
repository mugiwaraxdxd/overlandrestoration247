// Los favicons, de la R de su logo (public/logo/simbolo.png), centrada en un cuadrado:
// transparentes para la pestaña (16, 32 y 48 → favicon.ico, y el de 32 suelto) y sobre la placa
// negra en la que está hecho el logo para el icono del iPhone (180), que no admite transparencia.
//   node scripts/hacer-favicon.cjs   (usa el Playwright de la carpeta de al lado: ../sazon)
const { chromium } = require('../../sazon/node_modules/playwright')
const fs = require('fs')
const path = require('path')

const PUBLICO = path.join(__dirname, '..', 'public')
const simbolo = 'data:image/png;base64,' + fs.readFileSync(path.join(PUBLICO, 'logo', 'simbolo.png')).toString('base64')

// tamaño, margen (fracción) y fondo
const ICONOS = [
  { nombre: 'favicon-16.png', lado: 16, margen: 0, fondo: null },
  { nombre: 'favicon-32.png', lado: 32, margen: 0, fondo: null },
  { nombre: 'favicon-48.png', lado: 48, margen: 0.02, fondo: null },
  { nombre: 'apple-touch-icon.png', lado: 180, margen: 0.14, fondo: '#000000' }
]

;(async () => {
  const b = await chromium.launch()
  const p = await b.newPage()
  const pngs = await p.evaluate(async ({ simbolo, ICONOS }) => {
    const img = new Image()
    img.src = simbolo
    await img.decode()
    return ICONOS.map(({ nombre, lado, margen, fondo }) => {
      const c = document.createElement('canvas')
      c.width = c.height = lado
      const ctx = c.getContext('2d')
      ctx.imageSmoothingQuality = 'high'
      if (fondo) { ctx.fillStyle = fondo; ctx.fillRect(0, 0, lado, lado) }
      const caja = lado * (1 - 2 * margen)
      const k = Math.min(caja / img.width, caja / img.height)
      const w = img.width * k
      const h = img.height * k
      ctx.drawImage(img, (lado - w) / 2, (lado - h) / 2, w, h)
      return { nombre, datos: c.toDataURL('image/png').split(',')[1] }
    })
  }, { simbolo, ICONOS })
  await b.close()

  const archivos = {}
  for (const { nombre, datos } of pngs) {
    archivos[nombre] = Buffer.from(datos, 'base64')
    if (!nombre.startsWith('favicon-')) fs.writeFileSync(path.join(PUBLICO, nombre), archivos[nombre])
  }

  // favicon.ico con los PNG de 16, 32 y 48 dentro (el formato ICO admite PNG tal cual)
  const dentro = [16, 32, 48].map(l => ({ lado: l, png: archivos[`favicon-${l}.png`] }))
  const cabecera = Buffer.alloc(6)
  cabecera.writeUInt16LE(0, 0)
  cabecera.writeUInt16LE(1, 2)
  cabecera.writeUInt16LE(dentro.length, 4)
  let desplazamiento = 6 + 16 * dentro.length
  const entradas = dentro.map(({ lado, png }) => {
    const e = Buffer.alloc(16)
    e.writeUInt8(lado, 0)
    e.writeUInt8(lado, 1)
    e.writeUInt16LE(1, 4)
    e.writeUInt16LE(32, 6)
    e.writeUInt32LE(png.length, 8)
    e.writeUInt32LE(desplazamiento, 12)
    desplazamiento += png.length
    return e
  })
  fs.writeFileSync(path.join(PUBLICO, 'favicon.ico'), Buffer.concat([cabecera, ...entradas, ...dentro.map(d => d.png)]))
  fs.writeFileSync(path.join(PUBLICO, 'favicon-32.png'), archivos['favicon-32.png'])
  console.log('favicon.ico, favicon-32.png, apple-touch-icon.png')
})()
