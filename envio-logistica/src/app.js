const express = require('express');
const envioRoutes = require('./routes/envioRoutes');
const { pool } = require('../config/db');
require('dotenv').config();

const app = express();
app.use(express.json());

// Rutas
app.use('/api', envioRoutes);

// Conexión a la base de datos
(async () => {
    try {
        const client = await pool.connect();
        console.log('Conexión a PostgreSQL exitosa');
        client.release();
    } catch (err) {
        console.error('Error al conectar a PostgreSQL:', err.message);
    }
})();

// ✅ Solo inicia el servidor si el archivo actual es `app.js`
if (require.main === module) {
    const PORT = process.env.PORT || 3004;
    app.listen(PORT, () => {
        console.log(`Servidor de Envío y Logística corriendo en el puerto ${PORT}`);
    });
}

// ✅ Exportar `app` para pruebas con Jest
module.exports = app;
