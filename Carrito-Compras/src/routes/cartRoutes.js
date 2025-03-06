const express = require('express');
const { getCart, addProduct, updateQuantity, removeProduct, clearCart} = require('../controllers/cartController');
const authorize = require('../middlewares/authorize');

const router = express.Router();

// Rutas protegidas para usuarios autenticados
router.get('/carrito', authorize(['cliente', 'administrador']), getCart);
router.post('/carrito', authorize(['cliente']), addProduct);
router.put('/carrito', authorize(['cliente']), updateQuantity);
router.delete('/carrito', authorize(['cliente']), removeProduct);
// Nueva ruta para vaciar el carrito
router.delete('/carrito/clear', authorize(['cliente']), clearCart);

module.exports = router;
