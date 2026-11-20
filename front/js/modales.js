// Modal reutilizable para confirmar acciones y mostrar mensajes.

// Muestra un modal y devuelve una promesa: true si se aceptó, false si se canceló.
// Uso:  const confirmado = await mostrarModal({ titulo, mensaje });
// Con textoCancelar vacío el modal tiene un solo botón (sirve para mensajes).
function mostrarModal({ titulo, mensaje, textoAceptar = 'Confirmar', textoCancelar = 'Cancelar' }) {
  return new Promise((resolver) => {
    const fondo = document.createElement('div');
    fondo.className = 'modal-fondo';
    fondo.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-titulo">
        <h2 id="modal-titulo">${escaparHTML(titulo)}</h2>
        <p>${escaparHTML(mensaje)}</p>
        <div class="modal__acciones">
          ${textoCancelar ? `<button type="button" class="btn btn--secundario" data-modal="cancelar">${escaparHTML(textoCancelar)}</button>` : ''}
          <button type="button" class="btn btn--primario" data-modal="aceptar">${escaparHTML(textoAceptar)}</button>
        </div>
      </div>`;

    function cerrar(resultado) {
      document.removeEventListener('keydown', alPresionarTecla);
      fondo.remove();
      resolver(resultado);
    }
    function alPresionarTecla(evento) {
      if (evento.key === 'Escape') cerrar(false);
    }

    fondo.addEventListener('click', (evento) => {
      if (evento.target === fondo) return cerrar(false); // clic afuera del modal
      const boton = evento.target.closest('[data-modal]');
      if (boton) cerrar(boton.dataset.modal === 'aceptar');
    });
    document.addEventListener('keydown', alPresionarTecla);

    document.body.appendChild(fondo);
    fondo.querySelector('[data-modal="aceptar"]').focus();
  });
}
