// Pantalla de bienvenida: pide el nombre del cliente antes de dejarlo ver los productos.

// Cada vez que se llega a la bienvenida, el autoservicio vuelve a comenzar
Sesion.reiniciar();

const formularioBienvenida = document.getElementById('form-bienvenida');
const inputNombre = document.getElementById('nombre');
const campoNombre = document.getElementById('campo-nombre');
const errorNombre = document.getElementById('error-nombre');

// Solo letras (con acentos), espacios, apóstrofos y guiones
const REGEX_NOMBRE = /^[\p{L}][\p{L} '-]*$/u;

function validarNombre(nombre) {
  if (nombre.length === 0) return 'Ingresá tu nombre para continuar.';
  if (nombre.length < 2) return 'El nombre debe tener al menos 2 letras.';
  if (!REGEX_NOMBRE.test(nombre)) return 'El nombre solo puede tener letras.';
  return '';
}

formularioBienvenida.addEventListener('submit', (evento) => {
  evento.preventDefault();
  const nombre = inputNombre.value.trim().replace(/\s+/g, ' ');
  const error = validarNombre(nombre);

  errorNombre.textContent = error;
  campoNombre.classList.toggle('campo--invalido', error !== '');
  if (error) {
    inputNombre.focus();
    return;
  }

  Sesion.guardarNombre(nombre);
  window.location.href = PAGINAS.productos;
});

inputNombre.focus();
