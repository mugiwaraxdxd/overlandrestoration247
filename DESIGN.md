# Overland Restoration 24/7 — Sistema de diseño: «Hogar en calma»

> Tu casa vuelve a estar bien. Limpio, tranquilo y de confianza; la urgencia, solo en el botón de llamar.

Sustituye al «informe de obra» (2026-10-10): la cinta amarilla y negra, las etiquetas en mono mayúscula y las anotaciones como pruebas daban un aire policial, y la pared sucia por toda la página ensuciaba la marca.

## Idea

Quien entra tiene la casa dañada y miedo. La web es **el después**: todo limpio, claro y ordenado. La suciedad existe **solo en el hero** (la pared que se limpia con el scroll); el resto de la web ya está restaurada. El tono es el de un buen profesional de confianza: cercano, claro, sin dramatismo.

## Colores

| Nombre | Valor | Token | Uso |
|---|---|---|---|
| Blanco | `#ffffff` | `--blanco` | Fondo principal, tarjetas |
| Bruma | `#f4f7fb` | `--bruma` | Bandas de sección alternas, fondo de campos |
| Línea | `#e2e8f0` | `--linea` | Bordes de tarjetas y divisores |
| Tinta | `#0f2440` | `--tinta` | Titulares y texto principal (azul noche, no negro) |
| Tinta 2 | `#475569` | `--tinta-2` | Texto secundario |
| Tinta 3 | `#64748b` | `--tinta-3` | Ayudas, pies de foto |
| Azul | `#1a64c8` | `--azul` | La marca (el agua de su logo): iconos, enlaces, detalles |
| Azul suave | `#e8f1fc` | `--azul-suave` | Fondos de iconos, etiquetas |
| Naranja | `#cf4410` | `--naranja` | **Solo llamar** (la llama de su logo). Texto blanco encima: 4,7:1 |
| Naranja (pulsado) | `#b93a0c` | `--naranja-2` | Hover del botón de llamar |
| Verde | `#16a34a` | `--verde` | «Disponible ahora», hecho, seco |
| Noche | `#0c1e36` | `--noche` | La banda del 24/7 y el pie |

## Tipografía

**Plus Jakarta Sans** (Google Fonts) para todo: amable y redondeada sin ser infantil.
- Titulares en **frase normal** (no en mayúsculas), peso 700–800, tracking −0,02em.
- Cuerpo 17px, peso 400, interlineado 1,6; nunca menos de 16px para leer.
- Cifras con `font-variant-numeric: tabular-nums`. Nada de letra de máquina (mono).

| Rol | Tamaño (móvil → escritorio) | Peso | Interlineado |
|---|---|---|---|
| display | 40 → 72px | 800 | 1.05 |
| h2 | 30 → 48px | 800 | 1.1 |
| h3 | 20 → 24px | 700 | 1.25 |
| entradilla | 18 → 20px | 400 | 1.55 |
| cuerpo | 17px | 400 | 1.6 |
| etiqueta | 14px | 600 | 1.3 |

## Forma y espacio

- Radios: **20px** tarjetas, **14px** campos e imágenes pequeñas, **píldora** botones y etiquetas.
- Sombras suaves y azuladas: `0 1px 2px rgba(15,36,64,.06), 0 10px 30px rgba(15,36,64,.08)`; al pasar el ratón, la tarjeta sube 2px.
- Ancho máximo 1200px; márgenes 20px en móvil y 32px en escritorio; secciones separadas 88–120px.

## Componentes

- **Botón de llamar**: píldora naranja, texto blanco, icono de teléfono y punto verde «disponible»; con el número en escritorio. Uno por pantalla.
- **Botón secundario**: píldora blanca con borde `--linea` y texto `--tinta` («Send photos», «Learn more»).
- **Tarjeta de servicio**: blanca, radio 20, icono en círculo azul suave, título, una línea y «Learn more →».
- **Icono**: trazo de 1,75px, puntas redondeadas, en `--azul` (un set propio: agua, fuego, tormenta, moho, teléfono, reloj, escudo, documento…).
- **Banda de confianza**: cuatro datos con su icono (24/7, 15+ años, licencia de moho, ayuda con el seguro).
- **Pasos**: numerados en círculos azules unidos por una línea.
- **Banda de noche**: fondo `--noche`, la hora real de Cape Coral y el botón de llamar.
- **Preguntas**: acordeón con bordes suaves, el «+» gira a «×».
- **Formulario**: campos de 52px, radio 14, fondo `--bruma`, etiqueta visible encima; subida de fotos.
- **Cabecera**: blanca, con el logo en su placa negra (su logo está hecho sobre negro), menú y botón de llamar; en el móvil, menú desplegable.
- **Barra del móvil**: fija abajo, «Call 24/7» (naranja) y «Send photos».

## El hero (la única suciedad)

La pared dañada (agua, moho, hollín) que se limpia con el scroll, con su medidor de humedad y las notas de lo que hay, que pasan a «hecho». Las notas y el medidor van en el estilo nuevo: tarjetas blancas redondeadas, punto naranja → verde. Termina con el sello «Restored».

## Movimiento

Suave y tranquilo: entradas al hacer scroll (subir 16px y aparecer), 400–600ms, curva `cubic-bezier(.2,.7,.2,1)`; tarjetas que suben 2px al pasar el ratón. Con `prefers-reduced-motion`, nada se anima.

## Contenido

Todo sale de su web (`INFO_WEB_ACTUAL.md`, pasado a `app/utils/contenidoWeb.json` con `scripts/extraer-contenido.mjs`): sus servicios, sus textos, sus preguntas, sus zonas. Orden: agua, fuego, tormenta y luego moho. No se inventan datos (reseñas, nombre del dueño, tiempos de llegada).

## Páginas

- `/` portada · `/services/water-damage`, `/fire-smoke`, `/storm-damage`, `/mold-remediation` · `/areas` y `/areas/[ciudad]` · `/faq` · `/contact`.
- Las URLs de su web actual redirigen a las nuevas (`routeRules` en `nuxt.config.ts`) para no perder Google.

## No

- Amarillo con negro, cintas, mono en mayúsculas, anotaciones de «prueba»: lo policial.
- Suciedad fuera del hero.
- Más de un botón naranja por pantalla, o naranja para algo que no sea llamar.
- El logo sobre blanco (va en su placa negra o sobre `--noche`).
