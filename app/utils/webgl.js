// Compila y enlaza un programa de WebGL sin congelar la página. Con KHR_parallel_shader_compile
// (Chrome, Edge, Firefox, Safari reciente) el navegador compila aparte y aquí solo se pregunta cada
// 50 ms si ya terminó: el moho, traducido a Direct3D en Chrome de Windows, tarda segundos. Sin la
// extensión, como siempre (espera al pedir el estado). Devuelve una promesa con el programa; falla
// si no compila o se pierde el contexto.
export function enlazarPrograma(gl, vertices, fragmentos) {
  const programa = gl.createProgram()
  const partes = [[gl.VERTEX_SHADER, vertices], [gl.FRAGMENT_SHADER, fragmentos]].map(([tipo, fuente]) => {
    const s = gl.createShader(tipo)
    gl.shaderSource(s, fuente)
    gl.compileShader(s)
    gl.attachShader(programa, s)
    return s
  })
  gl.linkProgram(programa)
  const paralelo = gl.getExtension('KHR_parallel_shader_compile')

  return new Promise((ok, mal) => {
    function comprobar() {
      if (gl.isContextLost()) return mal(new Error('se perdió el contexto de WebGL'))
      if (paralelo && !gl.getProgramParameter(programa, paralelo.COMPLETION_STATUS_KHR)) {
        setTimeout(comprobar, 50)
        return
      }
      if (!gl.getProgramParameter(programa, gl.LINK_STATUS)) {
        const error = partes.map(s => gl.getShaderInfoLog(s)).join('\n') + gl.getProgramInfoLog(programa)
        partes.forEach(s => gl.deleteShader(s))
        gl.deleteProgram(programa)
        mal(new Error(error))
        return
      }
      partes.forEach(s => gl.deleteShader(s))   // siguen dentro del programa hasta que se borre
      ok(programa)
    }
    comprobar()
  })
}
