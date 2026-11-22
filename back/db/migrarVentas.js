import sequelize from "../config/database.js";

function columnaExistente(columnas, anterior, nueva) {
    if (Object.hasOwn(columnas, anterior) === Object.hasOwn(columnas, nueva)) {
        throw new Error(`Se esperaba una sola columna entre ${anterior} y ${nueva}.`);
    }
    return Object.hasOwn(columnas, nueva) ? nueva : anterior;
}

async function migrarVentas() {
    const db = sequelize.getQueryInterface();
    const [ventas, detalle, indices] = await Promise.all([
        db.describeTable("ventas"),
        db.describeTable("ventas_productos"),
        db.showIndex("ventas_productos"),
    ]);

    const nombre = columnaExistente(ventas, "nombreCliente", "nombre_usuario");
    const total = columnaExistente(ventas, "total", "precio_total");
    const ventaId = columnaExistente(detalle, "ventaId", "id_venta");
    const productoId = columnaExistente(detalle, "productoId", "id_producto");
    const claveCompuesta = indices.some(({ primary, fields }) =>
        primary && fields.length === 2 &&
        fields[0].attribute === ventaId && fields[1].attribute === productoId,
    );
    if ((!detalle.id && !claveCompuesta) ||
        (detalle.id && (!detalle.id.primaryKey || !detalle.id.autoIncrement))) {
        throw new Error("La clave primaria de ventas_productos no coincide con un esquema conocido.");
    }
    if (detalle.precioUnitario && detalle.precio_unitario) {
        throw new Error("Hay dos columnas de precio unitario. Revisalas antes de migrar.");
    }

    const cambiosVenta = [];
    if (nombre === "nombreCliente") {
        cambiosVenta.push("CHANGE COLUMN nombreCliente nombre_usuario VARCHAR(100) NOT NULL");
    }
    if (total === "total") {
        cambiosVenta.push("CHANGE COLUMN total precio_total DECIMAL(14, 2) NOT NULL");
    } else if (ventas.precio_total.type === "DECIMAL(10,2)") {
        cambiosVenta.push("MODIFY COLUMN precio_total DECIMAL(14, 2) NOT NULL");
    }
    if (ventas.fecha.defaultValue === null) {
        cambiosVenta.push("MODIFY COLUMN fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP");
    }

    const cambiosDetalle = [];
    if (ventaId === "ventaId") {
        cambiosDetalle.push("CHANGE COLUMN ventaId id_venta INT NOT NULL");
    }
    if (productoId === "productoId") {
        cambiosDetalle.push("CHANGE COLUMN productoId id_producto INT NOT NULL");
    }
    if (detalle.precioUnitario) {
        cambiosDetalle.push("CHANGE COLUMN precioUnitario precio_unitario DECIMAL(12, 2) NULL");
    } else if (!detalle.precio_unitario) {
        // Algunas ventas anteriores no registraban el precio histórico por producto.
        cambiosDetalle.push("ADD COLUMN precio_unitario DECIMAL(12, 2) NULL");
    }

    if (!detalle.id) {
        const tieneUnico = indices.some(({ primary, unique, fields }) =>
            !primary && unique && fields.length === 2 &&
            fields[0].attribute === ventaId && fields[1].attribute === productoId,
        );
        if (!tieneUnico) {
            // Mantiene un índice compatible con la clave ajena antes de cambiar la primaria.
            await sequelize.query(
                "ALTER TABLE ventas_productos ADD UNIQUE KEY ventas_productos_venta_producto_unique (`" +
                ventaId + "`, `" + productoId + "`)",
            );
        }
        cambiosDetalle.push("DROP PRIMARY KEY", "ADD COLUMN id INT NOT NULL AUTO_INCREMENT PRIMARY KEY FIRST");
    }

    if (cambiosVenta.length) {
        await sequelize.query("ALTER TABLE ventas " + cambiosVenta.join(", "));
    }
    if (cambiosDetalle.length) {
        await sequelize.query("ALTER TABLE ventas_productos " + cambiosDetalle.join(", "));
    }

    console.log(cambiosVenta.length || cambiosDetalle.length
        ? "Se unificó el esquema de ventas."
        : "El esquema de ventas ya está actualizado.");
}

try {
    await migrarVentas();
} catch (error) {
    console.error("No se pudo migrar el esquema de ventas:", error.message);
    process.exitCode = 1;
} finally {
    await sequelize.close();
}
