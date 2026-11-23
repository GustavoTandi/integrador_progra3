import { Router } from "express";
import { cerrarSesion, iniciarSesion, mostrarLogin } from "../controllers/authController.js";
import {
    cambiarEstadoProducto, cargarProductoAdmin, descargarVentas, guardarProducto,
    mostrarDashboard, mostrarFormularioProducto, mostrarProducto,
} from "../controllers/adminController.js";
import { prepararFormulario, requiereAdmin, verificarFormulario } from "../middlewares/auth.js";
import { subirImagenProducto } from "../middlewares/upload.js";
import { validarDatosProducto } from "../middlewares/validaciones.js";

const router = Router();

router.use(prepararFormulario);
router.get("/", (req, res) => res.redirect("/admin/dashboard"));
router.get("/login", mostrarLogin);
router.post("/login", verificarFormulario, iniciarSesion);
router.post("/logout", verificarFormulario, cerrarSesion);

router.use(requiereAdmin);
router.get("/dashboard", mostrarDashboard);
router.get("/productos/nuevo", (req, res) => mostrarFormularioProducto(req, res));
router.post("/productos", subirImagenProducto, verificarFormulario, validarDatosProducto, guardarProducto);
router.get("/productos/:id", cargarProductoAdmin, mostrarProducto);
router.get("/productos/:id/editar", cargarProductoAdmin, (req, res) => mostrarFormularioProducto(req, res));
router.post("/productos/:id/editar", cargarProductoAdmin, subirImagenProducto, verificarFormulario, validarDatosProducto, guardarProducto);
router.post("/productos/:id/desactivar", verificarFormulario, cargarProductoAdmin, cambiarEstadoProducto(false));
router.post("/productos/:id/activar", verificarFormulario, cargarProductoAdmin, cambiarEstadoProducto(true));
router.get("/ventas/excel", descargarVentas);

router.use((req, res) => res.status(404).render("adminError", {
    titulo: "Página no encontrada", mensaje: "Volvé al panel para continuar.",
}));

router.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    if (error.status !== 400) console.error("Error en el backoffice:", error);
    return res.status(error.status === 400 ? 400 : 500).render("adminError", {
        titulo: error.status === 400 ? "Revisá el formulario" : "Ocurrió un error",
        mensaje: error.status === 400 ? error.message : "No se pudo completar la operación. Intentá de nuevo.",
    });
});

export default router;
