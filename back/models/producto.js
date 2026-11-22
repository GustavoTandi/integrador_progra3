import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Producto = sequelize.define(
    "Producto",
    {
        nombre: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        imagen: {
            type: DataTypes.STRING(255),
        },
        categoria: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        plataforma: {
            type: DataTypes.STRING(40),
        },
        descripcion: {
            type: DataTypes.STRING(300),
        },
        precio: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
        },
        activo: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    },
    {
        tableName: "productos",
        timestamps: true,
        underscored: true,
    }
);

export default Producto;