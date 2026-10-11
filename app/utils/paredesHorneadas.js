// Las paredes ya pintadas (las hornea scripts/hornear-paredes.mjs en public/paredes/): lo que la
// web necesita saber de ellas para enseñarlas y lo que el script necesita para hacerlas.

// La limpieza del hero, para las pantallas táctiles: «cuadros» fotos de p = 0 a 1, verticales.
// «enchufe» en coordenadas de la imagen (x de 0 a 1 desde la izquierda, y de 0 a 1 desde abajo)
export const PARED_HERO = {
  cuadros: 16,
  ancho: 880,
  alto: 1320,
  enchufe: [0.36, 0.24],
  archivo: (i) => `/paredes/hero-${String(i).padStart(2, '0')}.webp`
}

// La pared de la linterna: una ancha (ordenador) y una alta (móvil). «escala»: px de la imagen por
// px CSS de la pantalla para la que se hace (el grano del moho se mide en px CSS)
export const PAREDES_NOCHE = [
  { archivo: '/paredes/noche-ancha.webp', ancho: 1920, alto: 1200, escala: 1.25 },
  { archivo: '/paredes/noche-alta.webp', ancho: 900, alto: 1900, escala: 2.1 }
]

// Dónde y a qué escala se ve una imagen de proporción «aspecto» (ancho / alto) que cubre una caja
// de «ancho» × «alto» px: centrada a lo ancho y apoyada abajo (el zócalo y el suelo no se cortan).
// Devuelve { x, y, w, h }: la imagen entera en coordenadas de la caja (x e y pueden ser negativas)
export function cubrir(aspecto, ancho, alto) {
  if (ancho / alto > aspecto) {
    const h = ancho / aspecto
    return { x: 0, y: alto - h, w: ancho, h }
  }
  const w = alto * aspecto
  return { x: (ancho - w) / 2, y: 0, w, h: alto }
}
