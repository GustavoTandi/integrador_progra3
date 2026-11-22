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