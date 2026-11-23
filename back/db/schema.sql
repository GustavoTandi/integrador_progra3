CREATE DATABASE IF NOT EXISTS gaming_zone
    CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE gaming_zone;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    mail VARCHAR(120) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    es_admin BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NULL,
    updated_at DATETIME NULL
);

CREATE TABLE productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    imagen VARCHAR(255),
    categoria VARCHAR(100) NOT NULL,
    precio DECIMAL(12, 2) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NULL,
    updated_at DATETIME NULL
);

CREATE TABLE ventas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(100) NOT NULL,
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    precio_total DECIMAL(14, 2) NOT NULL
);

CREATE TABLE ventas_productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_venta INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    precio_unitario DECIMAL(12, 2),
    UNIQUE KEY ventas_productos_venta_producto_unique (id_venta, id_producto),
    CONSTRAINT ventas_productos_venta_fk FOREIGN KEY (id_venta) REFERENCES ventas(id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT ventas_productos_producto_fk FOREIGN KEY (id_producto) REFERENCES productos(id)
        ON DELETE RESTRICT ON UPDATE RESTRICT
);