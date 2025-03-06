require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cartRoutes = require('./routes/cartRoutes');

const app = express();
const PORT = process.env.PORT || 3002;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Rutas
app.use('/api', cartRoutes);

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor de Carrito de Compras corriendo en el puerto ${PORT}`);
});

module.exports = app;