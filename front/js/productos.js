// Pantalla de productos: dos categorías, paginación y botones para agregar / quitar del carrito.

const nombreCliente = exigirNombre();

const contenedorPestanias = document.getElementById('pestanias');
const contenedorProductos = document.getElementById('productos');
const contenedorPaginacion = document.getElementById('paginacion');
const avisoError = document.getElementById('aviso-error');
const avisoLocal = document.getElementById('aviso-local');
const barraCarrito = document.getElementById('barra-carrito');
const barraResumen = document.getElementById('barra-resumen');

// Se recuerda la categoría y la página para volver al mismo lugar desde el detalle o el carrito
const CLAVE_VISTA = 'gamingzone_vista';
let vista = { categoria: CONFIG.CATEGORIAS[0].id, pagina: 1 };
try {
  const guardada = JSON.parse(sessionStorage.getItem(CLAVE_VISTA));
  if (guardada && CONFIG.CATEGORIAS.some((c) => c.id === guardada.categoria)) vista = guardada;
} catch (error) {
  // Se usa la vista por defecto
}

const productosEnPantalla = new Map(); // id → producto

function mostrarError(mensaje) {
  contenedorProductos.innerHTML = '';
  contenedorPaginacion.innerHTML = '';
  avisoError.innerHTML = `${escaparHTML(mensaje)} <button type="button" class="btn btn--secundario btn--chico" id="btn-reintentar">Reintentar</button>`;
  avisoError.classList.remove('oculto');
  document.getElementById('btn-reintentar').addEventListener('click', () => {
    avisoError.classList.add('oculto');
    cargarProductos();
  });
}

function renderizarPestanias() {
  contenedorPestanias.innerHTML = CONFIG.CATEGORIAS.map(
    (categoria) => `
      <button type="button" role="tab" class="pestania ${categoria.id === vista.categoria ? 'pestania--activa' : ''}"
        aria-selected="${categoria.id === vista.categoria}" data-categoria="${categoria.id}">
        ${categoria.nombre}
      </button>`
  ).join('');
}

// Pide una página de productos activos de la categoría elegida.
// La paginación la resuelve el backend: el navegador nunca recibe todos los productos juntos.
async function cargarProductos() {
  sessionStorage.setItem(CLAVE_VISTA, JSON.stringify(vista));

  try {
    const respuesta = await obtenerProductos({
      categoria: vista.categoria,
      pagina: vista.pagina,
      limite: CONFIG.PRODUCTOS_POR_PAGINA,
    });
    const { datos, paginacion } = respuesta;

    // Si la página guardada ya no existe (por ejemplo, se dio de baja un producto), se va a la última
    if (datos.length === 0 && paginacion.pagina > paginacion.totalPaginas) {
      vista.pagina = paginacion.totalPaginas;
      return cargarProductos();
    }

    avisoError.classList.add('oculto');
    avisoLocal.classList.toggle('oculto', !respuesta.local);
    renderizarProductos(datos);
    renderizarPaginacion(paginacion);
  } catch (error) {
    mostrarError(error.message);
  }
}

function renderizarProductos(productos) {
  productosEnPantalla.clear();
  productos.forEach((producto) => productosEnPantalla.set(producto.id, producto));

  if (productos.length === 0) {
    contenedorProductos.innerHTML = '<p class="vacio">No hay productos disponibles en esta categoría.</p>';
    return;
  }

  contenedorProductos.innerHTML = productos
    .map(
      (producto) => `
      <article class="producto ${Carrito.cantidadDe(producto.id) > 0 ? 'producto--en-carrito' : ''}" data-producto="${producto.id}">
        <a class="producto__imagen" href="detalle.html?id=${producto.id}">
          <img src="${escaparHTML(urlImagen(producto.imagen))}" alt="Imagen de ${escaparHTML(producto.nombre)}" loading="lazy">
        </a>
        <div class="producto__cuerpo">
          <span class="producto__marca">
            ${escaparHTML(nombreCategoria(producto.categoria))}
            <span class="insignia insignia--plataforma">${escaparHTML(producto.plataforma)}</span>
          </span>
          <h3 class="producto__nombre">${escaparHTML(producto.nombre)}</h3>
          <p class="producto__descripcion">${escaparHTML(producto.descripcion)}</p>
          <div class="producto__pie">
            <span class="producto__precio">${formatearPrecio(producto.precio)}</span>
            <a class="producto__detalle" href="detalle.html?id=${producto.id}">Ver detalle</a>
          </div>
          <div class="controles" data-controles="${producto.id}">${htmlControlesCarrito(producto.id)}</div>
        </div>
      </article>`
    )
    .join('');
}

