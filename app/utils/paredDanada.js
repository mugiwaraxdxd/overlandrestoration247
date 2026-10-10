// La pared dañada del hero: hollín arriba, moho alrededor del enchufe y a ras del zócalo,
// y un cerco de agua que sube del suelo. Todo generado (WebGL 1, sin librerías).
// `dibujar(p)` la pinta con la limpieza en `p` (0 = como la encontramos, 1 = restaurada):
// el hollín se va primero, el moho se retira de los bordes a los núcleos y el agua baja al secarse.

const VERTICES = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`

const FRAGMENTOS = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 uRes;
uniform float uP;
uniform vec2 uEnchufe;   // centro del enchufe, en 0..1 con y hacia arriba

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = m * p;
    a *= 0.5;
  }
  return v;
}

// 1 por debajo de «lo», 0 por encima de «hi» (smoothstep con los bordes al revés no está definido en GLSL)
float hasta(float lo, float hi, float x) { return 1.0 - smoothstep(lo, hi, x); }

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
  float D = 1.1 * exp(-dist * 6.2);
  D += 0.55 * exp(-max(sz, 0.0) * 16.0) * step(-0.03, sz) * (0.6 + 0.8 * noise(vec2(pos.x * 3.0, 1.7)));
  D += 0.14 * hasta(gNivel - 0.08, gNivel + 0.02, y) * (1.0 - gPAgua);
  D *= 0.6 + 0.8 * noise(pos * 2.6 + 3.0);
  D = D < 0.06 ? 0.0 : D;
  return min(D, 1.6) - pow(gPMoho, 1.7) * 1.75;   // despacio al principio: se ve encoger
}

// Colonias redondas: una posible por celda, nace según la densidad, y su radio también
// «semilla» solo cambia el azar de cada capa; la densidad se mide siempre en el sitio de verdad
float colonias(vec2 pos, float escala, float tam, float fertil, float rugoso, float semilla, out float halo) {
  vec2 x = pos * escala;
  vec2 i = floor(x);
  vec2 f = fract(x);
  float nuc = 0.0;
  float hal = 0.0;
  for (int j = -1; j <= 1; j++) {
    for (int k = -1; k <= 1; k++) {
      vec2 g = vec2(float(k), float(j));
      vec2 celda = i + g;
      vec2 s = celda + semilla;
      vec2 o = vec2(hash(s), hash(s + 17.31));
      float Dc = densidad((celda + o) / escala);
      if (Dc <= 0.0 || hash(s + 3.7) > Dc * fertil) continue;
      float r = (0.2 + 0.32 * hash(s + 9.1)) * tam * clamp(Dc * 1.4, 0.0, 1.0);
      float d = length(g + o - f) + (noise(x * 3.0 + s * 1.7) - 0.5) * rugoso * tam;
      nuc = max(nuc, hasta(r * 0.45, r, d));
      hal = max(hal, hasta(r * 0.9, r * 2.1, d));
    }
  }
  halo = hal;
  return nuc;
}

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
  col = mix(col, col * vec3(0.86, 0.80, 0.67), dentro * 0.55 * (1.0 - 0.7 * gPAgua));
  float anillos = (anillo1 + anillo2) * (1.0 - gPAgua) + marca;
  col = mix(col, vec3(0.55, 0.43, 0.27), clamp(anillos, 0.0, 1.0) * 0.5);

  // --- El moho: colonias alrededor del enchufe, a ras del zócalo y donde hubo agua.
  //     Limpiar baja la densidad: las colonias sueltas se van antes y las del foco encogen hasta desaparecer
  gPMoho = smoothstep(0.06, 0.86, uP);
  float Dp = densidad(q);
  col *= 1.0 - 0.16 * smoothstep(0.15, 1.0, Dp);          // la pared se ensucia donde hay mucho
  float h1, h2, h3, h4;
  float c1 = colonias(q, 10.0, 0.75, 0.55, 0.42, 0.0, h1);     // pocas colonias grandes, de borde deshilachado
  float c2 = colonias(q, 26.0, 0.95, 1.25, 0.3, 41.0, h2);     // muchas medianas
  float c3 = colonias(q, 60.0, 0.95, 1.6, 0.22, 83.0, h3);     // el salpicado
  float c4 = colonias(q, 130.0, 0.9, 1.8, 0.1, 127.0, h4);     // el polvo de esporas
  float halo = max(h1 * 0.9, max(h2 * 0.75, max(h3 * 0.5, h4 * 0.3)));
  float nucleo = max(max(c1, c2), max(c3 * 0.9, c4 * 0.75));
  vec3 colMoho = mix(vec3(0.17, 0.185, 0.145), vec3(0.055, 0.06, 0.055), noise(q * 34.0));
  col = mix(col, col * vec3(0.76, 0.76, 0.70), halo * 0.55);
  col = mix(col, colMoho, nucleo * 0.92);

  // --- El hollín: baja del techo en nubes, más cargado en la esquina, con chorretones finos
  float pHollin = smoothstep(0.0, 0.32, uP);
  float S = smoothstep(0.6, 1.0, uv.y + 0.22 * (fbm(q * 1.8 + 11.0) - 0.5));
  S *= 0.45 + 0.75 * fbm(q * 4.5 + 2.0);
  S *= 0.75 + 0.5 * (1.0 - uv.x);
  S += 0.18 * smoothstep(0.55, 1.0, uv.y) * smoothstep(0.86, 0.96, noise(vec2(q.x * 55.0, uv.y * 1.2)));
  float Sr = S - pHollin * 1.35 + 0.12 * (fbm(q * 3.0 + 4.0) - 0.5) * pHollin;
  col = mix(col, vec3(0.21, 0.195, 0.18), clamp(Sr, 0.0, 1.0) * 0.58);

  // --- Un poco de viñeta, como una foto
  col *= 1.0 - 0.07 * length(uv - vec2(0.45, 0.55));

  gl_FragColor = vec4(col, 1.0);
}
`

