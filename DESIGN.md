# Overland Restoration 24/7 — Sistema de diseño

> Un informe de obra: blanco, preciso y honrado. Las fotos de sus trabajos son la prueba; el amarillo de obra, la única señal.

**Tema:** claro, con una sola sección oscura (la noche, el 24/7) y el pie.
**Base:** [Freitag](https://styles.refero.design/style/d75a643b-a518-4550-b430-679cd989a447) (catálogo industrial suizo), adaptado a un servicio de emergencias: con un color de acción, letra más grande y la cara del dueño.

## Idea

La web es el expediente de un trabajo bien hecho. Su argumento es «No shortcuts, ever» y sus fotos lo demuestran: contención con plástico, presión negativa, filtros HEPA, el moho detrás del pladur, todo anotado en amarillo. La interfaz se calla (blanco, negro y grises, rejilla estricta, mayúsculas) para que hablen las fotos y los datos: la licencia, la humedad en %, las horas, los años. El cliente que entra tiene miedo de que le engañen; el perito del seguro quiere documentación. A los dos les convence lo mismo: precisión.

El logo (arcoíris sobre negro, no se toca) vive en una **placa negra**, como la pegatina de su furgoneta: es lo único multicolor de la web.

## Colores

| Nombre | Valor | Token | Uso |
|---|---|---|---|
| Papel | `#ffffff` | `--papel` | Fondo de la página, tarjetas, fondo de las fotos |
| Niebla | `#f1f1f1` | `--niebla` | Bandas de sección alternas y estados inactivos. Nunca el fondo general |
| Hormigón | `#cacaca` | `--hormigon` | Líneas de 1px: la rejilla de los trabajos, divisores, bordes de los campos |
| Hierro | `#404040` | `--hierro` | Reglas de sección, subtítulos |
| Ceniza | `#616161` | `--ceniza` | Texto secundario, ayudas (6,2:1 sobre papel) |
| Carbón | `#0a0a0a` | `--carbon` | Texto principal, iconos, botón secundario relleno, la sección de noche, el pie |
| Placa | `#000000` | `--placa` | Solo la placa del logo (su logo está hecho sobre negro puro) |
| Amarillo obra | `#ffdd00` | `--obra` | **La acción**: el botón de llamar. Y las anotaciones sobre fotos y datos. Nada más |
| Amarillo obra (pulsado) | `#f0c800` | `--obra-pulsado` | Hover y pulsado del botón de llamar |
| Seco | `#16a34a` | `--seco` | Funcional y mínimo: el punto «Available now» y el estado «seco» del medidor de humedad |

Texto sobre amarillo: siempre Carbón (15:1). Nunca texto amarillo sobre blanco.

## Tipografía

- **Geist** (Google Fonts) para todo el texto: es la neo-grotesca libre más cercana al Akkurat de Freitag.
  - Titulares en **mayúsculas, peso 500**, interlineado 0,95, tracking −0,01em. La jerarquía la dan el tamaño y las mayúsculas, no la negrita.
  - Cuerpo en peso 400, 17px, interlineado 1,55. **Nunca menos de 16px** para leer: el cliente puede tener 70 años y estar nervioso.
- **Geist Mono** para los datos del informe: la licencia, los porcentajes de humedad, el código de un trabajo («JOB 0247 · CAPE CORAL»), las horas, las etiquetas. Mayúsculas, 12–14px, tracking +0,06em.

| Rol | Familia | Peso | Tamaño (móvil → escritorio) | Interlineado | Tracking |
|---|---|---|---|---|---|
| display | Geist | 500 | 44 → 96px | 0.95 | −0.01em, mayúsculas |
| heading | Geist | 500 | 32 → 56px | 1.0 | −0.01em, mayúsculas |
| subheading | Geist | 500 | 20 → 24px | 1.25 | normal |
| body | Geist | 400 | 17px | 1.55 | normal |
| body-sm | Geist | 400 | 16px | 1.5 | normal |
| dato | Geist Mono | 500 | 14px | 1.3 | +0.06em, mayúsculas |
| etiqueta | Geist Mono | 500 | 12px | 1.2 | +0.06em, mayúsculas |
| teléfono | Geist Mono | 600 | 18 → 22px | 1 | +0.02em |

## Espacio y forma

- Unidad 4px. Escala: 4, 8, 12, 16, 20, 24, 32, 48, 64, 80, 120.
- Ancho máximo 1440px; margen lateral 16px en móvil, 32px en escritorio; rejilla de 12 columnas.
- Separación entre secciones: 80–120px. Dentro de un bloque: 12–24px.
- Radios, solo tres: **9999px** para lo que se pulsa (botones, etiquetas); **12px** para fotos sueltas, campos y la placa del logo; **0** para las celdas de la rejilla de trabajos.

## Elevación

Plano. Las separaciones son líneas de 1px Hormigón y el contraste Papel/Niebla. Solo dos cosas flotan:
- El botón de llamar: `rgba(0,0,0,.12) 2px 2px 10px`.
- La barra fija del móvil: `rgba(0,0,0,.10) 0 -4px 16px`.

## Componentes

### Cabecera
Blanca, fija, con una línea de 1px abajo. A la izquierda, la **placa del logo**: rectángulo negro de 12px de radio con su logo dentro (en escritorio símbolo + OVERLAND + RESTORATION en horizontal; en móvil símbolo + OVERLAND). Enlaces en mayúsculas 13px Ceniza (Carbón al pasar). A la derecha, el botón de llamar con el teléfono.

### Botón de llamar (el único botón de acción)
Píldora Amarillo obra, texto Carbón, Geist 500 15px (el número en Geist Mono 600), 14×22px de relleno, la sombra de arriba, punto Seco de «disponible ahora» delante. Siempre con el número a la vista en escritorio. **Uno por pantalla.**

### Botón secundario
Píldora transparente con borde 1px Carbón y texto Carbón; sobre oscuro, borde y texto blancos. «Send photos of the damage», «See the job», etc.

### Anotación
La firma del sistema, tomada de las notas amarillas de sus fotos: una etiqueta Amarillo obra con texto Carbón en Geist Mono 12px mayúsculas, unida a lo que señala por una línea fina Carbón de 1px con un punto al final. Se usa sobre fotos («HEPA AIR SCRUBBER · NEGATIVE PRESSURE»), en el hero y junto a los datos. Como mucho tres por pantalla.

### Etiqueta
Píldora blanca con borde 1px Carbón, Geist Mono 12px mayúsculas: «LICENSED · MRSR5117», «INSURANCE CLAIM», «MOLD». Sobre fotos, abajo a la derecha.

### Banda de datos
Fila de cifras en Geist Mono separadas por líneas verticales de 1px: «24/7», «15+ YEARS», «LIC. MRSR5117», la nota de Google (cuando sea real). Debajo de cada una, su etiqueta en Ceniza.

### Ficha de trabajo
Celda de la rejilla (bordes 1px Hormigón compartidos, sin radio ni sombra): foto 3:4 a sangre arriba (las suyas son verticales), debajo el código en Geist Mono («JOB · CAPE CORAL · MOLD»), el título y los pasos que se hicieron en etiquetas pequeñas. Al tocarla, el expediente: las fotos en orden con sus anotaciones.

### Pasos (cómo trabajamos)
Lista numerada 01–05 en Geist Mono, cada paso separado por una regla de 1px Hierro, con el título en mayúsculas y dos líneas de texto. A un lado, el medidor de humedad.

### Medidor de humedad
Lectura grande en Geist Mono («38%») que baja con el scroll hasta «12%»; la etiqueta pasa de «WET» (anotación amarilla) a «DRY» (punto Seco). Es un dato real de su trabajo, no un adorno.

### Problemas («What happened?»)
Cuatro celdas en rejilla (Water, Fire, Mold, Storm), cada una con una foto de su galería o de ambiente, el nombre en mayúsculas y una línea. Sin colores por servicio: el color lo ponen las fotos.

### Barra fija del móvil
Abajo, siempre visible: «Call 24/7» (Amarillo obra) y «Send photos» (Carbón), 52px de alto, 12px de radio entre ellos, con zona segura del iPhone.

### Sección de noche
La única sección oscura: fondo Carbón, «It's 2 a.m. and there's water on the floor.» en display blanco, el botón de llamar. Cuenta el 24/7.

### Pie
Fondo Carbón. Aquí, y solo aquí, el logo entero y grande. Dirección, teléfono, horario, licencia, zonas, redes.

### Campos del formulario
Borde 1px Hormigón, radio 12px, 52px de alto, etiqueta visible encima (nunca solo el placeholder), foco con borde Carbón de 2px. El campo de fotos admite varias imágenes.

## Fotos

- **Sus fotos no son la base del diseño** (2026-10-10, el usuario: están mal tiradas y poco cuidadas). La imagen principal es generada: la pared dañada del hero (`app/utils/paredDanada.js`), que se limpia con el scroll.
- Las de su galería, como mucho en la sección de trabajos, solo las pocas que se salven: tal cual (recortadas), con sus anotaciones amarillas. Formato vertical 3:4, a sangre en su celda.
- **Fotos de banco o gráficos generados**, solo de ambiente (cielo de huracán, agua, una casa de Florida, una textura), y **nunca presentados como su trabajo ni su equipo**.
- Nada de familias felices de banco, ni técnicos sonrientes de banco, ni ilustraciones o 3D.
- El dueño, con su foto real (pendiente de conseguir).

## Movimiento

Mecánico y preciso, como un instrumento: nada que rebote.
- Curva `cubic-bezier(.2, .7, .2, 1)`, 200–400ms para la interfaz; las entradas al hacer scroll, con desplazamiento corto (12–24px) y opacidad.
- La firma: el hero que se limpia con el scroll. El medidor de humedad que baja. Las anotaciones que se dibujan (la línea crece y aparece la etiqueta).
- Con `prefers-reduced-motion`, todo en su estado final, sin animar.

## Composición

- Todo alineado a la izquierda; nada de párrafos centrados.
- Hero dividido 50/50 sin separación: la costura entre las dos mitades es el diseño (como en Freitag), y ahí vive el efecto de limpiar.
- Los trabajos, en rejilla con líneas de 1px (2 columnas en móvil, 4 en escritorio).
- «Cómo trabajamos» y el dueño, en zigzag: texto a un lado, foto al otro.
- Bandas Papel y Niebla alternas; una sola sección oscura.

## Tono del texto

Directo, en primera persona del dueño cuando hable de él, con datos concretos. Frases cortas. Nada de relleno («efficiently», «safely», «state-of-the-art»). Si no se sabe un dato, no se inventa.

## Sí

- Amarillo obra solo para llamar y para anotar.
- Los datos (licencia, humedad, años, horas) en Geist Mono.
- Titulares en mayúsculas, peso 500, grandes.
- Las fotos de su galería con sus anotaciones.
- El teléfono siempre a un toque en el móvil.
- El logo solo dentro de la placa negra o sobre Carbón.

## No

- Un segundo color de acción, degradados o colores por servicio.
- Negritas 700+ en los titulares.
- Sombras en tarjetas o fotos.
- El logo sobre blanco, redibujado o deformado.
- Texto de menos de 16px para leer (las etiquetas mono de 12px no son texto de lectura).
- Fotos de banco presentadas como trabajos o equipo suyos.
- Más de un botón amarillo por pantalla.

## Arranque rápido

```css
:root {
  --papel: #ffffff;
  --niebla: #f1f1f1;
  --hormigon: #cacaca;
  --hierro: #404040;
  --ceniza: #616161;
  --carbon: #0a0a0a;
  --placa: #000000;
  --obra: #ffdd00;
  --obra-pulsado: #f0c800;
  --seco: #16a34a;

  --fuente: 'Geist', system-ui, sans-serif;
  --fuente-datos: 'Geist Mono', ui-monospace, monospace;

  --radio-pildora: 9999px;
  --radio: 12px;

  --curva: cubic-bezier(.2, .7, .2, 1);
  --sombra-accion: 2px 2px 10px rgba(0, 0, 0, .12);
}
```
