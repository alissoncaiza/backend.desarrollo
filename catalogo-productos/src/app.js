require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Rutas
app.use('/api', productRoutes);
app.use('/api', categoryRoutes);

// Exportar la instancia de Express
module.exports = app;  // ✅ Agrega esta línea para poder usar `app` en `server.js`

// Si es ejecutado directamente, iniciar el servidor
if (require.main === module) {
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
        console.log(`Servidor de Catálogo de Productos corriendo en el puerto ${PORT}`);
    });
}
