# Overland Restoration 24/7: análisis de la web actual

Web actual: https://www.overlandrestoration247.com/ (revisada el 2026-10-10)

## Decisiones tomadas
- Rediseño desde cero, web distinta de Sazón.
- Nuxt, en esta carpeta aparte, con su propio git.
- Idioma de la web: inglés.
- **Es una demo para vendérsela** (2026-10-10): con su contenido público real; sin inventar reseñas (lo que falte, «a confirmar»); se publica en una URL privada sin indexar, nunca como si fuera su web oficial.
- **Alcance**: landing fuerte + una página por problema (agua, moho, fuego/humo, tormenta) y por ciudad, conservando o redirigiendo las URLs actuales para no perder Google.

- **El logo no se toca** (2026-10-10, lo decidió el usuario): se usa tal cual. La versión web que se propuso (`design/logo/propuestas.html`) queda solo como idea para más adelante.
- **Sistema de diseño: `DESIGN.md`, «Hogar en calma»** (2026-10-10, elegido por el usuario): blanco, azul de su logo, el naranja de su llama solo para llamar, Plus Jakarta Sans, tarjetas redondeadas. Sustituye al «informe de obra» (Freitag), que parecía policial.
- **Fotos** (2026-10-10, el usuario): las de su galería son las únicas imprescindibles (98, en `design/referencias/fotos-galeria-urls.txt`; hoja de muestra en `fotos-galeria.png`). Para ambiente se pueden usar fotos de banco libres o gráficos generados, **nunca presentados como su trabajo o su equipo**.

## La web (prototipo, 2026-10-10)
- **No es una web de moho**: agua, fuego y tormenta son sus servicios principales; el moho, uno más. Ese orden en todo.
- **La suciedad, solo en el hero** (la pared que se limpia con el scroll, `HeroLimpieza.vue` + `utils/paredDanada.js`). Se probó la pared de fondo por toda la página con agua, fuego, tormenta y moho (commits hasta `f6e6c05`): ensuciaba la marca y obligaba a parchear la lectura. Descartada.
- **El hero en el móvil, en dos tiempos** (2026-10-10, elegido por el usuario): primero el texto con la pared asomando; al llegar arriba, la pared se queda fija a toda pantalla y se limpia (antes compartía pantalla con el texto y se veía una franja, con las etiquetas pisándose). En el ordenador, como siempre: mitad texto, mitad pared.
- **«How we work» es una estancia que se vacía** (`ComoTrabajamos.vue` + `utils/escenaAgua.js`, 2026-10-10, elegido por el usuario tras descartar la habitación dibujada —«fea», infantil— y el parte de trabajo —una tarjeta de software, sin oficio—): a pantalla completa, pared, zócalo y suelo, y el agua en un lienzo 2D (olas, luz por dentro, burbujas, la gotera con sus ondas, el cerco en la pared). El texto de cada paso flota dentro del agua, en blanco; al vaciarse, emerge: la línea del agua lo corta (blanco debajo, oscuro encima). Pasos: el agua sube y gotea; las lecturas de humedad en la pared; el agua se va; el suelo y el cerco se secan con el aire (el medidor, 38 % → 12 %); la pintura nueva borra la marca y «Restored». La lección de los dos intentos: lo que gusta aquí es lo físico (materiales que cambian, como la pared del hero y la linterna), no los dibujos ni la interfaz.
- **Reseñas** (2026-10-10, pedido por el usuario: «ellos también tienen página de reviews»): las reales, de su widget de Trustindex (Google y Yelp), sacadas tal cual con `scripts/extraer-resenas.mjs` → `app/utils/resenasWeb.json` (27, todas de 5 estrellas: 26 de Google y 1 de Yelp; 22 con texto, 5 solo con fotos). En `app/utils/resenas.js`: la frase que se subraya de cada una y las citas que acompañan a cada promesa (literales: si una no está en su reseña, no sale). Página `/reviews` (su misma URL, ya no redirige), sección en la portada (el 5.0 con estrellas que se llenan de agua y dos cintas que corren con el scroll), una cita junto a cada valor de «Why Overland», a cada punto del seguro y en la linterna («When I called, Danny answered the phone immediately»), y la nota en la banda de confianza, el menú y el pie. La de Andre LaBau (mismo apellido que el dueño) está en la página pero no se destaca.
- **Galería = «Our work», sus trabajos como expedientes** (2026-10-10, elegido por el usuario): `/gallery` (su misma URL, ya no redirige) cuenta tres trabajos reales con sus fotos, paso a paso, y las fotos caen una a una sobre la mesa como copias impresas con el scroll (`ExpedienteObra.vue`; los datos en `app/utils/obras.js`, las fotos en `public/obras/`, 29 de sus 98). Cada página de servicio con un trabajo de su tipo lo enseña en abanico tras «How we work» (`ObraEnServicio.vue`): moho → la ducha; tormenta → la marejada del huracán; agua → la oficina. Los textos dicen lo que se ve y lo que pone su rótulo, sin inventar sitios ni fechas. Fuera, a propósito: las fotos con el logo de la oficina (una franquicia conocida) y las que rotulan sus puestos, y las capturas de pantalla, las borrosas y las repetidas. **Antes de publicar: permiso del dueño para usar sus fotos y para enseñar la oficina** (aunque no salga el nombre). Las de la tormenta son pequeñas (360–600 px): se enseñan a su tamaño, sin ampliar; si tiene los originales, mejor. No hay fotos del «después» terminado: pedírselas.
- **El dueño es Danny** (21 de las 22 reseñas con texto lo nombran; una, «owner Danny LaBau»; otras escriben «Labau» o «LeDau»): la web dice «Danny» sin apellido. Confirmar con él cómo se escribe y si quiere salir con nombre y foto.
- **Mapa de zonas en el móvil**: el mapa va antes que la lista (debajo, aún no había entrado en pantalla y la lista se quedaba apagada y el mapa sin dibujar).
- **Páginas**: portada, `/services/water-damage|fire-smoke|storm-damage|mold-remediation` (sus 21 servicios agrupados en 4), `/areas` y una por ciudad, `/faq`, `/contact`. Sus URLs de siempre redirigen (301, `routeRules` de `nuxt.config.ts`).
- **Contenido**: todo de su web, con `scripts/extraer-contenido.mjs` → `app/utils/contenidoWeb.json`; ordenado en `app/utils/contenido.js`. Su web tiene relleno publicado que se filtra: «Lorem ipsum», «(Location)», «(Company Name)» y preguntas de plantilla («What is an FAQ?») en sus páginas de ciudad. **Contárselo en la propuesta**: es un argumento más.
- El formulario de fotos es de demo (no envía).

