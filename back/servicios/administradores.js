import bcrypt from "bcryptjs";
import Usuario from "../models/usuario.js";

//Recibe email y password como llegan de la API y devuelve mail y contrasena como los guarda el modelo.
export function validarAdministrador(datos = {}) {
    const nombre = typeof datos.nombre === "string" ? datos.nombre.trim() : "";
    const mail = typeof datos.email === "string" ? datos.email.trim().toLowerCase() : "";
    const contrasena = typeof datos.password === "string" ? datos.password : "";
    if (!nombre || nombre.length > 100 || mail.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail) ||
        contrasena.length < 8 || Buffer.byteLength(contrasena, "utf8") > 72) {
        return null;
    }
    return { nombre, mail, contrasena };
}

export async function crearAdministrador({ nombre, mail, contrasena }) {
    return Usuario.create({ nombre, mail, contrasena: await bcrypt.hash(contrasena, 12), es_admin: true });
}
