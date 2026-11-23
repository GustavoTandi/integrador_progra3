import { UniqueConstraintError } from "sequelize";
import Usuario from "../models/usuario.js";
import { crearAdministrador } from "../servicios/administradores.js";

export async function crearUsuarioAdmin(req, res) {
    try {
        const usuario = await crearAdministrador(req.datosAdmin);
        return res.status(201).json({
            ok: true, datos: { id: usuario.id, nombre: usuario.nombre, mail: usuario.mail },
        });
    } catch (error) {
        if (error instanceof UniqueConstraintError) {
            return res.status(409).json({ ok: false, mensaje: "Ese correo ya está registrado." });
        }
        throw error;
    }
}

export async function listarUsuariosAdmin(req, res) {
    const datos = await Usuario.findAll({
        where: { es_admin: true },
        attributes: ["id", "nombre", "mail"],
        order: [["nombre", "ASC"], ["id", "ASC"]],
    });
    return res.json({ ok: true, datos });
}
