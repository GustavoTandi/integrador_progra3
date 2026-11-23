import { randomBytes } from "node:crypto";
import Usuario from "../models/usuario.js";

export function prepararFormulario(req, res, next) {
    req.session.csrf ??= randomBytes(32).toString("hex");
    res.locals.csrf = req.session.csrf;
    res.locals.admin = req.session.admin ?? null;
    res.set("Cache-Control", "no-store");
    next();
}

export function verificarFormulario(req, res, next) {
    const token = req.get("x-csrf-token") ?? req.body?._csrf;
    if (!req.session.csrf || req.session.csrf !== token) {
        const mensaje = "El formulario venció. Recargá la página y volvé a intentarlo.";
        if (req.baseUrl === "/api") return res.status(403).json({ ok: false, mensaje });
        return res.status(403).render("adminError", { titulo: "Formulario vencido", mensaje });
    }
    next();
}

export async function requiereAdmin(req, res, next) {
    const usuario = req.session.admin && await Usuario.findOne({
        attributes: ["id", "nombre"],
        where: { id: req.session.admin.id, es_admin: true },
    });
    if (!usuario) {
        delete req.session.admin;
        res.locals.admin = null;
        if (req.baseUrl === "/api") {
            return res.status(401).json({ ok: false, mensaje: "Iniciá sesión como administrador." });
        }
        return res.redirect("/admin/login");
    }
    res.locals.admin = usuario;
    next();
}
