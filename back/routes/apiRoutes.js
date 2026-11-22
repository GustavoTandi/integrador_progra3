import { Router } from "express";
import { listarProductos, obtenerProducto } from "../controllers/productosController.js";
import { validarListadoProductos, validarIdProducto } from "../middlewares/validaciones.js";

const router = Router();

router.get("/productos", validarListadoProductos, listarProductos);
router.get("/productos/:id", validarIdProducto, obtenerProducto);

export default router;