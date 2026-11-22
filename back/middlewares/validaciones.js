export function validarListadoProductos(req, res, next) {
    const { categoria } = req.query;
    const pagina = Number(req.query.pagina ?? 1);
    const limite = Number(req.query.limite ?? 6);
    const categoriaValida =
        categoria === undefined ||
        categoria === "consola" ||
        categoria === "videojuego";

    if (
        !categoriaValida ||
        !Number.isSafeInteger(pagina) || pagina < 1 ||
        !Number.isInteger(limite) || limite < 1 || limite > 50
    ) {
        return res.status(400).json({
            ok: false,
            mensaje: "Revisá la categoría, la página y el límite.",
        });
    }

    req.listado = { categoria, pagina, limite };
    next();
}

export function validarIdProducto(req, res, next) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({
            ok: false,
            mensaje: "El id del producto no es válido.",
        });
    }
    req.idProducto = id;
    next();
}

const REGEX_NOMBRE = /^[\p{L}][\p{L} '-]*$/u;

export function validarVenta(req, res, next) {
    const { nombreCliente, productos } = req.body ?? {};
    const errores = [];

    const nombre = typeof nombreCliente === "string"
        ? nombreCliente.trim().replace(/\s+/g, " ")
        :"";

    if (nombre.length < 2 || nombre.length > 30 || !REGEX_NOMBRE.test(nombre)) {
        errores.push({ campo : "nombreCliente", mensaje: "El nombre del cliente debe tener entre 2 y 30 caracteres." });
    }

    if (!Array.isArray(productos) || productos.length === 0) {
        errores.push({ campo: "productos", mensaje: "El carrito esta vacío" });
    } else {
        const ids = new Set();
        for (const item of productos) {
            const idValido = Number.isInteger(item?.id) && item.id >= 1;
            const cantidadValida =
                Number.isInteger(item?.cantidad) && item.cantidad >= 1 && item.cantidad <= 99;
            if (!idValido || !cantidadValida || ids.has(item.id)) {
                errores.push({ campo: "productos", mensaje: "El carrito contiene productos inválidos o repetidos." });
                break;
            }
            ids.add(item.id);
        }
    }

    if (errores.length > 0) {
        return res.status(400).json({
            ok: false,
            mensaje: "Revisa los datos de la compra",
            errores,
        });
    }

    req.venta = {nombreCliente: nombre, productos };
    next();
}