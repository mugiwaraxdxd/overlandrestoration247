// El avance de una escena de servicio: 0 = dañada, 1 = restaurada. Va hacia 1 mientras «activo» y
// vuelve a 0 cuando no, a su ritmo (restaurar es más lento que ensuciar). Solo corre con la escena
// a la vista; «alCuadro(t, dt)», si se pasa, se llama en cada fotograma (para las escenas animadas).
// fpsTactil: en una pantalla táctil, como mucho tantos fotogramas por segundo (una escena SVG que se
// mueve sola se repinta entera en cada uno; a 30 se ve igual de fluida y el móvil va la mitad de cargado)
export function useProgresoEscena(activo, visible, { restaurar = 2400, ensuciar = 1400, alCuadro = null, fpsTactil = 0 } = {}) {
  const t = ref(0)
  let bucle = 0
  let antes = 0
  let cadencia = 0

  function cuadro(ahora) {
    if (!visible.value) { bucle = 0; return }
    if (cadencia && antes && ahora - antes < cadencia - 4) { bucle = requestAnimationFrame(cuadro); return }
    const dt = Math.min(64, ahora - (antes || ahora))
    antes = ahora
    const meta = activo.value ? 1 : 0
    if (t.value !== meta) {
      const paso = dt / (meta ? restaurar : ensuciar)
      t.value = meta ? Math.min(1, t.value + paso) : Math.max(0, t.value - paso)
    }
    alCuadro?.(t.value, dt, ahora)
    // Sin animación propia, se para al llegar; con ella, sigue mientras se vea
    if (visible.value && (alCuadro || t.value !== meta)) bucle = requestAnimationFrame(cuadro)
    else bucle = 0
  }

  function arrancar() {
    if (bucle || typeof window === 'undefined') return
    cadencia = fpsTactil && window.matchMedia('(hover: none)').matches ? 1000 / fpsTactil : 0
    antes = 0
    bucle = requestAnimationFrame(cuadro)
  }

  watch([activo, visible], arrancar)
  onMounted(arrancar)
  onBeforeUnmount(() => cancelAnimationFrame(bucle))

  // Suavizado para pintar (el avance va lineal; la vista, con su curva)
  const suave = computed(() => t.value * t.value * (3 - 2 * t.value))
  return { t, suave }
}
