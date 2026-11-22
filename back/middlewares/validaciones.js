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

export function validarVenta(req, res, next) {
    const { nombreCliente, productos } = req.body ?? {};
    const nombre = typeof nombreCliente === "string" ? nombreCliente.trim() : "";

    if (!nombre || nombre.length > 100 || !Array.isArray(productos) || productos.length === 0) {
        return res.status(400).json({
            ok: false,
            mensaje: "Ingresá un nombre válido y agregá al menos un producto al carrito.",
        });
    }

    const maximoEnteroMySQL = 2_147_483_647;
    const ids = new Set();
    for (const producto of productos) {
        const { id, cantidad } = producto ?? {};
        if (
            !Number.isInteger(id) || id < 1 || id > maximoEnteroMySQL ||
            !Number.isInteger(cantidad) || cantidad < 1 || cantidad > maximoEnteroMySQL ||
            ids.has(id)
        ) {
            return res.status(400).json({
                ok: false,
                mensaje: "Cada producto debe tener un ID único y una cantidad entera positiva.",
            });
        }
        ids.add(id);
    }

    req.venta = { nombreCliente: nombre, productos };
    next();
}
