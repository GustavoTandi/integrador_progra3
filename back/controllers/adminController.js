import ExcelJS from "exceljs";
import sequelize from "../config/database.js";
import { Producto, Venta } from "../models/index.js";
import { guardarImagenProducto, quitarImagenSubida } from "../middlewares/upload.js";

const formatoPrecio = new Intl.NumberFormat("es-AR", {
    style: "currency", currency: "ARS", minimumFractionDigits: 0, maximumFractionDigits: 2,
});
const categorias = [
    { id: "consola", nombre: "Consolas" },
    { id: "videojuego", nombre: "Videojuegos" },
];

export async function mostrarDashboard(req, res) {
    const productos = await Producto.findAll({ order: [["nombre", "ASC"], ["id", "ASC"]] });
    const grupos = categorias.map((categoria) => ({
        ...categoria, productos: productos.filter((producto) => producto.categoria === categoria.id),
    }));
    return res.render("dashboard", { titulo: "Productos", grupos, formatoPrecio });
}

export async function cargarProductoAdmin(req, res, next) {
    const id = Number(req.params.id);
    const valido = Number.isSafeInteger(id) && id > 0 && id <= 2_147_483_647;
    req.producto = valido ? await Producto.findByPk(id) : null;
    if (!req.producto) {
        const mensaje = "No se encontró ese producto.";
        if (req.baseUrl === "/api") return res.status(404).json({ ok: false, mensaje });
        return res.status(404).render("adminError", { titulo: "Producto no encontrado", mensaje });
    }
    next();
}

export function mostrarProducto(req, res) {
    return res.render("productoDetalle", {
        titulo: req.producto.nombre, producto: req.producto, categorias, formatoPrecio,
    });
}

export function mostrarFormularioProducto(req, res, error = "", estado = 200) {
    const producto = req.producto ?? {};
    const editando = Boolean(producto.id);
    return res.status(estado).render("productoForm", {
        titulo: editando ? "Editar producto" : "Nuevo producto",
        producto: { ...producto.dataValues, ...req.datosProducto },
        editando, categorias, error,
    });
}

function errorProducto(req, res, mensaje) {
    if (req.baseUrl === "/api") return res.status(400).json({ ok: false, mensaje });
    return mostrarFormularioProducto(req, res, mensaje, 400);
}

export async function guardarProducto(req, res) {
    if (req.errorProducto) return errorProducto(req, res, req.errorProducto);
    if (!req.producto && !req.file) return errorProducto(req, res, "Elegí una imagen para el producto.");

    const imagen = req.file ? await guardarImagenProducto(req.file) : null;
    if (req.file && !imagen) return errorProducto(req, res, "La imagen debe estar en formato JPG, PNG o WEBP.");
    const datos = { ...req.datosProducto, ...(imagen && { imagen }) };
    let producto;
    let imagenAnterior;
    try {
        if (req.producto) {
            producto = await sequelize.transaction(async (transaction) => {
                const actual = await Producto.findByPk(req.producto.id, {
                    transaction, lock: transaction.LOCK.UPDATE,
                });
                if (!actual) return null;
                imagenAnterior = actual.imagen;
                return actual.update(datos, { transaction });
            });
        } else {
            producto = await Producto.create(datos);
        }
    } catch (error) {
        await quitarImagenSubida(imagen);
        throw error;
    }

    if (!producto) {
        await quitarImagenSubida(imagen);
        return errorProducto(req, res, "El producto ya no existe.");
    }
    if (imagen && imagenAnterior && imagenAnterior !== imagen) {
        await quitarImagenSubida(imagenAnterior);
    }
    if (req.baseUrl === "/api") {
        return res.status(req.producto ? 200 : 201).json({ ok: true, datos: producto });
    }
    return res.redirect(303, "/admin/dashboard");
}

export function cambiarEstadoProducto(activo) {
    return async function aplicarEstado(req, res) {
        const producto = await req.producto.update({ activo });
        if (req.baseUrl === "/api") return res.json({ ok: true, datos: producto });
        return res.redirect(303, "/admin/dashboard");
    };
}

function obtenerVentasConProductos() {
    return Venta.findAll({
        include: { model: Producto, through: { attributes: ["cantidad", "precio_unitario"] } },
        order: [["fecha", "DESC"], ["id", "DESC"]],
    });
}

export async function listarVentasAdmin(req, res) {
    return res.json({ ok: true, datos: await obtenerVentasConProductos() });
}

export async function descargarVentas(req, res) {
    const ventas = await obtenerVentasConProductos();
    const libro = new ExcelJS.Workbook();
    const ventasHoja = libro.addWorksheet("Ventas");
    ventasHoja.columns = [
        { header: "Venta", key: "id", width: 12 },
        { header: "Cliente", key: "cliente", width: 35 },
        { header: "Fecha", key: "fecha", width: 22, style: { numFmt: "dd/mm/yyyy hh:mm" } },
        { header: "Total (ARS)", key: "total", width: 19, style: { numFmt: "#,##0.00" } },
    ];
    const detalleHoja = libro.addWorksheet("Productos vendidos");
    detalleHoja.columns = [
        { header: "Venta", key: "venta", width: 12 },
        { header: "Producto", key: "producto", width: 50 },
        { header: "Cantidad", key: "cantidad", width: 14 },
        { header: "Precio unitario (ARS)", key: "precio", width: 24, style: { numFmt: "#,##0.00" } },
        { header: "Subtotal (ARS)", key: "subtotal", width: 23, style: { numFmt: "#,##0.00" } },
    ];

    for (const venta of ventas) {
        ventasHoja.addRow({
            id: venta.id, cliente: venta.nombre_usuario, fecha: venta.fecha, total: Number(venta.precio_total),
        });
        for (const producto of venta.Productos) {
            const { cantidad, precio_unitario } = producto.VentaProducto;
            const precio = precio_unitario === null ? null : Number(precio_unitario);
            detalleHoja.addRow({
                venta: venta.id, producto: producto.nombre, cantidad, precio,
                subtotal: precio === null ? null : Math.round(precio * 100) * cantidad / 100,
            });
        }
    }

    for (const hoja of [ventasHoja, detalleHoja]) {
        hoja.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
        hoja.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF172138" } };
        hoja.views = [{ state: "frozen", ySplit: 1 }];
    }

    const contenido = await libro.xlsx.writeBuffer();
    res.attachment("ventas-gaming-zone.xlsx");
    return res.send(Buffer.from(contenido));
}
