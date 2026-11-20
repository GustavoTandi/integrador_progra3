import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(express.json());

app.use("/assets", express.static(path.join(__dirname, "../front/assets")));

app.get("/", (req, res) => {
    res.json({ mensaje: "Bienvenido/a" });
});

export default app;