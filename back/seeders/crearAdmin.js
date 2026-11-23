import bcrypt from "bcryptjs";
import Usuario from "../models/usuario.js";
import { crearAdministrador, validarAdministrador } from "../servicios/administradores.js";

// Crea el primer administrador con los datos de .env.

try {
    const datos = validarAdministrador({
        nombre: process.env.ADMIN_NOMBRE || "Administrador",
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
    });
    if (!datos) throw new Error("Configurá ADMIN_EMAIL y ADMIN_PASSWORD (mínimo 8 caracteres) en back/.env.");

    const existente = await Usuario.findOne({ where: { mail: datos.mail } });
    if (!existente) {
        await crearAdministrador(datos);
        console.log("Se creó el administrador.");
    } else if (existente.es_admin && await bcrypt.compare(datos.contrasena, existente.contrasena)) {
        console.log("El administrador indicado ya existe.");
    } else {
        throw new Error("Ese correo está ocupado. Usá las credenciales existentes o elegí otro correo.");
    }
} catch (error) {
    console.error("No se pudo preparar el administrador:", error.message);
    process.exitCode = 1;
} finally {
    await Usuario.sequelize.close();
}