## Rendimiento (2026-10-10, tras probarla en un móvil: «bajón de fps horrible»)
Medido con Playwright contra el build (`node .output/server/index.mjs`), en un iPhone simulado, con la GPU del PC y con swiftshader como GPU floja. Con la floja, antes → después: hero 12 → 55 fps, servicios (un tirón de 11 s) → 37, cómo trabajamos 11 → 41, linterna 2 → 60, mapa 20 → 60.
- **Shaders y Direct3D**: Chrome, Edge y Firefox en Windows traducen el WebGL a Direct3D, y su compilador desenrollaba el moho: la pared del hero tardaba **24–30 s** en compilar con la página congelada (solo la primera visita: luego el navegador lo guarda; por eso no se notaba al probarla). Arreglado: el bucle del `fbm` lleva una salida que depende de un uniform (`uCero`, siempre 0) y no se desenrolla, fuera las capas de gotera e inundación (de la pared de página entera, sin uso), y se compila en segundo plano (`utils/webgl.js`, `KHR_parallel_shader_compile`). En Direct3D va primero una versión sin las motitas (1,5 s) y la completa entra sola después (6 s). Lo nuevo con shaders, igual: medir su compilación con D3D11 (`--use-angle=d3d11`), no solo con OpenGL (0,5 s).
- **El hero en el móvil** no pinta el shader en cada fotograma: 17 fotos de la limpieza hechas en los ratos libres al cargar, que se funden con el scroll (`utils/paredCacheada.js`). En el ordenador, en vivo. Fuera de pantalla no se pinta.
- **La linterna**: la pared se calcula una vez y la luz es Canvas 2D (antes, el shader entero en cada fotograma: 2 fps). Se prepara cuatro pantallas antes de llegar.
- La estancia de «How we work», 53–55 fps con las dos GPU (la habitación de antes, 11 → 41); solo se pinta mientras se ve y hay agua o aire moviéndose; las escenas SVG de agua y tormenta, a 30 fps en pantallas táctiles; la lluvia es una capa que desliza la GPU; el hollín cuenta lo limpiado en una rejilla, sin leer píxeles; sin `backdrop-filter` en el móvil.

## Las piezas del logo
- Está hecho sobre negro. Piezas sacadas del JPG original con el negro hecho transparente (`public/logo/`: `simbolo`, `overland`, `restoration`, `lema`, `logo-transparente`). Se combinan, no se redibujan: en la cabecera de ordenador símbolo + OVERLAND + RESTORATION en horizontal; en el móvil, símbolo + OVERLAND; entero y grande, solo en el pie. Para la versión final, pedirle el archivo vectorial.

