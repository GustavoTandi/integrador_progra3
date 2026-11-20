// Sesión del cliente y carrito de compras.
// La primera parte la usan todas las pantallas; la última es la pantalla del carrito.

const CLAVES = {
  nombre: 'gamingzone_nombre',
  carrito: 'gamingzone_carrito',
  ticket: 'gamingzone_ticket',
};

// localStorage solo guarda texto: los datos se convierten a JSON al guardar y al leer
function leerStorage(clave, porDefecto) {
  try {
    const valor = localStorage.getItem(clave);
    return valor === null ? porDefecto : JSON.parse(valor);
  } catch (error) {
    return porDefecto;
  }
}

function guardarStorage(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
  } catch (error) {
    console.warn('No se pudo guardar en localStorage', error);
  }
}

/* --------------------------- Sesión del cliente -------------------------- */

const Sesion = {
  obtenerNombre() {
    return leerStorage(CLAVES.nombre, '');
  },
  guardarNombre(nombre) {
    guardarStorage(CLAVES.nombre, nombre);
  },
  obtenerTicket() {
    return leerStorage(CLAVES.ticket, null);
  },
  guardarTicket(ticket) {
    guardarStorage(CLAVES.ticket, ticket);
  },
  // El sistema "vuelve a comenzar": se borra todo menos el tema elegido
  reiniciar() {
    Object.values(CLAVES).forEach((clave) => localStorage.removeItem(clave));
  },
};

// Las pantallas de compra solo se pueden ver después de ingresar el nombre
function exigirNombre() {
  const nombre = Sesion.obtenerNombre();
  if (!nombre) {
    window.location.replace(PAGINAS.inicio);
    return null;
  }
  return nombre;
}

// Termina la visita del cliente: el autoservicio queda listo para la próxima persona
function salirDelSistema() {
  Sesion.reiniciar();
  window.location.href = CONFIG.ENCUESTA_HABILITADA ? PAGINAS.encuesta : PAGINAS.inicio;
}

/* --------------------------------- Carrito ------------------------------- */

// El carrito es una lista de { id, nombre, plataforma, categoria, precio, imagen, cantidad }
const Carrito = {
  CANTIDAD_MAXIMA: 99,

  obtener() {
    const carrito = leerStorage(CLAVES.carrito, []);
    return Array.isArray(carrito) ? carrito : [];
  },
  guardar(carrito) {
    guardarStorage(CLAVES.carrito, carrito);
    actualizarContadorCarrito();
  },
  vaciar() {
    this.guardar([]);
  },
  cantidadDe(id) {
    const item = this.obtener().find((producto) => producto.id === id);
    return item ? item.cantidad : 0;
  },
  // Si el producto ya está, suma una unidad; si no está, lo agrega con cantidad 1
  agregar(producto) {
    const carrito = this.obtener();
    const item = carrito.find((p) => p.id === producto.id);
    if (item) {
      item.cantidad = Math.min(item.cantidad + 1, this.CANTIDAD_MAXIMA);
    } else {
      carrito.push({
        id: producto.id,
        nombre: producto.nombre,
        plataforma: producto.plataforma,
        categoria: producto.categoria,
        precio: producto.precio,
        imagen: producto.imagen,
        cantidad: 1,
      });
    }
    this.guardar(carrito);
  },
  // Resta una unidad. Si llega a cero, el producto sale del carrito.
  restar(id) {
    const carrito = this.obtener();
    const item = carrito.find((p) => p.id === id);
    if (!item) return;
    item.cantidad -= 1;
    this.guardar(carrito.filter((p) => p.cantidad > 0));
  },
  quitar(id) {
    this.guardar(this.obtener().filter((p) => p.id !== id));
  },
  totalUnidades() {
    return this.obtener().reduce((suma, p) => suma + p.cantidad, 0);
  },
  // Solo para mostrar: el total real de la venta lo calcula el servidor
  totalPrecio() {
    return this.obtener().reduce((suma, p) => suma + p.precio * p.cantidad, 0);
  },
};

// Aplica sobre el carrito la acción de un botón (agregar / sumar / restar / quitar)
function aplicarAccionCarrito(accion, producto) {
  if (accion === 'agregar' || accion === 'sumar') Carrito.agregar(producto);
  if (accion === 'restar') Carrito.restar(producto.id);
  if (accion === 'quitar') Carrito.quitar(producto.id);
}

// Botones de un producto según si ya está en el carrito o no
function htmlControlesCarrito(id) {
  const cantidad = Carrito.cantidadDe(id);
  if (cantidad === 0) {
    return `<button type="button" class="btn btn--primario btn--bloque" data-accion="agregar" data-id="${id}">Agregar al carrito</button>`;
  }
  return `
    <div class="cantidad" role="group" aria-label="Cantidad">
      <button type="button" data-accion="restar" data-id="${id}" aria-label="Quitar una unidad">−</button>
      <span aria-live="polite">${cantidad}</span>
      <button type="button" data-accion="sumar" data-id="${id}" aria-label="Agregar una unidad">+</button>
    </div>
    <button type="button" class="btn btn--peligro btn--chico" data-accion="quitar" data-id="${id}">Quitar</button>`;
}

/* ------------------------ Barra de navegación ---------------------------- */

function actualizarContadorCarrito() {
  const contador = document.getElementById('nav-contador');
  if (contador) contador.textContent = Carrito.totalUnidades();
}

actualizarContadorCarrito();

