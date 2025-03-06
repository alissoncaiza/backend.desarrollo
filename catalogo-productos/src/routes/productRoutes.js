const express = require('express');
const {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    setProductStock
} = require('../controllers/productController');
const authorize = require('../middlewares/authorize');

const router = express.Router();

// Rutas públicas (clientes y administradores)
router.get('/productos', getProducts);
router.get('/productos/:id', getProduct);

// Rutas protegidas (solo administradores)
router.post('/productos', authorize(['administrador']), createProduct);
router.put('/productos/:id', authorize(['administrador']), updateProduct);
router.delete('/productos/:id', authorize(['administrador']), deleteProduct);

// Ruta para actualizar el stock (clientes y administradores)
router.put('/productos/:id/actualizar-stock', authorize(['cliente', 'administrador']), updateStock);

// Nueva ruta para establecer el stock directamente (solo administradores)
router.put('/productos/:id/establecer-stock', setProductStock);

module.exports = router;
