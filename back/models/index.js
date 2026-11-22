import Producto from "./producto.js";
import Usuario from "./usuario.js";
import Venta from "./venta.js";
import VentaProducto from "./venta_productos.js";

Venta.belongsToMany(Producto, {
    through: VentaProducto,
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
    foreignKey: "id_venta",
    otherKey: "id_producto",
});

Producto.belongsToMany(Venta, {
    through: VentaProducto,
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
    foreignKey: "id_producto",
    otherKey: "id_venta",
});

export { Producto, Usuario, Venta, VentaProducto };