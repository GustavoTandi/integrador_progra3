import sequelize from "../config/database.js";
import { Producto, Venta, VentaProducto } from "../models/index.js";

const MAXIMO_TOTAL_CENTAVOS = 99_999_999_999_999;

export async function crearVenta(req, res) {
    const { nombreCliente, productos } = req.venta;
    const ids = productos.map(({ id }) => id);

    try {
        const resultado = await sequelize.transaction(async (transaction) => {
            const disponibles = await Producto.findAll({
                where: { id: ids, activo: true },
                order: [["id", "ASC"]],
                transaction,
                lock: transaction.LOCK.SHARE,
            });
            const porId = new Map(disponibles.map((producto) => [producto.id, producto]));

            const errores = ids
                .filter((id) => !porId.has(id))
                .map((productoId) => ({
                    productoId,
                    mensaje: "El producto ya no está disponible.",
                }));
            if (errores.length > 0) {
                return { mensaje: "Hay productos que ya no están disponibles.", errores };
            }

            let totalCentavos = 0;
            const detalle = [];
            for (const { id, cantidad } of productos) {
                const producto = porId.get(id);
                const precioCentavos = Math.round(Number(producto.precio) * 100);
                const subtotalCentavos = precioCentavos * cantidad;

                if (precioCentavos < 0 || totalCentavos + subtotalCentavos > MAXIMO_TOTAL_CENTAVOS) {
                    return { mensaje: "El importe total de la compra está fuera del rango permitido." };
                }

                totalCentavos += subtotalCentavos;
                detalle.push({
                    id,
                    nombre: producto.nombre,
                    categoria: producto.categoria,
                    cantidad,
                    precioUnitario: precioCentavos / 100,
                    subtotal: subtotalCentavos / 100,
                });
            }

            const total = totalCentavos / 100;
            const venta = await Venta.create({
                nombre_usuario: nombreCliente,
                precio_total: total.toFixed(2),
            }, { transaction });

            await VentaProducto.bulkCreate(detalle.map(({ id, cantidad, precioUnitario }) => ({
                id_venta: venta.id,
                id_producto: id,
                cantidad,
                precio_unitario: precioUnitario.toFixed(2),
            })), { transaction });

            return { datos: {
                id: venta.id,
                nombreCliente,
                fecha: venta.fecha,
                total,
                productos: detalle,
            } };
        });

        if (!resultado.datos) {
            return res.status(400).json({ ok: false, ...resultado });
        }

        return res.status(201).json({ ok: true, ...resultado });
    } catch (error) {
        console.error("Error al registrar la venta:", error);
        return res.status(500).json({
            ok: false,
            mensaje: "No se pudo registrar la venta.",
        });
    }
}
