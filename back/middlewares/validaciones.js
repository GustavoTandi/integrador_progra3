import { validarAdministrador } from "../servicios/administradores.js";

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
            const idValido = Number.isInteger(item?.id) && item.id >= 1 && item.id <= 2_147_483_647;
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

export function validarDatosProducto(req, res, next) {
    const { nombre, categoria, precio } = req.body ?? {};
    const texto = (valor) => typeof valor === "string" ? valor.trim() : "";
    const precioNormalizado = (typeof precio === "number" ? String(precio) : texto(precio)).replace(",", ".");
    req.datosProducto = {
        nombre: texto(nombre),
        categoria: texto(categoria),
        precio: precioNormalizado,
    };

    const producto = req.datosProducto;
    if (!producto.nombre || producto.nombre.length > 150) {
        req.errorProducto = "Ingresá un nombre de hasta 150 caracteres.";
    } else if (!["consola", "videojuego"].includes(producto.categoria)) {
        req.errorProducto = "Elegí una categoría válida.";
    } else if (!/^\d{1,10}(\.\d{1,2})?$/.test(precioNormalizado) || Number(precioNormalizado) <= 0) {
        req.errorProducto = "Ingresá un precio mayor a cero, con hasta dos decimales.";
    }
    next();
}

export function validarDatosAdmin(req, res, next) {
    req.datosAdmin = validarAdministrador(req.body ?? {});
    if (!req.datosAdmin) {
        return res.status(400).json({ ok: false, mensaje: "Ingresá nombre, correo y una contraseña válida de al menos 8 caracteres." });
    }
    next();
}
