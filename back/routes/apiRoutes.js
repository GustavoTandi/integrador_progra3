import { Router } from "express";
import { listarProductos } from "../controllers/productosController.js";
import { validarListadoProductos } from "../middlewares/validaciones.js";

const router = Router();

router.get("/productos", validarListadoProductos, listarProductos);

export default router;