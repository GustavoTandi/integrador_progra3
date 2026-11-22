// Pantalla de ticket: muestra la compra confirmada por el servidor, permite bajarla en PDF y salir.


const ticket = Sesion.obtenerTicket();
const avisoErrorTicket = document.getElementById('aviso-error');

function numeroDeTicket(id) {
  return String(id).padStart(6, '0');
}

function renderizarTicket() {
  document.getElementById('ticket-empresa').textContent = CONFIG.EMPRESA;
  document.getElementById('ticket-lema').textContent = CONFIG.LEMA;
  document.getElementById('ticket-numero').textContent = numeroDeTicket(ticket.id);
  document.getElementById('ticket-fecha').textContent = formatearFecha(ticket.fecha);
  document.getElementById('ticket-cliente').textContent = ticket.nombreCliente;
  document.getElementById('ticket-total').textContent = formatearPrecio(ticket.total);

  document.getElementById('ticket-productos').innerHTML = ticket.productos
    .map(
      (producto) => `
      <tr>
        <td>
          ${escaparHTML(producto.nombre)}
          <small>${escaparHTML(nombreCategoria(producto.categoria))} · ${formatearPrecio(producto.precioUnitario)} c/u</small>
        </td>
        <td class="num">${producto.cantidad}</td>
        <td class="num">${formatearPrecio(producto.subtotal)}</td>
      </tr>`
    )
    .join('');
}

// Arma el PDF con formato de ticket de 80 mm de ancho
function descargarPDF() {
  if (!window.jspdf) {
    avisoErrorTicket.textContent = 'No se pudo cargar el generador de PDF. Revisá tu conexión a internet y recargá la página.';
    avisoErrorTicket.classList.remove('oculto');
    return;
  }

  const { jsPDF } = window.jspdf;
  const ANCHO = 80;
  const MARGEN = 6;
  const DERECHA = ANCHO - MARGEN;

  // Primero se calcula el alto: cada producto ocupa una o más líneas según el largo del nombre
  const medidor = new jsPDF({ unit: 'mm', format: [ANCHO, 100] });
  medidor.setFontSize(9);
  const lineas = ticket.productos.map((producto) =>
    medidor.splitTextToSize(`${producto.cantidad} x ${producto.nombre}`, 44)
  );
  const altoProductos = lineas.reduce((suma, renglones) => suma + renglones.length * 4 + 6, 0);
  const doc = new jsPDF({ unit: 'mm', format: [ANCHO, 78 + altoProductos] });

  function separador(y) {
    doc.setLineDashPattern([1, 1], 0);
    doc.setDrawColor(150);
    doc.line(MARGEN, y, DERECHA, y);
  }

  let y = 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(CONFIG.EMPRESA, ANCHO / 2, y, { align: 'center' });
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(CONFIG.LEMA, ANCHO / 2, y, { align: 'center' });
  y += 5;
  separador(y);

  y += 6;
  doc.setFontSize(9);
  [
    ['Ticket N°', numeroDeTicket(ticket.id)],
    ['Fecha', formatearFecha(ticket.fecha)],
    ['Cliente', ticket.nombreCliente],
  ].forEach(([etiqueta, valor]) => {
    doc.setFont('helvetica', 'normal');
    doc.text(etiqueta, MARGEN, y);
    doc.setFont('helvetica', 'bold');
    doc.text(String(valor), DERECHA, y, { align: 'right' });
    y += 5;
  });
  separador(y - 1);

  y += 5;
  ticket.productos.forEach((producto, indice) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(lineas[indice], MARGEN, y);
    doc.text(formatearPrecio(producto.subtotal), DERECHA, y, { align: 'right' });
    y += lineas[indice].length * 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(`${formatearPrecio(producto.precioUnitario)} c/u`, MARGEN, y);
    y += 6;
  });
  separador(y - 2);

  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TOTAL', MARGEN, y);
  doc.text(formatearPrecio(ticket.total), DERECHA, y, { align: 'right' });

  y += 9;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('¡Gracias por tu compra!', ANCHO / 2, y, { align: 'center' });

  doc.save(`ticket-${'gaming-zone'}-${numeroDeTicket(ticket.id)}.pdf`);
}

if (!ticket) {
  // Sin una compra confirmada no hay ticket para mostrar
  window.location.replace(PAGINAS.inicio);
} else {
  renderizarTicket();
  document.getElementById('btn-pdf').addEventListener('click', descargarPDF);
  // "Salir" termina la visita: el sistema vuelve a comenzar para el próximo cliente
  document.getElementById('btn-salir').addEventListener('click', salirDelSistema);
  document.getElementById('nav-salir').addEventListener('click', salirDelSistema);
}