// Botón "Cancelar compra" de la barra (pantallas de productos, detalle y carrito)
const botonCancelarCompra = document.getElementById('nav-cancelar');
if (botonCancelarCompra) {
  botonCancelarCompra.addEventListener('click', async () => {
    const confirmado = await mostrarModal({
      titulo: '¿Cancelar la compra?',
      mensaje: 'Se va a vaciar el carrito y vas a volver a la pantalla de bienvenida.',
      textoAceptar: 'Sí, cancelar',
      textoCancelar: 'Seguir comprando',
    });
    if (confirmado) {
      Sesion.reiniciar();
      window.location.href = PAGINAS.inicio;
    }
  });
}

/* --------------------------- Pantalla del carrito ------------------------ */

function iniciarPantallaCarrito() {
  const nombreCliente = exigirNombre();
  if (!nombreCliente) return;

  const seccionCarrito = document.getElementById('carrito');
  const seccionVacio = document.getElementById('carrito-vacio');
  const listaCarrito = document.getElementById('carrito-lista');
  const avisoError = document.getElementById('aviso-error');
  const botonFinalizar = document.getElementById('btn-finalizar');
  const botonVaciar = document.getElementById('btn-vaciar');

  function renderizarCarrito() {
    const carrito = Carrito.obtener();
    const estaVacio = carrito.length === 0;
    seccionCarrito.classList.toggle('oculto', estaVacio);
    seccionVacio.classList.toggle('oculto', !estaVacio);
    if (estaVacio) return;

    listaCarrito.innerHTML = carrito
      .map(
        (producto) => `
        <li class="carrito__item">
          <img src="${escaparHTML(urlImagen(producto.imagen))}" alt="Imagen de ${escaparHTML(producto.nombre)}">
          <div>
            <h3>${escaparHTML(producto.nombre)}</h3>
            <small>${escaparHTML(nombreCategoria(producto.categoria))} · ${escaparHTML(producto.plataforma)} · ${formatearPrecio(producto.precio)} c/u</small>
          </div>
          <div class="carrito__lado">
            <span class="carrito__subtotal">${formatearPrecio(producto.precio * producto.cantidad)}</span>
            <div class="controles">
              <div class="cantidad" role="group" aria-label="Cantidad de ${escaparHTML(producto.nombre)}">
                <button type="button" data-accion="restar" data-id="${producto.id}" aria-label="Quitar una unidad">−</button>
                <span>${producto.cantidad}</span>
                <button type="button" data-accion="sumar" data-id="${producto.id}" aria-label="Agregar una unidad">+</button>
              </div>
              <button type="button" class="btn btn--peligro btn--chico" data-accion="quitar" data-id="${producto.id}">Quitar</button>
            </div>
          </div>
        </li>`
      )
      .join('');

    document.getElementById('resumen-cliente').textContent = nombreCliente;
    document.getElementById('resumen-unidades').textContent = Carrito.totalUnidades();
    document.getElementById('resumen-total').textContent = formatearPrecio(Carrito.totalPrecio());
  }

  function mostrarError(mensaje) {
    avisoError.textContent = mensaje;
    avisoError.classList.remove('oculto');
    avisoError.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // Sumar, restar o quitar productos (delegación de eventos: un listener para toda la lista)
  listaCarrito.addEventListener('click', (evento) => {
    const boton = evento.target.closest('[data-accion]');
    if (!boton) return;
    const producto = Carrito.obtener().find((p) => p.id === Number(boton.dataset.id));
    if (!producto) return;
    aplicarAccionCarrito(boton.dataset.accion, producto);
    renderizarCarrito();
  });

  botonVaciar.addEventListener('click', async () => {
    const confirmado = await mostrarModal({
      titulo: '¿Vaciar el carrito?',
      mensaje: 'Se van a quitar todos los productos del carrito.',
      textoAceptar: 'Vaciar',
    });
    if (confirmado) {
      Carrito.vaciar();
      renderizarCarrito();
    }
  });

  // Finalizar compra: modal de confirmación → se registra la venta en el backend → ticket
  botonFinalizar.addEventListener('click', async () => {
    avisoError.classList.add('oculto');
    const carrito = Carrito.obtener();
    const unidades = Carrito.totalUnidades();

    const confirmado = await mostrarModal({
      titulo: '¿Confirmás la compra?',
      mensaje: `Vas a comprar ${unidades} ${unidades === 1 ? 'producto' : 'productos'} por un total de ${formatearPrecio(Carrito.totalPrecio())}.`,
      textoAceptar: 'Confirmar compra',
      textoCancelar: 'Revisar carrito',
    });
    if (!confirmado) return;

    botonFinalizar.disabled = true;
    botonFinalizar.textContent = 'Procesando...';

    try {
      // Se manda solo id y cantidad: los precios los pone el servidor
      const respuesta = await pedirAPI('/api/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombreCliente,
          productos: carrito.map((producto) => ({ id: producto.id, cantidad: producto.cantidad })),
        }),
      });

      // La venta se guardó: el ticket se arma con lo que confirmó el servidor
      Sesion.guardarTicket(respuesta.datos);
      Carrito.vaciar();
      window.location.href = PAGINAS.ticket;
    } catch (error) {
      // Si algún producto fue dado de baja mientras se compraba, se quita del carrito
      const noDisponibles = (error.errores || []).filter((e) => e.productoId).map((e) => e.productoId);
      if (noDisponibles.length > 0) {
        noDisponibles.forEach((id) => Carrito.quitar(id));
        renderizarCarrito();
        mostrarError('Algunos productos ya no estaban disponibles y los quitamos del carrito. Revisá tu compra y volvé a confirmar.');
      } else {
        mostrarError(error.message);
      }
      botonFinalizar.disabled = false;
      botonFinalizar.textContent = 'Finalizar compra';
    }
  });

  renderizarCarrito();
}

// Esta parte solo corre en pages/carrito.html
if (document.getElementById('carrito-lista')) iniciarPantallaCarrito();
