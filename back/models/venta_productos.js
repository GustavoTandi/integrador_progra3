import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const VentaProducto = sequelize.define(
    "VentaProducto",
    {
        id_venta: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        id_producto: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        cantidad: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        precio_unitario: {
            type: DataTypes.DECIMAL(12, 2),
        },
    },
    {
        tableName: "ventas_productos",
        timestamps: false,
    }
);

export default VentaProducto;