## Diagnóstico de la web actual
1. Habla de su catálogo (18 servicios iguales), no del problema del cliente. El cliente piensa en 4 cosas: agua, moho, fuego, tormenta.
2. Esconde su ventaja: el dueño hace el trabajo («I work directly with every customer»), pero no hay ni nombre ni cara.
3. Sin prueba social visible: las reseñas van en un widget vacío.
4. Texto de relleno SEO, casi igual en los 21 servicios.
5. Errores que restan credibilidad: errata del titular, enlace de Estero a Naples, dirección distinta en los datos para Google, 5 tipografías.

## Dirección propuesta al principio (histórico)
- El estilo, en `DESIGN.md`. La urgencia en el botón de llamar (barra fija en el móvil: Call 24/7 + Send photos).
- Idea abierta para el hero: en vez de moho generado, sus propias fotos (el moho detrás del pladur) que se limpian con el scroll hasta la habitación terminada, en el hero 50/50 de `DESIGN.md`. Se decide con el prototipo.
- **Efecto de firma** (idea del usuario): el hero es una pared dañada con todo lo que ellos limpian, en capas: cercos de agua y humedad, moho saliendo de un enchufe (como su foto de la galería) y hollín arriba. Con el scroll se seca y se limpia capa a capa hasta quedar impecable: el scroll es la restauración. Shader WebGL ligero, sin librerías; texto y botón limpios encima desde el principio; acaba en pantalla y media; con reduced-motion o sin WebGL, la pared limpia. Realista y sobrio, no de terror.
- Otras animaciones, solo con sentido: medidor de humedad de «WET» a «DRY» en «Cómo trabajamos», antes/después arrastrable con sus fotos, cifras al entrar en pantalla, «Available now».
- Estructura: hero → fila de confianza (licencia, 15 años, nota de Google, 24/7) → «What happened?» (4 problemas) → qué hacer ahora mismo → cómo trabajamos (con el seguro) → el dueño → trabajos reales → reseñas → zonas → FAQ (6) → formulario con fotos.

## Para pedir o buscar
- Apellido (¿LaBau?) y foto del dueño: su nombre, Danny, sale de las reseñas (buscar en Sunbiz y Thumbtack).
- Nota y reseñas reales de Google, Thumbtack y Yelp.
- Cuál de las dos direcciones es la correcta.
- Tiempo real de llegada, certificaciones (IICRC), seguro, si factura al seguro, si la inspección es gratis.
- Qué servicios le dan más dinero.
- Permiso para usar las fotos de la galería (unas 30 reales de trabajos).

## El negocio
- Restauración de daños por agua, moho, fuego y tormenta en Cape Coral y el suroeste de Florida.
- De un solo dueño, atiende 24/7, más de 15 años de experiencia.
- Teléfono 239-287-4908. Dirección: 229 SW 35th St, Cape Coral, FL 33914.
- Licencia de la Florida para remediación de moho: MRSR5117.
- Zonas: Cape Coral, Fort Myers, Lehigh Acres, North Fort Myers, Bonita Springs, Estero, San Carlos Park, Iona, Villas, Cypress Lake, Fort Myers Beach.

## Servicios que ofrece
- Daño por agua, fuego, tormenta, granizo y viento.
- Moho: inspección y pruebas, contención, remoción, secado estructural, desinfección, olores, prueba de liberación.
- Inundación, aguas negras, gran pérdida comercial, cierre y lonas, limpieza de contenidos, reconstrucción.

## Estructura actual
Una sola página larga: cabecera con teléfono, servicios, "Why Choose Us", sobre nosotros, FAQs, galería, zonas y pie. Menú: Home, Services, Reviews, FAQs, Gallery, Areas We Serve, Contact Us.

## Fallos de la web actual
- Errata en el titular ("Sourrounding").
- El enlace de Estero apunta a una URL de Naples.
- El enlace de Emergency 24/7 lleva una barra que puede romperlo.
- No hay reseñas escritas, solo enlaces a Google y Yelp.
- No hay botón de llamada fijo y visible en el móvil.
- Diseño blanco y genérico, sin sensación de urgencia ni de confianza.

## Por decidir (para analizar)
- Estilo visual y colores. Ahora hay un logo azul sobre negro con llama y gota.
- Qué páginas tendrá: una por servicio, una por zona, galería, FAQs, contacto.
- Origen de las fotos, las reseñas y el logo.
- Cómo funciona el formulario de contacto y a dónde envía.
- Dónde se aloja la web y qué dominio usa.
- SEO local: páginas por zona y por servicio.
