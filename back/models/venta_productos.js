import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const VentaProducto = sequelize.define(
    "VentaProducto",
    {
        id_venta: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
        },
        id_producto: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
        },
        cantidad: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
    },
    {
        tableName: "ventas_productos",
        timestamps: false,
    }
);

export default VentaProducto;