function compilar(gl, tipo, fuente) {
  const s = gl.createShader(tipo)
  gl.shaderSource(s, fuente)
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    const error = gl.getShaderInfoLog(s)
    gl.deleteShader(s)
    throw new Error(error)
  }
  return s
}

// Devuelve null si el aparato no tiene WebGL: la pantalla enseña entonces la pared limpia
export function crearParedDanada(canvas, { enchufe = [0.36, 0.24], escalaMax = 1.75 } = {}) {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, preserveDrawingBuffer: false })
  if (!gl) return null

  let programa
  try {
    programa = gl.createProgram()
    gl.attachShader(programa, compilar(gl, gl.VERTEX_SHADER, VERTICES))
    gl.attachShader(programa, compilar(gl, gl.FRAGMENT_SHADER, FRAGMENTOS))
    gl.linkProgram(programa)
    if (!gl.getProgramParameter(programa, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(programa))
  } catch (e) {
    console.warn('[pared] sin shader:', e)
    return null
  }
  gl.useProgram(programa)

  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW)
  const aPos = gl.getAttribLocation(programa, 'aPos')
  gl.enableVertexAttribArray(aPos)
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

  const uRes = gl.getUniformLocation(programa, 'uRes')
  const uP = gl.getUniformLocation(programa, 'uP')
  const uEnchufe = gl.getUniformLocation(programa, 'uEnchufe')
  gl.uniform2f(uEnchufe, enchufe[0], enchufe[1])

  let ultimoP = -1

  function medir() {
    const escala = Math.min(window.devicePixelRatio || 1, escalaMax)
    const ancho = Math.max(1, Math.round(canvas.clientWidth * escala))
    const alto = Math.max(1, Math.round(canvas.clientHeight * escala))
    if (canvas.width !== ancho || canvas.height !== alto) {
      canvas.width = ancho
      canvas.height = alto
      gl.viewport(0, 0, ancho, alto)
      gl.uniform2f(uRes, ancho, alto)
      ultimoP = -1
    }
  }

  function dibujar(p) {
    if (Math.abs(p - ultimoP) < 0.0005) return
    ultimoP = p
    gl.uniform1f(uP, p)
    gl.drawArrays(gl.TRIANGLES, 0, 6)
  }

  function destruir() {
    gl.deleteBuffer(buffer)
    gl.deleteProgram(programa)
    gl.getExtension('WEBGL_lose_context')?.loseContext()
  }

  medir()
  return { medir, dibujar, destruir }
}
