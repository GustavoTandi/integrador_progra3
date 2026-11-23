import bcrypt from "bcryptjs";
import Usuario from "../models/usuario.js";

function mostrarFormulario(req, res, { estado = 200, mail = "", error = "" } = {}) {
    const habilitado = process.env.ADMIN_DEMO === "true" &&
        process.env.NODE_ENV !== "production" &&
        ["localhost", "127.0.0.1", "[::1]"].includes(req.hostname) &&
        ["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(req.socket.remoteAddress);
    const demo = habilitado && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD
        ? { mail: process.env.ADMIN_EMAIL, clave: process.env.ADMIN_PASSWORD }
        : null;
    return res.status(estado).render("login", { titulo: "Administración", mail, error, demo });
}

export function mostrarLogin(req, res) {
    return mostrarFormulario(req, res);
}

export async function iniciarSesion(req, res, next) {
    const { mail, contrasena } = req.body ?? {};
    const correo = typeof mail === "string" ? mail.trim().toLowerCase() : "";
    const claveValida = typeof contrasena === "string" && contrasena.length > 0 &&
        Buffer.byteLength(contrasena, "utf8") <= 72;
    const usuario = correo && correo.length <= 120 && claveValida
        ? await Usuario.findOne({ where: { mail: correo, es_admin: true } })
        : null;

    if (!usuario || !(await bcrypt.compare(contrasena, usuario.contrasena))) {
        return mostrarFormulario(req, res, {
            estado: 401,
            mail: correo,
            error: "El correo o la contraseña son incorrectos.",
        });
    }

    req.session.regenerate((error) => {
        if (error) return next(error);
        req.session.admin = { id: usuario.id, nombre: usuario.nombre };
        res.redirect(303, "/admin/dashboard");
    });
}

export function cerrarSesion(req, res, next) {
    req.session.destroy((error) => {
        if (error) return next(error);
        res.clearCookie("gamingzone.admin");
        res.redirect(303, "/admin/login");
    });
}
