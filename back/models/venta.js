import { DataTypes} from "sequelize";
import sequelize from "../config/database.js";

const Venta = sequelize.define(
    "Venta",
    {
        nombre_usuario: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        fecha: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        precio_total: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
    },
    {
        tableName: "ventas",
        timestamps: false,
    }
);

export default Venta;