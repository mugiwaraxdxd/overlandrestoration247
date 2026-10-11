<script setup>
// Los iconos de la web: trazo de 1,75 px y puntas redondeadas (DESIGN.md), dibujados en 24×24
const props = defineProps({ nombre: { type: String, required: true } })

const ICONOS = {
  agua: 'M12 3.5c3.4 4.1 6 7.3 6 10.4a6 6 0 0 1-12 0c0-3.1 2.6-6.3 6-10.4z M9.2 14.6a2.9 2.9 0 0 0 2.6 2.7',
  fuego: 'M12 3c.6 3.1 4.6 5 4.6 9.6a4.6 4.6 0 0 1-9.2 0c0-1.9.8-3.2 1.8-4.2.2 1.6 1 2.5 2.1 3C10.8 9 11.3 5.8 12 3z M12 20.2a2.2 2.2 0 0 1-2.2-2.2c0-1.4 1.2-2.2 2.2-3.6 1 1.4 2.2 2.2 2.2 3.6a2.2 2.2 0 0 1-2.2 2.2z',
  tormenta: 'M7 16.5h9.5a4 4 0 0 0 .5-8 5.5 5.5 0 0 0-10.6 1.6A3.3 3.3 0 0 0 7 16.5z M10.5 19l1.2-2 M14 21l1.2-2 M7.5 21l1.2-2',
  moho: 'M8 10.5a2 2 0 1 0 0-.01 M14 7a2.4 2.4 0 1 0 0-.01 M16.8 13.2a1.6 1.6 0 1 0 0-.01 M11 16a2.8 2.8 0 1 0 0-.01 M5.5 15.8a1.2 1.2 0 1 0 0-.01 M17.5 18.5a1 1 0 1 0 0-.01',
  telefono: 'M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25c1.1.37 2.3.57 3.6.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z',
  reloj: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3 2',
  escudo: 'M12 3l7 3v5.5c0 4.4-3 8-7 9.5-4-1.5-7-5.1-7-9.5V6z M9 12l2 2 4-4',
  documento: 'M7 3h7l4 4v14H7z M14 3v4h4 M10 12h5 M10 16h5',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  estrella: 'M12 3.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.8l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z',
  etiqueta: 'M3.5 12.5V4.5h8l9 9-8 8z M8 8.5a.5.5 0 1 0 0-.01',
  persona: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4.5 20.5a7.5 7.5 0 0 1 15 0',
  camara: 'M4 8h3l2-3h6l2 3h3v11H4z M12 10.5a3.3 3.3 0 1 0 0 6.6 3.3 3.3 0 0 0 0-6.6z',
  medidor: 'M4 15a8 8 0 0 1 16 0 M12 15l4-5 M7 19h10',
  buscar: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z M20 20l-4-4',
  aire: 'M3 9h11a3 3 0 1 0-3-3 M3 13h15a3 3 0 1 1-3 3 M3 17h6',
  casa: 'M4 11l8-7 8 7 M6 9.5V20h12V9.5 M10 20v-5h4v5',
  pin: 'M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z M12 12.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4z',
  flecha: 'M5 12h14 M13 6l6 6-6 6',
  menu: 'M4 7h16 M4 12h16 M4 17h16',
  cerrar: 'M6 6l12 12 M18 6L6 18',
  mas: 'M12 5v14 M5 12h14',
  correo: 'M3.5 6.5h17v11h-17z M4 7l8 6 8-6'
}

const d = computed(() => ICONOS[props.nombre] || '')
</script>

<template>
  <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <path :d="d" />
  </svg>
</template>
