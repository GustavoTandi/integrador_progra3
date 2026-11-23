// Configuración del frontend, utilidades y comunicación con el back.

const CONFIG = {
  EMPRESA: 'Gaming Zone',
  LEMA: 'Consolas y videojuegos',

  // Tipos de productos
  CATEGORIAS: [
    { id: 'consola', nombre: 'Consolas', singular: 'Consola' },
    { id: 'videojuego', nombre: 'Videojuegos', singular: 'Videojuego' },
  ],

  // Cantidad de productos por página
  PRODUCTOS_POR_PAGINA: 6
};

// Con esto las rutas funcionan desde index.html y desde /pages
const RAIZ = window.location.pathname.includes('/pages/') ? '../' : '';

const PAGINAS = {
  inicio: RAIZ + 'index.html',
  productos: RAIZ + 'pages/productos.html',
  carrito: RAIZ + 'pages/carrito.html',
  ticket: RAIZ + 'pages/ticket.html',
};

/* Utilidades */

const formatoPrecio = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

function formatearPrecio(valor) {
  return formatoPrecio.format(valor);
}

function formatearFecha(fecha) {
  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' }).format(
    new Date(fecha)
  );
}

// Evita que un texto venido de la API se interprete como HTML
function escaparHTML(texto) {
  return String(texto)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function nombreCategoria(id) {
  const categoria = CONFIG.CATEGORIAS.find((c) => c.id === id);
  return categoria ? categoria.singular : id;
}

// Si una imagen no carga, se muestra el logo
document.addEventListener(
  'error',
  (evento) => {
    const imagen = evento.target;
    if (imagen.tagName !== 'IMG' || imagen.dataset.respaldo) return;
    imagen.dataset.respaldo = 'si';
    imagen.src = RAIZ + 'assets/logo-480.jpg';
  },
  true
);

/* API */

// Hace una petición a la API y devuelve el JSON. Si falla, lanza un Error con el mensaje del servidor.
async function pedirAPI(ruta, opciones = {}) {
  let respuesta;
  try {
    respuesta = await fetch(ruta, opciones);
  } catch (error) {
    const fallo = new Error(
      'No pudimos conectarnos con el servidor. Verificá que el backend esté encendido.'
    );
    throw fallo;
  }

  let resultado = null;
  try {
    resultado = await respuesta.json();
  } catch (error) {
    // La respuesta no era JSON
  }

  // fetch no lanza error con un 400 o un 500: hay que revisar respuesta.ok a mano
  if (!respuesta.ok || !resultado) {
    const fallo = new Error((resultado && resultado.mensaje) || 'Ocurrió un error inesperado.');
    fallo.estado = respuesta.status;
    fallo.errores = (resultado && resultado.errores) || [];
    throw fallo;
  }
  return resultado;
}

async function obtenerProductos({ categoria, pagina, limite }) {
  const parametros = new URLSearchParams({ categoria, pagina, limite });
  return pedirAPI(`/api/productos?${parametros}`);
}