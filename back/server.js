import dotenv from 'dotenv';
import app from './app.js';
import sequelize from './config/database.js';

dotenv.config();

const PORT = process.env.PORT || 3000;

try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');
    app.listen(PORT, () => {
        console.log(`Servidor escuchando en el puerto ${PORT}`);
    });
} catch (error) {
    console.error('Error al conectar a la base de datos:', error.message);
}