// Configuración del frontend, utilidades compartidas y comunicación con el backend.

const CONFIG = {
  EMPRESA: 'Gaming Zone',
  LEMA: 'Consolas y videojuegos',

  // Los dos tipos de productos que vende la tienda
  CATEGORIAS: [
    { id: 'consola', nombre: 'Consolas', singular: 'Consola' },
    { id: 'videojuego', nombre: 'Videojuegos', singular: 'Videojuego' },
  ],

  // Cantidad de productos por página en la pantalla de productos
  PRODUCTOS_POR_PAGINA: 6,

  // Requerimiento extra de final: al salir del ticket se pasa por la pantalla de encuesta.
  // En false, el botón "Salir" vuelve directo a la bienvenida.
  ENCUESTA_HABILITADA: false,
};

// index.html está en la raíz y el resto de las pantallas en /pages: con esto las rutas
// funcionan desde cualquiera de los dos lugares.
const RAIZ = window.location.pathname.includes('/pages/') ? '../' : '';

const PAGINAS = {
  inicio: RAIZ + 'index.html',
  productos: RAIZ + 'pages/productos.html',
  carrito: RAIZ + 'pages/carrito.html',
  ticket: RAIZ + 'pages/ticket.html',
  encuesta: RAIZ + 'pages/encuesta.html',
};

/* ------------------------------ Utilidades ------------------------------ */

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

// Evita que un texto venido de la API se interprete como HTML (protección contra XSS)
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

// Si una imagen no carga (por ejemplo, sin conexión con el backend), se muestra el logo
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

/* --------------------------------- API ---------------------------------- */

// Hace una petición a la API y devuelve el JSON. Si falla, lanza un Error con el mensaje del servidor.
async function pedirAPI(ruta, opciones = {}) {
  let respuesta;
  try {
    respuesta = await fetch(ruta, opciones);
  } catch (error) {
    const fallo = new Error(
      'No pudimos conectarnos con el servidor. Verificá que el backend esté encendido.'
    );
    fallo.sinConexion = true;
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

// Trae una página de productos activos de una categoría.
// Si el listado aún no está disponible, usa el catálogo de respaldo (data/productos.json).
async function obtenerProductos({ categoria, pagina, limite }) {
  try {
    const parametros = new URLSearchParams({ categoria, pagina, limite });
    return await pedirAPI(`/api/productos?${parametros}`);
  } catch (error) {
    if (!error.sinConexion && error.estado !== 404) throw error;
    return obtenerProductosLocales({ categoria, pagina, limite });
  }
}

// Misma respuesta que la API, pero armada en el navegador con el JSON hardcodeado
async function obtenerProductosLocales({ categoria, pagina, limite }) {
  const respuesta = await fetch(RAIZ + 'data/productos.json');
  const catalogo = await respuesta.json();
  const activos = catalogo.filter((p) => p.activo && p.categoria === categoria);
  const inicio = (pagina - 1) * limite;

  return {
    ok: true,
    local: true, // avisa a la pantalla que estos datos no vienen del servidor
    datos: activos.slice(inicio, inicio + limite),
    paginacion: {
      pagina,
      limite,
      total: activos.length,
      totalPaginas: Math.max(1, Math.ceil(activos.length / limite)),
    },
  };
}
