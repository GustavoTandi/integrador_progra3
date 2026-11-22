import { readFileSync } from "fs";
import sequelize from "../config/database.js";
import Producto from "../models/producto.js";

const productos = JSON.parse(
    readFileSync(new URL("../../front/data/productos.json", import.meta.url), "utf-8")
);

try {
    await sequelize.authenticate();
    const cantidad = await Producto.count();
    if (cantidad > 0) {
        console.log(`Ya hay ${cantidad} productos, no se carga nada.`);
    } else {
        await Producto.bulkCreate(productos);
        console.log("Productos cargados:", productos.length);
    }
} catch (error) {
    console.error("Error en el seeder:", error);
}
await sequelize.close();