const express = require('express');
const { registerPedido, confirmPedido, cancelPedido, getPedidosByUser, getPedidoById, updateEnvioEstado} = require('../controllers/pedidoController');
const authorize = require('../middlewares/authorize');

const router = express.Router();

// Ruta para registrar un pedido
router.post('/pedidos', authorize(['cliente']), registerPedido);

// Ruta para confirmar un pedido
router.put('/pedidos/confirm', authorize(['cliente']), confirmPedido);

// Ruta para cancelar un pedido
router.put('/pedidos/cancel', authorize(['cliente']), cancelPedido);

// Nueva ruta para obtener historial de pedidos del usuario
router.get('/pedidos/historial', authorize(['cliente']), getPedidosByUser);

// Nueva ruta para obtener un pedido por su ID
router.get('/pedidos/:id', authorize(['cliente', 'administrador']), getPedidoById);

module.exports = router;
