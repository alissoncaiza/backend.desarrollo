const {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
} = require('../models/categoryModel');

// Obtener todas las categorías
exports.getCategories = async (req, res) => {
    try {
        const categories = await getAllCategories();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las categorías' });
    }
};

// Obtener una categoría por ID
exports.getCategory = async (req, res) => {
    try {
        const category = await getCategoryById(req.params.id);
        if (!category) return res.status(404).json({ error: 'Categoría no encontrada' });
        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener la categoría' });
    }
};

// Crear una nueva categoría
exports.createCategory = async (req, res) => {
    const { nombre, descripcion } = req.body;

    try {
        // Validar que no exista una categoría con el mismo nombre
        const categories = await getAllCategories();
        const exists = categories.some(cat => cat.nombre === nombre);

        if (exists) {
            return res.status(400).json({ error: 'La categoría ya existe' });
        }

        const newCategory = await createCategory(nombre, descripcion);
        res.status(201).json(newCategory);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear la categoría' });
    }
};

// Actualizar una categoría
exports.updateCategory = async (req, res) => {
    const { nombre, descripcion } = req.body;

    try {
        const updatedCategory = await updateCategory(req.params.id, nombre, descripcion);
        if (!updatedCategory) return res.status(404).json({ error: 'Categoría no encontrada' });
        res.status(200).json(updatedCategory);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la categoría' });
    }
};

// Eliminar una categoría
exports.deleteCategory = async (req, res) => {
    try {
        const deletedCategory = await deleteCategory(req.params.id);
        if (!deletedCategory) return res.status(404).json({ error: 'Categoría no encontrada' });
        res.status(200).json({ message: 'Categoría eliminada' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la categoría' });
    }
};
