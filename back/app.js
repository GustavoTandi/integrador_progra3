import express from "express";
import session from "express-session";
import { randomBytes } from "node:crypto";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import apiRoutes from "./routes/apiRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { carpetaUploads } from "./middlewares/upload.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false, limit: "16kb" }));
app.use("/admin/static", express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(carpetaUploads, {
    setHeaders: (res) => res.set("X-Content-Type-Options", "nosniff"),
}));
app.use(session({
    name: "gamingzone.admin",
    secret: process.env.SESSION_SECRET || randomBytes(32).toString("hex"),
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: "lax", maxAge: 4 * 60 * 60 * 1000 },
}));
app.use("/api", apiRoutes);
app.use("/admin", adminRoutes);
app.use(express.static(path.join(__dirname, "../front")));

export default app;