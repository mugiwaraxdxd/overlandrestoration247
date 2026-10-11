// La pared dañada del hero: todo lo que limpia Overland, generado (WebGL 1, sin librerías).
// Capas (cada una con su peso, 0 = no está): hollín que baja del techo, moho alrededor del enchufe
// y a ras del zócalo y agua que sube del suelo.
// `dibujar(p)` la pinta con la limpieza en `p` (0 = como la encontramos, 1 = restaurada):
// el hollín se va primero, el moho se retira de los bordes a los núcleos y el agua baja al secarse.

import { GLSL_COMUN, GLSL_MOHO } from './glslComun.js'
import { enlazarPrograma } from './webgl.js'

export const VERTICES = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`

// También lo usa scripts/hornear-paredes.mjs (las fotos de la pared para los móviles)
export const FRAGMENTOS = `
${GLSL_COMUN}

uniform vec2 uRes;
uniform float uP;
uniform vec2 uEnchufe;   // centro del enchufe, en 0..1 con y hacia arriba
uniform float uHollin;   // peso de cada capa
uniform float uMoho;
uniform float uAgua;

const float ZOCALO = 0.075;
float gAsp;
float gNivel;
float gPAgua;
float gPMoho;

// Cuánto moho hay en un punto (en unidades de altura); ya restada la limpieza
float densidad(vec2 pos) {
  float y = pos.y;
  vec2 dE = pos - vec2(uEnchufe.x * gAsp, uEnchufe.y);
  float dist = length(dE * vec2(1.0, 1.15));
  float sz = y - ZOCALO;
  float D = 1.1 * exp(-dist * 6.2) * uMoho;
  D += 0.55 * uMoho * exp(-max(sz, 0.0) * 16.0) * smoothstep(-0.06, 0.0, sz) * (0.6 + 0.8 * noise(vec2(pos.x * 3.0, 1.7)));
  D += 0.14 * uMoho * uAgua * hasta(gNivel - 0.08, gNivel + 0.02, y) * (1.0 - gPAgua);
  float islas = noise(pos * 3.2 + 3.0) * 0.6 + noise(pos * 8.0 + 9.0) * 0.4;   // crece en islas, con huecos
  D *= 0.3 + 1.3 * smoothstep(0.25, 0.78, islas);
  D = D < 0.06 ? 0.0 : D;
  return min(D, 1.6) - pow(gPMoho, 1.7) * 1.95;   // despacio al principio: se ve encoger
}

