// Cuánto se ha limpiado la página camino del botón final (0..1): lo escribe la pared de la
// página y lo leen la barra de la cabecera y el sello del final
const progresoPagina = ref(0)

export function useLimpieza() {
  return { progresoPagina }
}
