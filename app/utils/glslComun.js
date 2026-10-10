// Lo común a los shaders de las paredes: precisión, ruido (valor y fbm) y «hasta»
export const GLSL_COMUN = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

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
`

// El moho, compartido por las dos paredes (necesita «densidad(vec2)» definida antes):
// un manto difuso y moteado, de marrón a negruzco, con el borde que se deshace en motas;
// encima, motitas apiñadas y alguna peca de óxido; el papel de alrededor, amarillento.
// «deja»: 1 = el moho puede estar aquí, 0 = no (detrás del texto). «cerco»: el cerco de agua alrededor.
export const GLSL_MOHO = `
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

vec3 pintarMoho(vec3 col, vec2 q, float Dp, float deja, float cerco) {
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
  col = mix(col, col * vec3(0.89, 0.84, 0.72), aureola * 0.55 * deja);
  col = mix(col, colManto, mancha * 0.8 * deja);
  col = mix(col, negruzco, orilla * 0.28 * deja);
  float linea = exp(-pow((manto - 0.06) / 0.025, 2.0));                          // el cerco de agua que deja alrededor
  col = mix(col, vec3(0.55, 0.43, 0.27), linea * 0.45 * cerco * deja);

  // Motitas: muchas y pequeñas, irregulares, apiñadas donde hay más
  float h1, h2, h3;
  float c1 = colonias(q, 36.0, 0.85, 0.9, 0.55, 0.0, h1);
  float c2 = colonias(q, 85.0, 0.9, 1.35, 0.45, 41.0, h2);
  float c3 = colonias(q, 180.0, 0.85, 1.6, 0.3, 83.0, h3);
  float motas = max(c1 * 0.85, max(c2 * 0.8, c3 * 0.7));
  float sombra = max(h1 * 0.35, h2 * 0.25);
  vec3 colMota = mix(vec3(0.1, 0.09, 0.075), vec3(0.25, 0.2, 0.14), noise(q * 47.0));
  col = mix(col, col * vec3(0.82, 0.8, 0.74), sombra * deja);
  col = mix(col, colMota, motas * deja);

  // Pecas de óxido
  float oxido = step(0.982, noise(q * 260.0 + 5.0)) * smoothstep(0.08, 0.45, manto);
  col = mix(col, vec3(0.58, 0.36, 0.2), oxido * 0.7 * deja);
  return col;
}
`