${GLSL_MOHO}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  gAsp = uRes.x / uRes.y;
  vec2 q = vec2(uv.x * gAsp, uv.y);   // la altura mide 1: el grano no depende del ancho

  // --- La pared: pintura blanca rota, luz desde arriba a la izquierda, piel de naranja
  vec3 col = vec3(0.929, 0.922, 0.902);
  col *= 0.965 + 0.05 * uv.y - 0.025 * uv.x;
  col += (fbm(q * 90.0) - 0.5) * 0.022;
  col += (noise(q * 420.0) - 0.5) * 0.012;

  // --- El zócalo, con su sombra
  if (uv.y < ZOCALO) {
    col = vec3(0.968, 0.965, 0.958) * (0.955 + 0.5 * uv.y);
    col *= 1.0 - 0.07 * smoothstep(ZOCALO - 0.007, ZOCALO, uv.y);
  } else {
    col *= 1.0 - 0.09 * hasta(ZOCALO, ZOCALO + 0.014, uv.y);
  }

  // --- El agua: sube del suelo con un borde irregular; al secarse, el nivel baja
  gPAgua = smoothstep(0.3, 0.9, uP);
  float borde = 0.40 + 0.16 * (fbm(vec2(q.x * 1.7, 3.1)) - 0.5);
  borde -= 0.22 * smoothstep(0.55, 1.0, uv.x);
  float h = uv.y + 0.055 * (fbm(q * 4.0 + 7.0) - 0.5) + 0.018 * (fbm(q * 15.0) - 0.5);
  gNivel = mix(borde, ZOCALO - 0.03, gPAgua);
  float dentro = hasta(gNivel - 0.06, gNivel + 0.004, h);
  float anillo1 = exp(-pow((h - gNivel) / 0.006, 2.0));
  float anillo2 = exp(-pow((h - (gNivel - 0.05 - 0.02 * fbm(q * 3.0))) / 0.0045, 2.0)) * 0.5;
  float marca = exp(-pow((h - (borde + 0.03)) / 0.005, 2.0)) * 0.45 * (1.0 - gPAgua);
  col = mix(col, col * vec3(0.86, 0.80, 0.67), dentro * 0.55 * (1.0 - 0.7 * gPAgua) * uAgua);
  float anillos = ((anillo1 + anillo2) * (1.0 - gPAgua) + marca) * uAgua;
  col = mix(col, vec3(0.55, 0.43, 0.27), clamp(anillos, 0.0, 1.0) * 0.5);

  // --- El moho, como es de verdad sobre pladur (las fotos de su galería): un manto difuso y moteado,
  //     de marrón a negro verdoso, con el borde más oscuro donde se secó; encima, motitas apiñadas
  //     y alguna peca de óxido; el papel de alrededor, amarillento.
  //     Limpiar baja la densidad: el manto se rompe en trozos irregulares y las motas sueltas se van antes
  gPMoho = smoothstep(0.06, 0.86, uP);
  float Dp = densidad(q);
  if (uMoho > 0.0) {
    col = pintarMoho(col, q, Dp, 1.0, 0.0);
  }

  // --- El hollín: baja del techo en nubes, más cargado en la esquina, con chorretones finos
  float pHollin = smoothstep(0.0, 0.32, uP);
  float S = smoothstep(0.6 - 0.32 * max(uHollin - 1.0, 0.0), 1.0, uv.y + 0.22 * (fbm(q * 1.8 + 11.0) - 0.5));
  S *= 0.45 + 0.75 * fbm(q * 4.5 + 2.0);
  S *= 0.75 + 0.5 * (1.0 - uv.x);
  S += 0.18 * smoothstep(0.55, 1.0, uv.y) * smoothstep(0.86, 0.96, noise(vec2(q.x * 55.0, uv.y * 1.2)));
  S *= min(uHollin, 1.0);
  float Sr = S - pHollin * 1.35 + 0.12 * (fbm(q * 3.0 + 4.0) - 0.5) * pHollin;
  col = mix(col, vec3(0.21, 0.195, 0.18), clamp(Sr, 0.0, 1.0) * 0.58);

  // --- Un poco de viñeta, como una foto
  col *= 1.0 - 0.07 * length(uv - vec2(0.45, 0.55));

  gl_FragColor = vec4(col, 1.0);
}
`

export const CAPAS_HERO = { hollin: 1, moho: 1, agua: 1 }

// tamano: () => ({ ancho, alto, escala? }) en px CSS (y px del lienzo por px CSS), para pintar en un
// lienzo que no está en la página
// ANGLE sobre Direct3D (Windows): su compilador de shaders es el lento
function esDirect3d(gl) {
  const info = gl.getExtension('WEBGL_debug_renderer_info')
  const tarjeta = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : ''
  return tarjeta ? /Direct3D|D3D1\d/i.test(tarjeta) : /Windows/.test(navigator.userAgent)
}

// Promesa con { medir, dibujar, destruir, mejorada } cuando el shader está compilado (sin congelar la
// página), o null si el aparato no tiene WebGL: la pantalla enseña entonces la pared limpia.
// Con Direct3D (Chrome, Edge y Firefox en Windows) la completa tarda unos 6 s en compilar: primero se
// compila sola la previa, sin las motitas (1,5 s; las dos a la vez tardan más), y la completa detrás,
// que entra sola al llegar; «mejorada» es la promesa de ese cambio (para quien guarde lo pintado).
// En los demás (móviles, Mac) la completa compila en un momento y va directa.
export async function crearParedDanada(canvas, { enchufe = [0.36, 0.24], capas = CAPAS_HERO, escalaMax = 1.5, tamano = null } = {}) {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, preserveDrawingBuffer: false })
  if (!gl) return null

  const previa = esDirect3d(gl)
    ? await enlazarPrograma(gl, VERTICES, `#define SIN_MOTAS\n${FRAGMENTOS}`).catch(() => null)
    : null
  const completa = enlazarPrograma(gl, VERTICES, FRAGMENTOS)
  let primero = previa
  if (!primero) {
    try {
      primero = await completa
    } catch (e) {
      console.warn('[pared] sin shader:', e)
      return null
    }
  }

  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW)

  let programa = null
  let uRes = null
  let uP = null
  let ultimoP = -1

  // Pasa a usar un programa: sus atributos y sus uniformes fijos
  function usar(nuevo) {
    if (programa) gl.deleteProgram(programa)
    programa = nuevo
    gl.useProgram(programa)
    const aPos = gl.getAttribLocation(programa, 'aPos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)
    uRes = gl.getUniformLocation(programa, 'uRes')
    uP = gl.getUniformLocation(programa, 'uP')
    gl.uniform2f(gl.getUniformLocation(programa, 'uEnchufe'), enchufe[0], enchufe[1])
    const c = { hollin: 0, moho: 0, agua: 0, ...capas }
    gl.uniform1f(gl.getUniformLocation(programa, 'uHollin'), c.hollin)
    gl.uniform1f(gl.getUniformLocation(programa, 'uMoho'), c.moho)
    gl.uniform1f(gl.getUniformLocation(programa, 'uAgua'), c.agua)
    gl.uniform2f(uRes, canvas.width, canvas.height)
  }

  function medir() {
    const css = tamano ? tamano() : { ancho: canvas.clientWidth, alto: canvas.clientHeight }
    const escala = css.escala ?? Math.min(window.devicePixelRatio || 1, escalaMax)
    const ancho = Math.max(1, Math.round(css.ancho * escala))
    const alto = Math.max(1, Math.round(css.alto * escala))
    if (canvas.width !== ancho || canvas.height !== alto) {
      canvas.width = ancho
      canvas.height = alto
      gl.viewport(0, 0, ancho, alto)
      gl.uniform2f(uRes, ancho, alto)
      ultimoP = -1
    }
  }

  function dibujar(p, forzar = false) {
    if (!programa || (!forzar && Math.abs(p - ultimoP) < 0.0005)) return
    ultimoP = p
    gl.uniform1f(uP, p)
    gl.drawArrays(gl.TRIANGLES, 0, 6)
  }

  let destruida = false
  function destruir() {
    destruida = true
    gl.deleteBuffer(buffer)
    if (programa) gl.deleteProgram(programa)
    programa = null
    gl.getExtension('WEBGL_lose_context')?.loseContext()
  }

  usar(primero)
  medir()
  // Con la previa puesta, la completa entra en cuanto compila y se repinta lo que se veía
  const mejorada = previa
    ? completa.then((p) => {
        if (destruida) return false
        usar(p)
        if (ultimoP >= 0) dibujar(ultimoP, true)
        return true
      }, () => false)
    : Promise.resolve(false)
  return { medir, dibujar, destruir, mejorada }
}
