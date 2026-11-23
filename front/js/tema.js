// Tema claro / oscuro
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
    aplicarTema(temaActual);
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
