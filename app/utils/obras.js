// Sus trabajos reales, contados como expedientes con las fotos de su galería (public/obras, sacadas
// de su web tal cual: con sus rótulos y sus flechas, que son la documentación que prometen). Los
// textos dicen lo que se ve y lo que pone su rótulo, sin inventar sitios ni fechas. Fuera, a
// propósito: las fotos donde se ve el logo de un cliente comercial (la oficina es de una franquicia
// conocida: sin su nombre) y las que rotulan puestos de esa oficina.
// Cada foto: src, su tamaño real (ancho × alto: las pequeñas se enseñan pequeñas, sin ampliar) y su texto.

const f = (nombre, ancho, alto, texto) => ({ src: `/obras/${nombre}.jpg`, ancho, alto, texto })

export const OBRAS = [
  {
    id: 'moho-en-la-ducha',
    servicio: 'mold-remediation',
    tipo: 'Mold remediation',
    titulo: 'A leaking shower, and the mold behind the tile',
    resumen: 'Cracks in the shower tile were letting water into the wall. Behind the tile, the drywall was growing mold and a metal stud had deteriorated.',
    lugar: 'Home · master bathroom',
    pasos: [
      { titulo: 'What we found', fotos: [
        f('ducha-grietas', 1080, 1440, 'Cracks in the tile on the shower walls: where the water got in.'),
        f('ducha-moho-detras', 1080, 1440, 'Behind the tile: microbial growth on the back of the drywall.'),
        f('ducha-montante', 1080, 1440, 'A metal stud, deteriorated by the water.')
      ] },
      { titulo: 'Containment', fotos: [
        f('ducha-contencion', 1080, 1440, 'The area sealed off so spores don’t travel to the rest of the house.'),
        f('ducha-hepa-presion', 1080, 1440, 'A HEPA air scrubber keeps the room under negative pressure.')
      ] },
      { titulo: 'Removal', fotos: [
        f('ducha-pladur', 1080, 1440, 'The affected drywall comes out. The growth was on the back of it.')
      ] },
      { titulo: 'Cleaning', fotos: [
        f('ducha-hepa-paredes', 1080, 1440, 'HEPA vacuuming the walls…'),
        f('ducha-hepa-techo', 1080, 1440, '…and the ceiling of the shower area.'),
        f('ducha-antimicrobiano', 1080, 1440, 'Antimicrobial damp wipe of every surface.'),
        f('ducha-antimicrobiano-suelo', 1080, 1440, 'The floors too.'),
        f('ducha-clo2', 1080, 1440, 'ClO2 treatment of the master bedroom and bathroom area.')
      ] },
      { titulo: 'Drying', fotos: [
        f('ducha-secado', 1080, 1440, 'An air scrubber and a dehumidifier keep running while everything dries.')
      ] }
    ]
  },
  {
    id: 'despues-del-huracan',
    servicio: 'storm-damage',
    tipo: 'Storm damage',
    titulo: 'After the storm surge',
    resumen: 'When a hurricane pushes the Gulf inland, the water leaves sand and mud everywhere and the power is out for days. These photos are from several homes on the coast.',
    lugar: 'Several homes · Southwest Florida coast',
    pasos: [
      { titulo: 'What we found', fotos: [
        f('tormenta-garaje', 459, 640, 'A garage entry, still under water and sand.'),
        f('tormenta-arena', 485, 640, 'Sand and water across the floor under the house.')
      ] },
      { titulo: 'Our own power', fotos: [
        f('tormenta-generador', 361, 480, 'With the grid down, we bring a generator so the drying can start anyway.')
      ] },
      { titulo: 'Mud and water out', fotos: [
        f('tormenta-barro', 351, 480, 'Mud out first.'),
        f('tormenta-extraccion', 363, 480, 'Water extracted from the wood floors.'),
        f('tormenta-hormigon', 363, 480, 'Concrete scrubbed clean.')
      ] },
      { titulo: 'Flood cuts', fotos: [
        f('tormenta-corte', 607, 800, 'The wet drywall is cut out above the water line.'),
        f('tormenta-casa', 365, 640, 'Down to the studs, so the structure can dry.')
      ] },
      { titulo: 'Drying', fotos: [
        f('tormenta-secado', 602, 800, 'Air movers and dehumidifiers, room by room.')
      ] }
    ]
  },
  {
    id: 'oficina-comercial',
    servicio: 'water-damage',
    tipo: 'Water damage',
    titulo: 'A commercial office, dried and cleaned',
    resumen: 'Water reached the floors and the bottom of the walls of an office. Containment kept the rest of the office protected while the work was done.',
    lugar: 'Commercial office',
    pasos: [
      { titulo: 'Containment', fotos: [
        f('oficina-contencion', 481, 640, 'Plastic containment and protected floors before anything is touched.')
      ] },
      { titulo: 'Controlled cleanup', fotos: [
        f('oficina-hepa', 595, 800, 'Suited up, HEPA vacuuming.'),
        f('oficina-hepa-techo', 604, 800, 'Up to the ceiling.')
      ] },
      { titulo: 'Cleaning', fotos: [
        f('oficina-antimicrobiano', 602, 800, 'Antimicrobial damp wipe of the floors.'),
        f('oficina-hormigon', 368, 480, 'The concrete slab, cleaned with antimicrobial.')
      ] },
      { titulo: 'Drying', fotos: [
        f('oficina-deshumidificadores', 774, 1024, 'Dehumidifiers lined up, ready to go in.'),
        f('oficina-pasillo', 768, 1024, 'Drying down to the exit hallway.')
      ] }
    ]
  }
]

// El kit que va a cada trabajo (foto pequeña: se enseña pequeña)
export const KIT = f('equipo-medidores', 240, 320, 'The kit that goes to every job: moisture meters and a thermal camera.')

export const obraDe = (servicio) => OBRAS.find(o => o.servicio === servicio) || null
// Todas las fotos de una obra, en orden, con el paso al que pertenecen
export const fotosDe = (obra) => obra.pasos.flatMap((p, i) => p.fotos.map(x => ({ ...x, paso: i, nombrePaso: p.titulo })))
