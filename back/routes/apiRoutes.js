import { Router } from "express";
import { listarProductos, obtenerProducto } from "../controllers/productosController.js";
import { crearVenta } from "../controllers/ventasController.js";
import { validarListadoProductos, validarIdProducto, validarVenta } from "../middlewares/validaciones.js";

const router = Router();

router.get("/productos", validarListadoProductos, listarProductos);
router.get("/productos/:id", validarIdProducto, obtenerProducto);

router.post("/ventas", validarVenta, crearVenta);

export default router;