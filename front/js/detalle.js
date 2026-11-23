const nombreClienteDetalle = exigirNombre();

const contenedorDetalle = document.getElementById('detalle');
const avisoErrorDetalle = document.getElementById('aviso-error');
let productoActual = null;

function mostrarErrorDetalle(mensaje) {
  avisoErrorDetalle.textContent = mensaje;
  avisoErrorDetalle.classList.remove('oculto');
}

function renderizarDetalle() {
  const p = productoActual;
  document.title = `${p.nombre} · ${CONFIG.EMPRESA}`;
  contenedorDetalle.innerHTML = `
    <div class="detalle__imagen">
      <img src="${escaparHTML(p.imagen)}" alt="Imagen de ${escaparHTML(p.nombre)}">
    </div>
    <div class="detalle__datos tarjeta">
      <span class="insignia insignia--plataforma" style="width: fit-content">${escaparHTML(nombreCategoria(p.categoria))}</span>
      <h1>${escaparHTML(p.nombre)}</h1>
      <dl class="detalle__ficha">
        <dt>Tipo</dt><dd>${escaparHTML(nombreCategoria(p.categoria))}</dd>
        <dt>Código</dt><dd>#${p.id}</dd>
      </dl>
      <span class="detalle__precio">${formatearPrecio(p.precio)}</span>
      <div class="controles" id="controles-detalle">${htmlControlesCarrito(p.id)}</div>
      <a class="btn btn--secundario" href="carrito.html">Ir al carrito</a>
    </div>`;
}

async function cargarDetalle() {
  const id = Number(new URLSearchParams(window.location.search).get('id'));
  if (!Number.isInteger(id) || id <= 0) {
    mostrarErrorDetalle('El producto que buscás no existe.');
    return;
  }

  try {
    const respuesta = await pedirAPI(`/api/productos/${id}`);
    productoActual = respuesta.datos;
    renderizarDetalle();
  } catch (error) {
    mostrarErrorDetalle(
      error.estado === 404 ? 'El producto que buscás no existe o ya no está disponible.' : error.message
    );
  }
}

contenedorDetalle.addEventListener('click', (evento) => {
  const boton = evento.target.closest('[data-accion]');
  if (!boton || !productoActual) return;
  aplicarAccionCarrito(boton.dataset.accion, productoActual);
  document.getElementById('controles-detalle').innerHTML = htmlControlesCarrito(productoActual.id);
});

if (nombreClienteDetalle) cargarDetalle();
