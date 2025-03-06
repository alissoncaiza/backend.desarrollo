require('dotenv').config(); // Cargar variables de entorno
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes'); // Rutas del microservicio
const { connectDB } = require('../config/db'); // Configuración de la base de datos

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Rutas
app.use('/api/usuarios', userRoutes);

// Conectar a la base de datos
connectDB();

// Exportar la app sin iniciar el servidor para pruebas
if (process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT || 3000;
    const server = app.listen(PORT, () => console.log(`Servidor de Usuarios corriendo en el puerto ${PORT}`));
    module.exports = server; // ✅ Exporta el servidor si no es ambiente de test
} else {
    module.exports = app; // ✅ En test, solo exportamos la app sin arrancar el servidor
}
