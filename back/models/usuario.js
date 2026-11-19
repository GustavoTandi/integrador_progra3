import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Usuario = sequelize.define(
    "Usuario",
    {
        nombre: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        mail: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,

        },
        contrasena: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        es_admin: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    },
    {
        tableName: "usuarios",
        timestamps: false,
    }
);

export default Usuario;