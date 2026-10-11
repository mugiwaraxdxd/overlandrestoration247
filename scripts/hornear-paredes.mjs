// Hornea las paredes en imágenes (public/paredes/), para que el móvil no calcule nada: el moho es un
// shader tan pesado que en una GPU de móvil cada dibujo tardaba segundos, el driver lo cortaba a
// medias (la pared salía en franjas y bloques) y la página se quedaba congelada esperándolo.
//  · hero-00 … hero-NN: la limpieza del hero de 0 a 1, para las pantallas táctiles (el ordenador la
//    pinta en vivo). Formato vertical; la web la recorta como «cover» y coloca el enchufe encima.
//  · noche-ancha / noche-alta: la pared de la linterna (no cambia nunca), para todos.
//   node scripts/hornear-paredes.mjs   (usa el Playwright de la carpeta de al lado: ../sazon)
import { createRequire } from 'node:module'
import { mkdirSync, writeFileSync } from 'node:fs'
import { GLSL_COMUN, GLSL_MOHO } from '../app/utils/glslComun.js'
import { VERTICES, FRAGMENTOS as FRAGMENTOS_HERO, CAPAS_HERO } from '../app/utils/paredDanada.js'
import { PARED_HERO, PAREDES_NOCHE } from '../app/utils/paredesHorneadas.js'

const require = createRequire(import.meta.url)
const { chromium } = require('../../sazon/node_modules/playwright')
const DESTINO = new URL('../public/paredes/', import.meta.url)

// La pared de la linterna, iluminada (la oscuridad y la luz las pone Canvas 2D en la web)
const FRAGMENTOS_NOCHE = `
${GLSL_COMUN}

uniform vec2 uRes;       // px de la imagen
uniform float uEscala;   // px de la imagen por px CSS

const float UNIDAD = 820.0;   // la escala del grano: la misma que la pared del hero
float gAncho;
float gPMoho;

// Cuánto moho hay: a trozos por toda la pared, más cargado en los bordes
float densidad(vec2 pos) {
  float x = pos.x * UNIDAD;
  float borde = min(x, gAncho - x);
  float D = 0.55 + 0.9 * exp(-borde / max(gAncho * 0.25, 180.0));
  D *= smoothstep(0.32, 0.7, noise(pos * 2.2 + 41.0) * 0.6 + noise(pos * 5.0 + 9.0) * 0.4);
  float islas = noise(pos * 3.2 + 3.0) * 0.6 + noise(pos * 8.0 + 9.0) * 0.4;
  return min(D * (0.3 + 1.3 * smoothstep(0.25, 0.78, islas)), 1.5);
}

${GLSL_MOHO}

// Cercos de agua, como en las tarjetas
vec3 pintarAgua(vec3 col, vec2 q) {
  float f = fbm(q * 2.4 + 17.0) * 0.7 + fbm(q * 6.0 + 3.0) * 0.3;
  float D = (f - 0.55) * 3.4 + (noise(q * 60.0) - 0.5) * 0.02;
  float dentro = smoothstep(-0.006, 0.006, D);
  float haciaBorde = dentro * (0.35 + 0.65 * (1.0 - smoothstep(0.0, 0.22, D)));
  float cerco = exp(-pow(D / 0.012, 2.0)) + exp(-pow((D - 0.05) / 0.008, 2.0)) * 0.45;
  col = mix(col, col * vec3(0.88, 0.82, 0.68), haciaBorde * 0.6);
  return mix(col, vec3(0.5, 0.38, 0.22), clamp(cerco, 0.0, 1.0) * 0.7);
}

void main() {
  vec2 v = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uEscala;
  gAncho = uRes.x / uEscala;
  vec2 q = v / UNIDAD;
  vec3 pared = vec3(0.929, 0.922, 0.902);
  pared += (fbm(q * 90.0) - 0.5) * 0.022;
  pared = pintarAgua(pared, q);
  float Dp = densidad(q);
  if (Dp > -0.45) pared = pintarMoho(pared, q, Dp, 1.0, 1.0);
  gl_FragColor = vec4(pared * vec3(1.0, 0.95, 0.84), 1.0);   // con el tono cálido de la linterna
}
`

// Lo que se hornea: { archivo, ancho, alto, fragmentos, uniformes }
const TRABAJOS = [
  ...Array.from({ length: PARED_HERO.cuadros }, (_, i) => ({
    archivo: PARED_HERO.archivo(i),
    ancho: PARED_HERO.ancho,
    alto: PARED_HERO.alto,
    fragmentos: FRAGMENTOS_HERO,
    uniformes: {
      uP: [i / (PARED_HERO.cuadros - 1)],
      uEnchufe: PARED_HERO.enchufe,
      uHollin: [CAPAS_HERO.hollin],
      uMoho: [CAPAS_HERO.moho],
      uAgua: [CAPAS_HERO.agua]
    }
  })),
  ...PAREDES_NOCHE.map(n => ({
    archivo: n.archivo,
    ancho: n.ancho,
    alto: n.alto,
    fragmentos: FRAGMENTOS_NOCHE,
    uniformes: { uEscala: [n.escala] }
  }))
]

const CALIDAD = 0.82

mkdirSync(DESTINO, { recursive: true })
const navegador = await chromium.launch({ args: ['--use-angle=gl', '--ignore-gpu-blocklist'] })
const pagina = await navegador.newPage()
let total = 0
for (const t of TRABAJOS) {
  const datos = await pagina.evaluate(async ({ t, VERTICES, CALIDAD }) => {
    const lienzo = document.createElement('canvas')
    lienzo.width = t.ancho
    lienzo.height = t.alto
    const gl = lienzo.getContext('webgl', { antialias: false, alpha: false, preserveDrawingBuffer: true })
    const programa = gl.createProgram()
    for (const [tipo, fuente] of [[gl.VERTEX_SHADER, VERTICES], [gl.FRAGMENT_SHADER, t.fragmentos]]) {
      const s = gl.createShader(tipo)
      gl.shaderSource(s, fuente)
      gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s))
      gl.attachShader(programa, s)
    }
    gl.linkProgram(programa)
    if (!gl.getProgramParameter(programa, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(programa))
    gl.useProgram(programa)
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW)
    const aPos = gl.getAttribLocation(programa, 'aPos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)
    gl.viewport(0, 0, t.ancho, t.alto)
    gl.uniform2f(gl.getUniformLocation(programa, 'uRes'), t.ancho, t.alto)
    for (const [nombre, v] of Object.entries(t.uniformes)) {
      const u = gl.getUniformLocation(programa, nombre)
      if (v.length === 1) gl.uniform1f(u, v[0])
      else gl.uniform2f(u, v[0], v[1])
    }
    gl.drawArrays(gl.TRIANGLES, 0, 6)
    const blob = await new Promise(ok => lienzo.toBlob(ok, 'image/webp', CALIDAD))
    const bytes = new Uint8Array(await blob.arrayBuffer())
    let bin = ''
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return btoa(bin)
  }, { t, VERTICES, CALIDAD })
  const buf = Buffer.from(datos, 'base64')
  writeFileSync(new URL(t.archivo.replace(/^\/paredes\//, ''), DESTINO), buf)
  total += buf.length
  console.log(t.archivo.padEnd(28), `${t.ancho}×${t.alto}`.padEnd(11), `${Math.round(buf.length / 1024)} KB`)
}
await navegador.close()
console.log(`total: ${Math.round(total / 1024)} KB`)
