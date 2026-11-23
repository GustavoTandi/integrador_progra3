import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import multer from "multer";

export const carpetaUploads = fileURLToPath(new URL("../uploads/", import.meta.url));

const recibirImagen = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024, files: 1, fields: 8, fieldSize: 2048 },
}).single("imagen");

export function subirImagenProducto(req, res, next) {
    recibirImagen(req, res, (error) => {
        if (error instanceof multer.MulterError) {
            error.status = 400;
            error.message = "Elegí una sola imagen JPG, PNG o WEBP de hasta 2 MB.";
        }
        next(error);
    });
}

// Se identifica el formato por los primeros bytes del archivo, no por lo que declara el cliente.
export async function guardarImagenProducto(archivo) {
    const bytes = archivo.buffer;
    let extension;
    if (bytes.subarray(0, 8).equals(Buffer.from("89504e470d0a1a0a", "hex"))) extension = "png";
    if (bytes.subarray(0, 3).equals(Buffer.from("ffd8ff", "hex"))) extension = "jpg";
    if (bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") extension = "webp";
    if (!extension) return null;

    const nombre = randomUUID() + "." + extension;
    await mkdir(carpetaUploads, { recursive: true });
    await writeFile(path.join(carpetaUploads, nombre), bytes, { flag: "wx" });
    return "/uploads/" + nombre;
}

export async function quitarImagenSubida(ruta) {
    if (!/^\/uploads\/[a-f0-9-]{36}\.(jpg|png|webp)$/.test(ruta ?? "")) return;
    try {
        await unlink(path.join(carpetaUploads, path.basename(ruta)));
    } catch (error) {
        if (error.code !== "ENOENT") console.error("No se pudo retirar una imagen anterior:", error.code);
    }
}
