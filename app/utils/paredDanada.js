// La pared dañada: todo lo que limpia Overland, generado (WebGL 1, sin librerías).
// Capas (cada una con su peso, 0 = no está): hollín que baja del techo, moho alrededor del enchufe
// y a ras del zócalo, agua que sube del suelo, una gotera que mancha desde el techo y la línea de
// inundación de un huracán con el barro debajo.
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
uniform float uHollin;   // peso de cada capa
uniform float uMoho;
uniform float uAgua;
uniform float uGotera;
uniform float uInundacion;

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
  float D = 1.1 * exp(-dist * 6.2) * uMoho;
  D += 0.55 * uMoho * exp(-max(sz, 0.0) * 16.0) * smoothstep(-0.06, 0.0, sz) * (0.6 + 0.8 * noise(vec2(pos.x * 3.0, 1.7)));
  D += 0.14 * uMoho * uAgua * hasta(gNivel - 0.08, gNivel + 0.02, y) * (1.0 - gPAgua);
  float islas = noise(pos * 3.2 + 3.0) * 0.6 + noise(pos * 8.0 + 9.0) * 0.4;   // crece en islas, con huecos
  D *= 0.3 + 1.3 * smoothstep(0.25, 0.78, islas);
  D = D < 0.06 ? 0.0 : D;
  return min(D, 1.6) - pow(gPMoho, 1.7) * 1.95;   // despacio al principio: se ve encoger
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
      vec2 deforma = vec2(noise(x * 2.3 + s * 1.7), noise(x * 2.3 + s * 2.9 + 11.0)) - 0.5;
      float d = length(g + o - f + deforma * rugoso * tam) + (noise(x * 7.0 + s) - 0.5) * 0.12 * tam;
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
  col = mix(col, col * vec3(0.86, 0.80, 0.67), dentro * 0.55 * (1.0 - 0.7 * gPAgua) * uAgua);
  float anillos = ((anillo1 + anillo2) * (1.0 - gPAgua) + marca) * uAgua;
  col = mix(col, vec3(0.55, 0.43, 0.27), clamp(anillos, 0.0, 1.0) * 0.5);

  // --- La gotera: una mancha que se abre desde el techo, con sus cercos y el chorretón que baja;
  //     al secarse, los cercos se recogen hacia el techo
  if (uGotera > 0.0) {
    float pG = smoothstep(0.08, 0.88, uP);
    vec2 cG = vec2(0.6 * gAsp, 1.04);
    float dg = length((q - cG) * vec2(1.0, 0.82)) + 0.06 * (fbm(q * 4.0 + 21.0) - 0.5) + 0.016 * (fbm(q * 15.0 + 2.0) - 0.5);
    float R0 = 0.5;
    float R = mix(R0, -0.06, pG);
    float dentroG = hasta(R - 0.07, R + 0.003, dg);
    float cerco1 = exp(-pow((dg - R) / 0.007, 2.0));
    float cerco2 = exp(-pow((dg - (R - 0.06 - 0.02 * fbm(q * 3.0 + 5.0))) / 0.005, 2.0)) * 0.6;
    float cerco3 = exp(-pow((dg - (R - 0.15)) / 0.0045, 2.0)) * 0.4 * step(0.0, R - 0.15);
    float viejo = exp(-pow((dg - (R0 + 0.025)) / 0.005, 2.0)) * 0.4 * (1.0 - pG);
    col = mix(col, col * vec3(0.84, 0.78, 0.64), dentroG * 0.6 * uGotera);
    col = mix(col, vec3(0.52, 0.40, 0.24), clamp((cerco1 + cerco2 + cerco3) * (1.0 - 0.6 * pG) + viejo, 0.0, 1.0) * 0.55 * uGotera);
    float xc = cG.x + 0.012 * sin(uv.y * 23.0) + 0.006 * (noise(vec2(uv.y * 9.0, 2.0)) - 0.5);
    float hilo = exp(-pow((q.x - xc) / 0.006, 2.0)) * smoothstep(0.18, 0.34, uv.y) * hasta(0.55, 0.62, uv.y);
    col = mix(col, vec3(0.6, 0.48, 0.3), hilo * 0.45 * (1.0 - pG) * uGotera);
  }

  // --- La línea de inundación del huracán: barro seco por debajo, la marca oscura del nivel al que llegó
  if (uInundacion > 0.0) {
    float pI = smoothstep(0.08, 0.88, uP);
    float L = 0.5 + 0.02 * (fbm(vec2(q.x * 2.2, 5.0)) - 0.5) + 0.006 * (noise(vec2(q.x * 30.0, 1.0)) - 0.5);
    float debajo = hasta(L - 0.004, L + 0.004, uv.y);
    float barro = debajo * (0.55 + 0.45 * fbm(vec2(q.x * 14.0, uv.y * 2.5)));
    barro *= 0.75 + 0.35 * hasta(L - 0.12, L, uv.y);                                  // más cargado junto a la línea
    float raya = exp(-pow((uv.y - L) / 0.0045, 2.0));
    float banda = exp(-pow((uv.y - (L - 0.018)) / 0.01, 2.0)) * 0.6;
    float salpicado = step(0.965, noise(q * 110.0)) * debajo;
    float quita = pI * 1.35 - 0.15 * (fbm(q * 3.5 + 8.0) - 0.5);
    col = mix(col, col * vec3(0.80, 0.73, 0.62), clamp(barro - quita, 0.0, 1.0) * uInundacion);
    col = mix(col, vec3(0.38, 0.30, 0.20), clamp(raya + banda + salpicado * 0.6 - quita * 1.2, 0.0, 1.0) * 0.75 * uInundacion);
  }

  // --- El moho, como es de verdad sobre pladur (las fotos de su galería): un manto difuso y moteado,
  //     de marrón a negro verdoso, con el borde más oscuro donde se secó; encima, motitas apiñadas
  //     y alguna peca de óxido; el papel de alrededor, amarillento.
  //     Limpiar baja la densidad: el manto se rompe en trozos irregulares y las motas sueltas se van antes
  gPMoho = smoothstep(0.06, 0.86, uP);
  float Dp = densidad(q);
  if (uMoho > 0.0) {
    vec2 qw = q + 0.08 * vec2(fbm(q * 2.0 + 31.0), fbm(q * 2.0 + 47.0));
    float nube = fbm(qw * 5.0 + 3.0) * 0.6 + fbm(qw * 16.0 + 13.0) * 0.4;          // moteado grande y fino
    float hay = clamp(Dp * 2.2, 0.0, 1.0);                                            // el ruido solo mueve donde hay moho
    float fino = fbm(qw * 30.0 + 7.0);                                               // contorno fractal, no de patata
    float manto = clamp(Dp * 1.1 + ((nube - 0.5) * 1.25 + (fino - 0.5) * 0.35) * hay, 0.0, 1.0) * smoothstep(-0.3, 0.05, Dp);
    float aureola = smoothstep(0.02, 0.3, manto);                      // el papel que amarillea alrededor
    float grano = noise(q * 150.0) * 0.55 + noise(q * 320.0 + 3.0) * 0.45;
    float mancha = smoothstep(0.3, 0.4, manto + (grano - 0.5) * 0.32);            // el borde se deshace en motas
    float orilla = smoothstep(0.28, 0.34, manto) * (1.0 - smoothstep(0.36, 0.48, manto));
    float claro = smoothstep(0.55, 0.75, fbm(qw * 9.0 + 41.0)) * (1.0 - smoothstep(0.7, 1.0, manto));   // calvas más claras dentro
    float tono = fbm(qw * 11.0 + 9.0);
    vec3 marron = vec3(0.5, 0.4, 0.28);
    vec3 pardo = vec3(0.28, 0.225, 0.16);
    vec3 negruzco = vec3(0.12, 0.11, 0.09);
    vec3 colManto = mix(marron, pardo, smoothstep(0.3, 0.6, tono));
    colManto = mix(colManto, negruzco, smoothstep(0.45, 0.9, manto * 0.7 + tono * 0.5));
    colManto = mix(colManto, marron * 1.25, claro * 0.6);
    colManto *= 0.92 + 0.16 * (noise(q * vec2(190.0, 60.0)) - 0.5);    // fibra del papel
    col = mix(col, col * vec3(0.89, 0.84, 0.72), aureola * 0.55);
    col = mix(col, colManto, mancha * 0.8);
    col = mix(col, negruzco, orilla * 0.28);

    // Motitas: muchas y pequeñas, irregulares, apiñadas donde hay más
    float h1, h2, h3;
    float c1 = colonias(q, 36.0, 0.85, 0.9, 0.55, 0.0, h1);
    float c2 = colonias(q, 85.0, 0.9, 1.35, 0.45, 41.0, h2);
    float c3 = colonias(q, 180.0, 0.85, 1.6, 0.3, 83.0, h3);
    float motas = max(c1 * 0.85, max(c2 * 0.8, c3 * 0.7));
    float sombra = max(h1 * 0.35, h2 * 0.25);
    vec3 colMota = mix(vec3(0.1, 0.09, 0.075), vec3(0.25, 0.2, 0.14), noise(q * 47.0));
    col = mix(col, col * vec3(0.82, 0.8, 0.74), sombra);
    col = mix(col, colMota, motas);

    // Pecas de óxido
    float oxido = step(0.982, noise(q * 260.0 + 5.0)) * smoothstep(0.08, 0.45, manto);
    col = mix(col, vec3(0.58, 0.36, 0.2), oxido * 0.7);
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
// Lo que tiene la pared del hero; las tarjetas de «What happened?» llevan cada una su daño
export const CAPAS_HERO = { hollin: 1, moho: 1, agua: 1, gotera: 0, inundacion: 0 }

export function crearParedDanada(canvas, { enchufe = [0.36, 0.24], capas = CAPAS_HERO, escalaMax = 1.75 } = {}) {
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
  const c = { ...{ hollin: 0, moho: 0, agua: 0, gotera: 0, inundacion: 0 }, ...capas }
  gl.uniform1f(gl.getUniformLocation(programa, 'uHollin'), c.hollin)
  gl.uniform1f(gl.getUniformLocation(programa, 'uMoho'), c.moho)
  gl.uniform1f(gl.getUniformLocation(programa, 'uAgua'), c.agua)
  gl.uniform1f(gl.getUniformLocation(programa, 'uGotera'), c.gotera)
  gl.uniform1f(gl.getUniformLocation(programa, 'uInundacion'), c.inundacion)

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
