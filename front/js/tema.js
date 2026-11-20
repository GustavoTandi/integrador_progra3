// Tema claro / oscuro. Se carga en el <head> para aplicar el tema antes de pintar la página
// (así no parpadea) y se guarda en localStorage para mantenerlo al recargar.
(function () {
  const CLAVE = 'gamingzone_tema';

  function leerTemaGuardado() {
    try {
      return localStorage.getItem(CLAVE);
    } catch (error) {
      return null;
    }
  }

  function aplicarTema(tema) {
    // Cambiar de tema es cambiar un atributo de <html>: el CSS hace el resto
    document.documentElement.dataset.tema = tema;
    const boton = document.getElementById('btn-tema');
    if (boton) {
      boton.textContent = tema === 'oscuro' ? '☀️ Tema claro' : '🌙 Tema oscuro';
    }
  }

  // El tema oscuro es el de la marca: se usa mientras el usuario no elija el claro
  let temaActual = leerTemaGuardado() === 'claro' ? 'claro' : 'oscuro';
  aplicarTema(temaActual);

  document.addEventListener('DOMContentLoaded', function () {
    aplicarTema(temaActual); // ahora que existe el botón, se le pone el texto correcto
    const boton = document.getElementById('btn-tema');
    if (!boton) return;
    boton.addEventListener('click', function () {
      temaActual = temaActual === 'oscuro' ? 'claro' : 'oscuro';
      try {
        localStorage.setItem(CLAVE, temaActual);
      } catch (error) {
        // Si el navegador bloquea localStorage, el tema igual cambia en esta visita
      }
      aplicarTema(temaActual);
    });
  });
})();
