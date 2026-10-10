// La pared de la sección de noche: la misma pared, a oscuras, y una linterna que descubre lo que hay
// (cercos de agua y moho). Va dentro de la sección (se mueve con ella); solo se calcula lo que
// alumbra la linterna, que es lo que cuesta. WebGL 1, sin librerías.
import { GLSL_COMUN, GLSL_MOHO } from './glslComun'
import { VERTICES } from './paredDanada'

const FRAGMENTOS = `
${GLSL_COMUN}

uniform vec2 uRes;       // px del lienzo
uniform float uEscala;   // px del lienzo por px CSS
uniform vec2 uLuz;       // dónde apunta la linterna, px CSS de la sección
uniform float uRadio;    // radio de la linterna, px CSS

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
  vec2 v = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uEscala;   // px CSS de la sección, y hacia abajo
  gAncho = uRes.x / uEscala;
  vec2 q = v / UNIDAD;

  float dist = length(v - uLuz);
  float luz = 1.0 - smoothstep(uRadio * 0.15, uRadio, dist);
  float aro = exp(-pow((dist - uRadio * 0.82) / (uRadio * 0.08), 2.0)) * 0.12;
  float alumbra = clamp(luz + aro, 0.0, 1.0);

  // A oscuras, casi negro; la pared (con sus daños) solo donde llega la luz
  vec3 col = vec3(0.046, 0.05, 0.06);
  if (alumbra > 0.004) {
    vec3 pared = vec3(0.929, 0.922, 0.902);
    pared += (fbm(q * 90.0) - 0.5) * 0.022;
    pared = pintarAgua(pared, q);
    float Dp = densidad(q);
    if (Dp > -0.45) pared = pintarMoho(pared, q, Dp, 1.0, 1.0);
    vec3 linterna = pared * vec3(1.0, 0.95, 0.84) * (0.7 + 0.4 * luz);
    col = mix(col, linterna, alumbra);
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

// Devuelve null sin WebGL: entonces la sección es negra, sin linterna
export function crearParedNoche(canvas) {
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
    console.warn('[pared de noche] sin shader:', e)
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
  const uEscala = gl.getUniformLocation(programa, 'uEscala')
  const uLuz = gl.getUniformLocation(programa, 'uLuz')
  const uRadio = gl.getUniformLocation(programa, 'uRadio')

  // Se pinta a 1,5× como mínimo: el grano del moho, a menos, salía en cuadraditos
  function medir() {
    const escala = Math.min(Math.max(window.devicePixelRatio || 1, 1.5), 2)
    const ancho = Math.max(1, Math.round(canvas.clientWidth * escala))
    const alto = Math.max(1, Math.round(canvas.clientHeight * escala))
    if (canvas.width !== ancho || canvas.height !== alto) {
      canvas.width = ancho
      canvas.height = alto
      gl.viewport(0, 0, ancho, alto)
    }
    gl.uniform2f(uRes, ancho, alto)
    gl.uniform1f(uEscala, ancho / Math.max(1, canvas.clientWidth))
  }

  // luz: { x, y, radio } en px CSS de la sección
  function dibujar(luz) {
    gl.uniform2f(uLuz, luz.x, luz.y)
    gl.uniform1f(uRadio, luz.radio)
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
