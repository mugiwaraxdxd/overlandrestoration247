// La página es la pared: un lienzo fijo detrás de todo lo que va después del hero, con todo lo que
// limpia Overland. Cada bloque marcado con [data-dano="agua|fuego|tormenta|moho"] (uno o varios)
// lleva ese daño detrás: cercos de agua, hollín de un incendio, la línea de inundación de un huracán
// con el barro debajo, o moho. Su textura se mueve con la página, como si fuera la pared.
// Cada zona trae su daño y se limpia al subir por la pantalla (lo que ya has leído queda limpio);
// cada una tiene su fuerza ([data-fuerza], de 0 a 1), que baja a lo largo de la página, y al llegar
// al botón final no queda nada.
// La sección [data-oscuro] es la pared a oscuras: solo se ve donde apunta la linterna.
import { GLSL_COMUN, GLSL_MOHO } from './glslComun'
import { VERTICES } from './paredDanada'

export const MAX_DANOS = 16
export const TIPOS_DANO = { agua: 0, fuego: 1, tormenta: 2, moho: 3 }

const FRAGMENTOS = `
${GLSL_COMUN}

uniform vec2 uRes;       // px del lienzo
uniform float uEscala;   // px del lienzo por px CSS
uniform float uVista;    // alto de la pantalla, px CSS
uniform float uScroll;   // scroll de la página, px CSS
uniform float uInicio;   // dónde empieza la pared (el final del hero), en px de página
uniform float uP;        // cuánto se ha avanzado hacia el botón final (0..1)
uniform vec4 uDanos[${MAX_DANOS}];      // dónde va cada daño (x0, y0, x1, y1), px CSS de pantalla
uniform float uTipos[${MAX_DANOS}];     // y de qué tipo (TIPOS_DANO)
uniform float uFuerza[${MAX_DANOS}];    // y con cuánta fuerza (0..1)
uniform float uNDanos;
uniform vec4 uOscuro;     // la sección de noche (x0, y0, x1, y1), px CSS de pantalla
uniform float uHayOscuro;
uniform float uNoche;     // 1 si la noche está a la vista
uniform vec2 uLuz;        // dónde apunta la linterna, px CSS de pantalla
uniform float uRadio;     // radio de la linterna, px CSS

const float UNIDAD = 820.0;   // la escala del grano: la misma que la pared del hero
float gAncho;
float gPMoho;
float gPesoMoho;    // cuánto moho toca en el píxel que se pinta (lo lee «densidad»)
float gFuerzaMoho;  // y con cuánta fuerza

// 1 dentro de la sección de noche (con el borde suave), 0 fuera
float aOscuras(vec2 v) {
  if (uHayOscuro <= 0.0) return 0.0;
  return smoothstep(uOscuro.y, uOscuro.y + 36.0, v.y) * (1.0 - smoothstep(uOscuro.w - 36.0, uOscuro.w, v.y));
}

// Cuánto se ha limpiado en un sitio: lo que sube al tercio de arriba de la pantalla (lo ya leído) y,
// al final del recorrido, todo
float limpiezaEn(float yPantalla) {
  float subida = smoothstep(0.4, 1.0, 1.0 - yPantalla / uVista);
  return subida * 0.85 + smoothstep(0.86, 1.0, uP) * 2.0;
}

// Cuánto moho hay en un punto (en unidades de página), ya restada la limpieza
float densidad(vec2 pos) {
  float x = pos.x * UNIDAD;
  float yPagina = pos.y * UNIDAD;
  float borde = min(x, gAncho - x);
  float D = exp(-borde / max(gAncho * 0.22, 170.0));                          // entra desde los bordes
  float tramos = noise(vec2(pos.x * 0.7, pos.y * 1.5) + 3.0) * 0.6 + noise(pos * 4.0 + 9.0) * 0.4;
  D *= 1.9 * smoothstep(0.3, 0.68, tramos);                                    // a trozos, no una franja
  D += 1.0 * smoothstep(0.66, 0.9, noise(pos * 1.4 + 21.0));                     // manchas sueltas en medio
  float noche = smoothstep(0.9, 1.0, aOscuras(vec2(x, yPagina - uScroll))) * uNoche;
  D += 1.5 * noche * (0.45 + 0.55 * smoothstep(0.3, 0.7, noise(pos * 2.2 + 41.0)));   // a oscuras hay más
  float islas = noise(pos * 3.2 + 3.0) * 0.6 + noise(pos * 8.0 + 9.0) * 0.4;
  D *= 0.3 + 1.3 * smoothstep(0.25, 0.78, islas);
  D *= smoothstep(0.0, 260.0, yPagina - uInicio);                              // nada por encima del hero
  D = min(D, 1.5) * gPesoMoho;
  return D - (limpiezaEn(yPagina - uScroll) + (1.0 - gFuerzaMoho) * 0.9) * (1.0 - 0.8 * noche);
}

${GLSL_MOHO}

// Cuánto pertenece un punto a la zona de un daño: el borde, irregular y ancho (no se ve el rectángulo)
float pertenece(vec2 v, vec4 r, float roto) {
  vec2 d = max(vec2(r.x - v.x, r.y - v.y), vec2(v.x - r.z, v.y - r.w));
  float fuera = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
  return 1.0 - smoothstep(-24.0, 56.0, fuera + roto);
}

// Cercos de agua, como una gotera que se secó: el interior apenas amarillento, más cargado hacia el
// borde, y el cerco marrón bien marcado (con un segundo cerco fino justo dentro)
vec3 pintarAgua(vec3 col, vec2 q, float limp, float w) {
  float f = fbm(q * 2.4 + 17.0) * 0.7 + fbm(q * 6.0 + 3.0) * 0.3;
  float D = (f - 0.55) * 3.4 - limp * 1.5 + (noise(q * 60.0) - 0.5) * 0.02;
  float dentro = smoothstep(-0.006, 0.006, D);
  float haciaBorde = dentro * (0.35 + 0.65 * (1.0 - smoothstep(0.0, 0.22, D)));
  float cerco = exp(-pow(D / 0.012, 2.0));
  float cerco2 = exp(-pow((D - 0.05) / 0.008, 2.0)) * 0.45;
  float grano = 0.8 + 0.4 * noise(q * 160.0);
  col = mix(col, col * vec3(0.88, 0.82, 0.68), haciaBorde * 0.6 * w);
  col = mix(col, vec3(0.5, 0.38, 0.22), clamp((cerco + cerco2) * grano, 0.0, 1.0) * 0.7 * w);
  return col;
}

// Hollín: depósitos negros y granulados que suben en columnas, con chorretones finos y el borde chamuscado
vec3 pintarFuego(vec3 col, vec2 q, float limp, float w) {
  float S = fbm(vec2(q.x * 2.6, q.y * 0.85) + 31.0) * 0.75 + fbm(q * 7.0 + 5.0) * 0.25;
  S = smoothstep(0.42, 0.7, S);
  float chorros = smoothstep(0.86, 0.95, noise(vec2(q.x * 80.0, q.y * 1.2) + 2.0));
  float d = S * (1.0 + chorros * 0.6) - limp * 1.35;
  float grano = noise(q * 260.0) * 0.6 + noise(q * 90.0 + 4.0) * 0.4;
  float hollin = smoothstep(0.0, 0.18, d + (grano - 0.5) * 0.22);     // borde definido y granulado
  float tono = smoothstep(0.15, 0.8, d);                                 // más negro donde más hay
  float chamusco = smoothstep(-0.12, 0.0, d) * (1.0 - smoothstep(0.0, 0.12, d));
  vec3 colHollin = mix(vec3(0.33, 0.3, 0.27), vec3(0.12, 0.11, 0.1), tono) * (0.9 + 0.2 * grano);
  col = mix(col, vec3(0.52, 0.4, 0.28), chamusco * 0.4 * w);
  col = mix(col, colHollin, hollin * 0.85 * w);
  return col;
}

// La línea de inundación del huracán: la raya oscura del nivel al que llegó y el barro debajo
vec3 pintarTormenta(vec3 col, vec2 q, vec2 v, float L, float limp, float w) {
  float nivel = L + 16.0 * (noise(vec2(q.x * 2.2, 5.0)) - 0.5) + 4.0 * (noise(vec2(q.x * 30.0, 1.0)) - 0.5);
  float debajo = smoothstep(nivel - 2.0, nivel + 2.0, v.y);
  float barro = debajo * (0.5 + 0.5 * fbm(vec2(q.x * 14.0, q.y * 3.0)));
  barro *= 0.65 + 0.45 * (1.0 - smoothstep(nivel, nivel + 220.0, v.y));
  float raya = exp(-pow((v.y - nivel) / 3.0, 2.0));
  float banda = exp(-pow((v.y - (nivel + 12.0)) / 7.0, 2.0)) * 0.55;
  float largo = 60.0 + 120.0 * noise(vec2(q.x * 40.0, 3.0));
  float gotas = smoothstep(0.86, 0.96, noise(vec2(q.x * 95.0, 1.0))) * debajo * (1.0 - smoothstep(nivel, nivel + largo, v.y));
  float quita = limp * 1.35 + 0.15 * (fbm(q * 3.5 + 8.0) - 0.5);
  col = mix(col, col * vec3(0.79, 0.72, 0.6), clamp(barro - quita, 0.0, 1.0) * w);
  col = mix(col, vec3(0.37, 0.29, 0.19), clamp(raya + banda + gotas * 0.6 - quita * 1.2, 0.0, 1.0) * 0.8 * w);
  return col;
}

void main() {
  vec2 v = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uEscala;   // px CSS, y hacia abajo
  gAncho = uRes.x / uEscala;
  vec2 q = (v + vec2(0.0, uScroll)) / UNIDAD;                         // la pared se mueve con la página

  // La pintura, como la del hero
  vec3 col = vec3(0.929, 0.922, 0.902);
  col += (fbm(q * 90.0) - 0.5) * 0.022;
  col += (noise(q * 420.0) - 0.5) * 0.012;

  // Qué daño toca aquí (el borde de cada zona, irregular y pegado a la página)
  vec2 enPagina = v + vec2(0.0, uScroll);
  float roto = (noise(enPagina / 60.0 + 7.0) - 0.5) * 70.0 + (noise(enPagina / 14.0) - 0.5) * 16.0;
  float wA = 0.0, wF = 0.0, wT = 0.0, wM = 0.0, lineaT = 0.0;
  float fA = 1.0, fF = 1.0, fT = 1.0, fM = 1.0;
  for (int i = 0; i < ${MAX_DANOS}; i++) {
    if (float(i) >= uNDanos) break;
    float w = pertenece(v, uDanos[i], roto);
    float t = uTipos[i];
    float f = uFuerza[i];
    if (t < 0.5) { if (w > wA) { wA = w; fA = f; } }
    else if (t < 1.5) { if (w > wF) { wF = w; fF = f; } }
    else if (t < 2.5) { if (w > wT) { wT = w; fT = f; lineaT = mix(uDanos[i].y, uDanos[i].w, 0.5); } }
    else { if (w > wM) { wM = w; fM = f; } }
  }

  // A oscuras: la pared casi negra y, donde apunta la linterna, la pared de verdad con luz cálida
  float oscuro = aOscuras(v) * uNoche;
  float dist = length(v - uLuz);
  float luz = 1.0 - smoothstep(uRadio * 0.15, uRadio, dist);
  float aro = exp(-pow((dist - uRadio * 0.82) / (uRadio * 0.08), 2.0)) * 0.12;
  bool seVe = oscuro < 0.97 || luz + aro > 0.004;   // a oscuras y fuera del haz no se calcula nada

  if (seVe) {
    float limp = limpiezaEn(v.y);
    // Menos fuerza = como si ya estuviera algo limpio
    if (wT > 0.01) col = pintarTormenta(col, q, v, lineaT, limp + (1.0 - fT) * 0.9, wT);
    if (wA > 0.01) col = pintarAgua(col, q, limp + (1.0 - fA) * 0.9, wA);
    if (wF > 0.01) col = pintarFuego(col, q, limp + (1.0 - fF) * 0.9, wF);
    gPesoMoho = wM;
    gFuerzaMoho = fM;
    if (wM > 0.01) {
      float Dp = densidad(q);
      if (Dp > -0.45) col = pintarMoho(col, q, Dp, 1.0, 1.0);
    }
  }

  if (oscuro > 0.0) {
    vec3 noche = col * vec3(0.05, 0.055, 0.07);
    vec3 linterna = col * vec3(1.0, 0.95, 0.84) * (0.7 + 0.4 * luz);
    col = mix(col, mix(noche, linterna, clamp(luz + aro, 0.0, 1.0)), oscuro);
  }

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

// Devuelve null sin WebGL: entonces la página es papel limpio
export function crearParedPagina(canvas, { escalaMax = 1.25 } = {}) {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false })
  if (!gl) return null
  let programa
  try {
    programa = gl.createProgram()
    gl.attachShader(programa, compilar(gl, gl.VERTEX_SHADER, VERTICES))
    gl.attachShader(programa, compilar(gl, gl.FRAGMENT_SHADER, FRAGMENTOS))
    gl.linkProgram(programa)
    if (!gl.getProgramParameter(programa, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(programa))
  } catch (e) {
    console.warn('[pared de la página] sin shader:', e)
    return null
  }
  gl.useProgram(programa)

  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW)
  const aPos = gl.getAttribLocation(programa, 'aPos')
  gl.enableVertexAttribArray(aPos)
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

  const u = (n) => gl.getUniformLocation(programa, n)
  const U = {
    res: u('uRes'), escala: u('uEscala'), vista: u('uVista'), scroll: u('uScroll'),
    inicio: u('uInicio'), p: u('uP'), danos: u('uDanos'), tipos: u('uTipos'), fuerza: u('uFuerza'), nDanos: u('uNDanos'),
    oscuro: u('uOscuro'), hayOscuro: u('uHayOscuro'), luz: u('uLuz'), radio: u('uRadio'), noche: u('uNoche')
  }
  const rectsDanos = new Float32Array(MAX_DANOS * 4)
  const tiposDanos = new Float32Array(MAX_DANOS)
  const fuerzaDanos = new Float32Array(MAX_DANOS)

  function medir() {
    const escala = Math.min(window.devicePixelRatio || 1, escalaMax)
    const ancho = Math.max(1, Math.round(canvas.clientWidth * escala))
    const alto = Math.max(1, Math.round(canvas.clientHeight * escala))
    if (canvas.width !== ancho || canvas.height !== alto) {
      canvas.width = ancho
      canvas.height = alto
      gl.viewport(0, 0, ancho, alto)
    }
    gl.uniform2f(U.res, ancho, alto)
    gl.uniform1f(U.escala, ancho / Math.max(1, canvas.clientWidth))
    gl.uniform1f(U.vista, canvas.clientHeight)
  }

  // danos: [{ x0, y0, x1, y1, tipo, fuerza }] en px CSS de pantalla (tipo: TIPOS_DANO; fuerza 0..1)
  // oscuro: el de la sección de noche (o null); luz: { x, y, radio } de la linterna
  function dibujar({ scroll, inicio, p, danos = [], oscuro = null, luz = null, noche = 0 }) {
    gl.uniform1f(U.scroll, scroll)
    gl.uniform1f(U.inicio, inicio)
    gl.uniform1f(U.p, p)
    const n = Math.min(danos.length, MAX_DANOS)
    for (let i = 0; i < n; i++) {
      rectsDanos.set([danos[i].x0, danos[i].y0, danos[i].x1, danos[i].y1], i * 4)
      tiposDanos[i] = danos[i].tipo
      fuerzaDanos[i] = danos[i].fuerza ?? 1
    }
    gl.uniform4fv(U.danos, rectsDanos)
    gl.uniform1fv(U.tipos, tiposDanos)
    gl.uniform1fv(U.fuerza, fuerzaDanos)
    gl.uniform1f(U.nDanos, n)
    gl.uniform1f(U.hayOscuro, oscuro ? 1 : 0)
    gl.uniform1f(U.noche, noche)
    if (oscuro) gl.uniform4f(U.oscuro, oscuro.x0, oscuro.y0, oscuro.x1, oscuro.y1)
    if (luz) {
      gl.uniform2f(U.luz, luz.x, luz.y)
      gl.uniform1f(U.radio, luz.radio)
    }
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
