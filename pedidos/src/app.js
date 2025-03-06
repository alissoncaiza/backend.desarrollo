require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const pedidoRoutes = require('./routes/pedidoRoutes');

const app = express();
const PORT = process.env.PORT || 3003;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Rutas
app.use('/api', pedidoRoutes);

// Exportar app para pruebas sin iniciar el servidor
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Servidor de Pedidos corriendo en el puerto ${PORT}`);
    });
}

module.exports = app;  // 📌 Ahora `app` se puede usar en las pruebas
