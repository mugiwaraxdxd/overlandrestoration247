// La pared de la sección de noche: la misma pared, a oscuras, y una linterna que descubre lo que hay
// (cercos de agua y moho).
// Rendimiento: la pared no cambia nunca, solo la luz. Así que se calcula UNA vez con WebGL (el moho
// es caro) y se guarda como imagen; cada fotograma, Canvas 2D dibuja esa imagen y encima la
// oscuridad con un hueco de luz (dos rellenos con degradado: casi gratis, también en el móvil).
// Antes se recalculaba el shader en cada fotograma y en un móvil iba a 2 fps.
import { GLSL_COMUN, GLSL_MOHO } from './glslComun'
import { VERTICES } from './paredDanada'
import { enlazarPrograma } from './webgl'

const FRAGMENTOS = `
${GLSL_COMUN}

uniform vec2 uRes;       // px del lienzo
uniform float uEscala;   // px del lienzo por px CSS

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

// La pared entera, iluminada (la oscuridad y la luz las pone Canvas 2D)
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

// Pinta la pared una vez, a «escala» px por px CSS, en un lienzo 2D aparte. Promesa; null sin WebGL
async function pintarMuro(anchoCss, altoCss, escala) {
  const gl = document.createElement('canvas').getContext('webgl', { antialias: false, alpha: false, preserveDrawingBuffer: true })
  if (!gl) return null
  const lienzoGl = gl.canvas
  let programa
  try {
    programa = await enlazarPrograma(gl, VERTICES, FRAGMENTOS)
  } catch (e) {
    console.warn('[pared de noche] sin shader:', e)
    return null
  }
  lienzoGl.width = Math.max(1, Math.round(anchoCss * escala))
  lienzoGl.height = Math.max(1, Math.round(altoCss * escala))
  gl.useProgram(programa)
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW)
  const aPos = gl.getAttribLocation(programa, 'aPos')
  gl.enableVertexAttribArray(aPos)
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)
  gl.viewport(0, 0, lienzoGl.width, lienzoGl.height)
  gl.uniform2f(gl.getUniformLocation(programa, 'uRes'), lienzoGl.width, lienzoGl.height)
  gl.uniform1f(gl.getUniformLocation(programa, 'uEscala'), escala)
  gl.drawArrays(gl.TRIANGLES, 0, 6)

  const muro = document.createElement('canvas')
  muro.width = lienzoGl.width
  muro.height = lienzoGl.height
  muro.getContext('2d').drawImage(lienzoGl, 0, 0)
  gl.deleteBuffer(buffer)
  gl.deleteProgram(programa)
  gl.getExtension('WEBGL_lose_context')?.loseContext()
  return muro
}

const OSCURO = [11, 13, 16]

// Promesa con { medir, dibujar, destruir } cuando la pared está pintada; null sin WebGL (entonces la
// sección es negra, sin linterna)
export async function crearParedNoche(canvas) {
  const ctx = canvas.getContext('2d', { alpha: false })
  if (!ctx) return null
  let muro = null
  let anchoCss = 0
  let altoCss = 0
  let escala = 1
  let pintando = null

  // la pared solo se rehace si cambia de tamaño de verdad (no por la barra del navegador del móvil);
  // a 1,25 px por px CSS: el grano se ve bien y en un móvil se pinta en un momento, una sola vez
  function rehacerMuro(a, h) {
    anchoCss = a
    altoCss = h
    const turno = (pintando = pintarMuro(a, h, Math.min(window.devicePixelRatio || 1, 1.25)))
    return turno.then((m) => { if (pintando === turno && m) muro = m })
  }

  function medir() {
    escala = Math.min(window.devicePixelRatio || 1, 2)
    const a = Math.max(1, canvas.clientWidth)
    const h = Math.max(1, canvas.clientHeight)
    canvas.width = Math.round(a * escala)
    canvas.height = Math.round(h * escala)
    // mientras se rehace, la de antes estirada
    if (Math.abs(a - anchoCss) > 2 || Math.abs(h - altoCss) > 60) rehacerMuro(a, h)
  }

  // luz: { x, y, radio } en px CSS de la sección
  function dibujar(luz) {
    const w = canvas.width
    const h = canvas.height
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    if (muro) ctx.drawImage(muro, 0, 0, w, h)
    else {
      ctx.fillStyle = `rgb(${OSCURO})`
      ctx.fillRect(0, 0, w, h)
      return
    }
    const x = luz.x * escala
    const y = luz.y * escala
    const r = luz.radio * escala
    // la oscuridad, con un hueco de luz que se apaga hacia el borde
    const g = ctx.createRadialGradient(x, y, r * 0.15, x, y, r)
    g.addColorStop(0, `rgba(${OSCURO}, 0)`)
    g.addColorStop(0.55, `rgba(${OSCURO}, .18)`)
    g.addColorStop(1, `rgba(${OSCURO}, 1)`)
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
    // el aro de la linterna
    ctx.strokeStyle = 'rgba(255, 238, 205, .06)'
    ctx.lineWidth = r * 0.12
    ctx.beginPath()
    ctx.arc(x, y, r * 0.8, 0, Math.PI * 2)
    ctx.stroke()
  }

  function destruir() {
    muro = null
  }

  escala = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = Math.round(Math.max(1, canvas.clientWidth) * escala)
  canvas.height = Math.round(Math.max(1, canvas.clientHeight) * escala)
  await rehacerMuro(Math.max(1, canvas.clientWidth), Math.max(1, canvas.clientHeight))
  if (!muro) return null
  return { medir, dibujar, destruir }
}
