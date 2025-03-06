const express = require('express');
const {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory
} = require('../controllers/categoryController');
const authorize = require('../middlewares/authorize');

const router = express.Router();

// Rutas protegidas para administradores
router.get('/categorias', getCategories); // Listar todas las categorías
router.get('/categorias/:id', getCategory); // Obtener una categoría por ID
router.post('/categorias', authorize(['administrador']), createCategory); // Crear categoría
router.put('/categorias/:id', authorize(['administrador']), updateCategory); // Actualizar categoría
router.delete('/categorias/:id', authorize(['administrador']), deleteCategory); // Eliminar categoría

module.exports = router;
