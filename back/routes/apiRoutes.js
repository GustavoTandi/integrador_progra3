import { Router } from "express";
import { listarProductos, obtenerProducto } from "../controllers/productosController.js";
import { crearVenta } from "../controllers/ventasController.js";
import { cambiarEstadoProducto, cargarProductoAdmin, guardarProducto, listarVentasAdmin } from "../controllers/adminController.js";
import { crearUsuarioAdmin, listarUsuariosAdmin } from "../controllers/usuariosController.js";
import { requiereAdmin, verificarFormulario } from "../middlewares/auth.js";
import { subirImagenProducto } from "../middlewares/upload.js";
import {
    validarDatosAdmin, validarDatosProducto, validarListadoProductos, validarIdProducto, validarVenta,
} from "../middlewares/validaciones.js";

const router = Router();

router.get("/productos", validarListadoProductos, listarProductos);
router.get("/productos/:id", validarIdProducto, obtenerProducto);

router.post("/ventas", validarVenta, crearVenta);

router.post("/productos", requiereAdmin, verificarFormulario, subirImagenProducto, validarDatosProducto, guardarProducto);
router.put("/productos/:id", requiereAdmin, verificarFormulario, cargarProductoAdmin, subirImagenProducto, validarDatosProducto, guardarProducto);
router.delete("/productos/:id", requiereAdmin, verificarFormulario, cargarProductoAdmin, cambiarEstadoProducto(false));
router.patch("/productos/:id/activar", requiereAdmin, verificarFormulario, cargarProductoAdmin, cambiarEstadoProducto(true));
router.get("/ventas", requiereAdmin, listarVentasAdmin);
router.get("/usuarios", requiereAdmin, listarUsuariosAdmin);
router.post("/usuarios", requiereAdmin, verificarFormulario, validarDatosAdmin, crearUsuarioAdmin);

router.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    if (error.status === 400) return res.status(400).json({ ok: false, mensaje: error.message });
    console.error("Error en la API:", error);
    return res.status(500).json({ ok: false, mensaje: "No se pudo completar la operación." });
});

export default router;