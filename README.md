# integrador_progra3
Trabajo integrador - Programación III - Tandi Gustavo y Martinez Daniel
Autoservicio de consolas y videojuegos. El cliente compra desde la tienda y el administrador gestiona los productos desde un backoffice.

## Tecnologías

Node.js, Express, MySQL, Sequelize, EJS, bcryptjs, express-session, Multer, ExcelJS y jsPDF.

## Estructura

- `back/`: servidor Express con la API, el backoffice, los modelos y los seeders.
- `front/`: la tienda (HTML, CSS y JavaScript).

Express sirve todo desde el mismo servidor.

## Cómo correrlo

Se necesita Node.js y MySQL (por ejemplo XAMPP).

1. Importar `back/db/schema.sql` en phpMyAdmin. Crea la base `gaming_zone` y sus tablas.
2. Copiar `back/.env.example` a `back/.env` y completar `ADMIN_EMAIL`, `ADMIN_PASSWORD` (mínimo 8 caracteres) y `SESSION_SECRET` (cualquier texto largo).
3. Desde `back/` instalar las dependencias con `npm install`.
4. Cargar los productos con `npm run seed`.
5. Crear el administrador con `npm run admin:create`.
6. Desde la raíz del proyecto, iniciar con `npm run dev`.

La tienda queda en http://localhost:3000 y el backoffice en http://localhost:3000/admin/login.
Con `ADMIN_DEMO=true` el login muestra un botón de acceso rápido que completa el correo y la contraseña.

## Qué hace

Tienda: pide el nombre, muestra los productos por categoría con paginación, permite ver el detalle, armar el carrito y confirmar la compra. Al final genera el ticket, que se puede descargar en PDF. Tiene tema claro y oscuro.

Backoffice: login con contraseña cifrada, listado de productos, alta con imagen, modificación, baja lógica, reactivación y descarga de las ventas en Excel.

## API

- `GET /api/productos` y `GET /api/productos/:id`: públicos.
- `POST /api/ventas`: público, registra la compra.
- `POST`, `PUT`, `DELETE` y `PATCH /api/productos`: solo administrador.
- `GET /api/ventas` y `GET`/`POST /api/usuarios`: solo administrador.

Las rutas de administrador necesitan sesión iniciada y el token CSRF en el header `x-csrf-token`.s