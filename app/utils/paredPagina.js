// La página es la pared: un lienzo fijo detrás de todo lo que va después del hero.
// El moho entra desde los bordes en manchas, con su cerco de agua, y su textura se mueve con el
// scroll como si fuera la pared. Cada mancha se limpia al subir por la pantalla (lo que tienes
// delante se va limpiando) y, además, cuanto más se baja menos queda: al llegar al botón final, nada.
// El moho no se mete detrás del texto: los bloques marcados con [data-limpio] le pasan su sitio.
// La sección [data-oscuro] es la pared a oscuras: solo se ve donde apunta la linterna.
import { GLSL_COMUN, GLSL_MOHO } from './glslComun'
import { VERTICES } from './paredDanada'

export const MAX_ZONAS_LIMPIAS = 12

const FRAGMENTOS = `
${GLSL_COMUN}

uniform vec2 uRes;       // px del lienzo
uniform float uEscala;   // px del lienzo por px CSS
uniform float uVista;    // alto de la pantalla, px CSS
uniform float uScroll;   // scroll de la página, px CSS
uniform float uInicio;   // dónde empieza la pared (el final del hero), en px de página
uniform float uP;        // cuánto se ha avanzado hacia el botón final (0..1)
uniform vec4 uZonas[${MAX_ZONAS_LIMPIAS}];   // rectángulos sin moho (x0, y0, x1, y1), px CSS de pantalla
uniform float uNZonas;
uniform vec4 uOscuro;     // la sección de noche (x0, y0, x1, y1), px CSS de pantalla
uniform float uHayOscuro;
uniform float uNoche;     // cuánto se han apagado las luces de toda la pantalla (0..1)
uniform vec2 uLuz;        // dónde apunta la linterna, px CSS de pantalla
uniform float uRadio;     // radio de la linterna, px CSS

const float UNIDAD = 820.0;   // la escala del grano: la misma que la pared del hero
float gAncho;
float gPMoho;

// 1 dentro de la sección de noche (con el borde suave), 0 fuera
float aOscuras(vec2 v) {
  if (uHayOscuro <= 0.0) return 0.0;
  // a todo el ancho; arriba y abajo, un borde corto y suave
  return smoothstep(uOscuro.y, uOscuro.y + 36.0, v.y) * (1.0 - smoothstep(uOscuro.w - 36.0, uOscuro.w, v.y));
}

// Cuánto moho hay en un punto (en unidades de página), ya restada la limpieza
float densidad(vec2 pos) {
  float x = pos.x * UNIDAD;
  float yPagina = pos.y * UNIDAD;
  float borde = min(x, gAncho - x);
  float D = exp(-borde / max(gAncho * 0.22, 170.0));                          // entra desde los bordes (en el móvil, más hacia dentro)
  float tramos = noise(vec2(pos.x * 0.7, pos.y * 1.5) + 3.0) * 0.6 + noise(pos * 4.0 + 9.0) * 0.4;
  D *= 1.9 * smoothstep(0.3, 0.68, tramos);                                    // a trozos, no una franja
  D += 1.0 * smoothstep(0.66, 0.9, noise(pos * 1.4 + 21.0));                     // manchas sueltas en medio
  float noche = smoothstep(0.9, 1.0, aOscuras(vec2(x, yPagina - uScroll))) * uNoche;   // solo donde está del todo oscuro
  D += 1.5 * noche * (0.45 + 0.55 * smoothstep(0.3, 0.7, noise(pos * 2.2 + 41.0)));   // a oscuras está todo lo que no se ve de día
  float islas = noise(pos * 3.2 + 3.0) * 0.6 + noise(pos * 8.0 + 9.0) * 0.4;
  D *= 0.3 + 1.3 * smoothstep(0.25, 0.78, islas);
  D *= smoothstep(0.0, 260.0, yPagina - uInicio);                              // nada por encima del hero
  D = min(D, 1.5);
  // Se limpia al subir por la pantalla, y cuanto más se ha bajado, menos queda
  float yPantalla = yPagina - uScroll;
  float subida = smoothstep(0.1, 0.95, 1.0 - yPantalla / uVista);
  return D - (pow(uP, 1.6) * 2.0 + subida * 0.45) * (1.0 - 0.8 * noche);
}

${GLSL_MOHO}

// 1 lejos de los bloques de texto, 0 dentro (con un margen suave)
float sinTexto(vec2 v) {
  float m = 1.0;
  for (int i = 0; i < ${MAX_ZONAS_LIMPIAS}; i++) {
    if (float(i) >= uNZonas) break;
    vec4 r = uZonas[i];
    vec2 d = max(vec2(r.x - v.x, r.y - v.y), vec2(v.x - r.z, v.y - r.w));
    float fuera = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
    m = min(m, smoothstep(-6.0, 36.0, fuera));
  }
  return m;
}

void main() {
  vec2 v = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uEscala;   // px CSS, y hacia abajo
  gAncho = uRes.x / uEscala;
  vec2 q = (v + vec2(0.0, uScroll)) / UNIDAD;                         // la pared se mueve con la página

  // La pintura, como la del hero
  vec3 col = vec3(0.929, 0.922, 0.902);
  col += (fbm(q * 90.0) - 0.5) * 0.022;
  col += (noise(q * 420.0) - 0.5) * 0.012;

  // A oscuras: la pared casi negra y, donde apunta la linterna, la pared de verdad con luz cálida.
  // La luz pasa por detrás del texto: el texto de la noche invierte su color (mix-blend-mode)
  float libre = sinTexto(v);
  float oscuro = aOscuras(v) * uNoche;                                // la franja de la noche, siempre a oscuras
  float dist = length(v - uLuz);
  float luz = 1.0 - smoothstep(uRadio * 0.15, uRadio, dist);           // la luz pasa también por detrás del texto
  float aro = exp(-pow((dist - uRadio * 0.82) / (uRadio * 0.08), 2.0)) * 0.12;

  // El moho, solo donde se ve (a oscuras y fuera de la linterna no se calcula: es lo que cuesta)
  float Dp = densidad(q);
  bool seVe = oscuro < 0.97 || luz + aro > 0.004;
  if (Dp > -0.45 && seVe) {
    col = pintarMoho(col, q, Dp, libre, 1.0);
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
    inicio: u('uInicio'), p: u('uP'), zonas: u('uZonas'), nZonas: u('uNZonas'),
    oscuro: u('uOscuro'), hayOscuro: u('uHayOscuro'), luz: u('uLuz'), radio: u('uRadio'), noche: u('uNoche')
  }
  const zonas = new Float32Array(MAX_ZONAS_LIMPIAS * 4)

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

  // rects: [{ x0, y0, x1, y1 }] en px CSS de pantalla; oscuro: el de la sección de noche (o null)
  // luz: { x, y, radio } de la linterna
  function dibujar({ scroll, inicio, p, rects = [], oscuro = null, luz = null, noche = 0 }) {
    gl.uniform1f(U.scroll, scroll)
    gl.uniform1f(U.inicio, inicio)
    gl.uniform1f(U.p, p)
    const n = Math.min(rects.length, MAX_ZONAS_LIMPIAS)
    for (let i = 0; i < n; i++) zonas.set([rects[i].x0, rects[i].y0, rects[i].x1, rects[i].y1], i * 4)
    gl.uniform4fv(U.zonas, zonas)
    gl.uniform1f(U.nZonas, n)
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