function renderizarPaginacion({ pagina, totalPaginas }) {
  if (totalPaginas <= 1) {
    contenedorPaginacion.innerHTML = '';
    return;
  }

  let botones = `<button type="button" class="btn btn--secundario" data-pagina="${pagina - 1}" ${pagina === 1 ? 'disabled' : ''}>Anterior</button>`;
  for (let numero = 1; numero <= totalPaginas; numero++) {
    botones += `<button type="button" class="btn btn--secundario paginacion__pagina ${numero === pagina ? 'paginacion__pagina--actual' : ''}"
      data-pagina="${numero}" ${numero === pagina ? 'aria-current="page"' : ''} aria-label="Página ${numero}">${numero}</button>`;
  }
  botones += `<button type="button" class="btn btn--secundario" data-pagina="${pagina + 1}" ${pagina === totalPaginas ? 'disabled' : ''}>Siguiente</button>`;
  contenedorPaginacion.innerHTML = botones;
}

function actualizarBarraCarrito() {
  const unidades = Carrito.totalUnidades();
  barraCarrito.classList.toggle('oculto', unidades === 0);
  barraResumen.innerHTML = `<strong>${unidades}</strong> ${unidades === 1 ? 'producto' : 'productos'} en el carrito · <strong>${formatearPrecio(Carrito.totalPrecio())}</strong>`;
}

/* -------------------------------- Eventos -------------------------------- */

// Cambio de categoría: siempre se vuelve a la página 1
contenedorPestanias.addEventListener('click', (evento) => {
  const pestania = evento.target.closest('[data-categoria]');
  if (!pestania || pestania.dataset.categoria === vista.categoria) return;
  vista = { categoria: pestania.dataset.categoria, pagina: 1 };
  renderizarPestanias();
  cargarProductos();
});

// Cambio de página
contenedorPaginacion.addEventListener('click', (evento) => {
  const boton = evento.target.closest('[data-pagina]');
  if (!boton || boton.disabled) return;
  vista.pagina = Number(boton.dataset.pagina);
  cargarProductos().then(() => {
    contenedorPestanias.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// Agregar, sumar, restar o quitar del carrito.
// Delegación de eventos: las tarjetas se crean después de pedir los productos, así que
// el listener va en el contenedor y no en cada botón.
contenedorProductos.addEventListener('click', (evento) => {
  const boton = evento.target.closest('[data-accion]');
  if (!boton) return;
  const producto = productosEnPantalla.get(Number(boton.dataset.id));
  if (!producto) return;

  aplicarAccionCarrito(boton.dataset.accion, producto);

  // Solo se vuelve a dibujar la tarjeta que cambió
  const tarjeta = contenedorProductos.querySelector(`[data-producto="${producto.id}"]`);
  tarjeta.querySelector('[data-controles]').innerHTML = htmlControlesCarrito(producto.id);
  tarjeta.classList.toggle('producto--en-carrito', Carrito.cantidadDe(producto.id) > 0);
  actualizarBarraCarrito();
});

/* --------------------------------- Inicio -------------------------------- */

if (nombreCliente) {
  document.getElementById('saludo').textContent = `Hola, ${nombreCliente}`;
  renderizarPestanias();
  cargarProductos();
  actualizarBarraCarrito();
}
