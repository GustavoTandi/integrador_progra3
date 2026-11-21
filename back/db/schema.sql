CREATE DATABASE IF NOT EXISTS gaming_zone
    CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE gaming_zone;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    mail VARCHAR(100) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    es_admin BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    plataforma VARCHAR(100) NOT NULL,
    descripcion TEXT NOT NULL,
    imagen VARCHAR(255),
    categoria VARCHAR(100) NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE ventas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(100) NOT NULL,
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    precio_total DECIMAL(10, 2) NOT NULL
);

CREATE TABLE ventas_productos (
    id_venta INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    PRIMARY KEY (id_venta, id_producto),
    FOREIGN KEY (id_venta) REFERENCES ventas(id),
    FOREIGN KEY (id_producto) REFERENCES productos(id)
);