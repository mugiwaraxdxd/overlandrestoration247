# Overland Restoration 24/7: análisis de la web actual

Web actual: https://www.overlandrestoration247.com/ (revisada el 2026-10-10)

## Decisiones tomadas
- Rediseño desde cero, web distinta de Sazón.
- Nuxt, en esta carpeta aparte, con su propio git.
- Idioma de la web: inglés.
- **Es una demo para vendérsela** (2026-10-10): con su contenido público real; sin inventar reseñas (lo que falte, «a confirmar»); se publica en una URL privada sin indexar, nunca como si fuera su web oficial.
- **Alcance**: landing fuerte + una página por problema (agua, moho, fuego/humo, tormenta) y por ciudad, conservando o redirigiendo las URLs actuales para no perder Google.

- **El logo no se toca** (2026-10-10, lo decidió el usuario): se usa tal cual. La versión web que se propuso (`design/logo/propuestas.html`) queda solo como idea para más adelante.
- **Sistema de diseño: `DESIGN.md`** (2026-10-10, elegido por el usuario): Freitag adaptado, «informe de obra». Blanco, preciso, monocromo; sus fotos documentales de la galería como protagonistas; Amarillo obra (#ffdd00) solo para llamar y para las anotaciones; Geist + Geist Mono; el logo en una placa negra. Sustituye a la maqueta `design/logo/integracion.html` (lima para llamar y un color por servicio), que queda solo como referencia de las piezas del logo.
- **Fotos** (2026-10-10, el usuario): las de su galería son las únicas imprescindibles (98, en `design/referencias/fotos-galeria-urls.txt`; hoja de muestra en `fotos-galeria.png`). Para ambiente se pueden usar fotos de banco libres o gráficos generados, **nunca presentados como su trabajo o su equipo**.

## Las piezas del logo
- Está hecho sobre negro. Piezas sacadas del JPG original con el negro hecho transparente (`public/logo/`: `simbolo`, `overland`, `restoration`, `lema`, `logo-transparente`). Se combinan, no se redibujan: en la cabecera de ordenador símbolo + OVERLAND + RESTORATION en horizontal; en el móvil, símbolo + OVERLAND; entero y grande, solo en el pie. Para la versión final, pedirle el archivo vectorial.

## Diagnóstico de la web actual
1. Habla de su catálogo (18 servicios iguales), no del problema del cliente. El cliente piensa en 4 cosas: agua, moho, fuego, tormenta.
2. Esconde su ventaja: el dueño hace el trabajo («I work directly with every customer»), pero no hay ni nombre ni cara.
3. Sin prueba social visible: las reseñas van en un widget vacío.
4. Texto de relleno SEO, casi igual en los 21 servicios.
5. Errores que restan credibilidad: errata del titular, enlace de Estero a Naples, dirección distinta en los datos para Google, 5 tipografías.

## Dirección propuesta (pendiente de validar con el prototipo)
- El estilo, en `DESIGN.md`. La urgencia en el botón de llamar (barra fija en el móvil: Call 24/7 + Send photos).
- Idea abierta para el hero: en vez de moho generado, sus propias fotos (el moho detrás del pladur) que se limpian con el scroll hasta la habitación terminada, en el hero 50/50 de `DESIGN.md`. Se decide con el prototipo.
- **Efecto de firma** (idea del usuario): el hero es una pared dañada con todo lo que ellos limpian, en capas: cercos de agua y humedad, moho saliendo de un enchufe (como su foto de la galería) y hollín arriba. Con el scroll se seca y se limpia capa a capa hasta quedar impecable: el scroll es la restauración. Shader WebGL ligero, sin librerías; texto y botón limpios encima desde el principio; acaba en pantalla y media; con reduced-motion o sin WebGL, la pared limpia. Realista y sobrio, no de terror.
- Otras animaciones, solo con sentido: medidor de humedad de «WET» a «DRY» en «Cómo trabajamos», antes/después arrastrable con sus fotos, cifras al entrar en pantalla, «Available now».
- Estructura: hero → fila de confianza (licencia, 15 años, nota de Google, 24/7) → «What happened?» (4 problemas) → qué hacer ahora mismo → cómo trabajamos (con el seguro) → el dueño → trabajos reales → reseñas → zonas → FAQ (6) → formulario con fotos.

## Para pedir o buscar
- Nombre y foto del dueño (buscar en Sunbiz y Thumbtack).
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
