import Producto from "../models/producto.js";

export async function listarProductos(req, res) {
    const { categoria, pagina, limite } = req.listado;
    const where = { activo: true };

    if (categoria) {
        where.categoria = categoria;
    }

    try {
        const { rows, count } = await Producto.findAndCountAll({
            where,
            order: [["id", "ASC"]],
            limit: limite,
            offset: (pagina - 1) * limite,
        });

        return res.json({
            ok: true,
            datos: rows,
            paginacion: {
                pagina,
                limite,
                total: count,
                totalPaginas: Math.max(1, Math.ceil(count / limite)),
            },
        });
    } catch (error) {
        console.error("Error al listar productos:", error);
        return res.status(500).json({
            ok: false,
            mensaje: "No se pudo cargar el catálogo.",
        });
    }
}