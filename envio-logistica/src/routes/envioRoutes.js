const express = require('express');
const {
    createEnvio,
    assignTransportista,
    getAllEnvios,
    getEnvioById,
    updateEnvioEstado
} = require('../controllers/envioController');
const authorize = require('../middlewares/authorize');

const router = express.Router();

// Rutas para clientes
router.post('/envios', authorize(['cliente']), createEnvio);
router.get('/envios/:id', authorize(['cliente', 'administrador']), getEnvioById);

// Rutas para administradores
router.put('/envios/transportista', authorize(['administrador']), assignTransportista);
router.get('/envios', authorize(['administrador']), getAllEnvios);

router.put('/envios/estado', authorize(['administrador']), updateEnvioEstado);

module.exports = router;
