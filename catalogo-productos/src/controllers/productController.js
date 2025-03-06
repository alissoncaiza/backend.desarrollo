const { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../models/productModel');
const { pool } = require('../../config/db');

// Obtener todos los productos
exports.getProducts = async (req, res) => {
    try {
        const products = await getAllProducts();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los productos' });
    }
};

exports.getProduct = async (req, res) => {
    try {
        console.log('ID recibido en la solicitud:', req.params.id);
        const product = await getProductById(req.params.id);
        if (!product) {
            console.error('Producto no encontrado en la base de datos');
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        console.log('Producto encontrado:', product);
        res.status(200).json(product);
    } catch (error) {
        console.error('Error al obtener el producto:', error.message);
        res.status(500).json({ error: 'Error al obtener el producto' });
    }
};

// Crear un nuevo producto
exports.createProduct = async (req, res) => {
    const { nombre, descripcion, precio, stock, imagen_url, categoria_id } = req.body;

    try {
        // Validar que el nombre no esté duplicado
        const existingProducts = await getAllProducts();
        const productExists = existingProducts.some(product => product.nombre === nombre);

        if (productExists) {
            return res.status(400).json({ error: 'Ya existe un producto con este nombre' });
        }

        // Crear el producto si no existe
        const newProduct = await createProduct(nombre, descripcion, precio, stock, imagen_url, categoria_id);
        res.status(201).json(newProduct);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Error al crear el producto' });
    }
};

// Actualizar un producto
exports.updateProduct = async (req, res) => {
    const { nombre, descripcion, precio, stock, imagen_url, categoria_id } = req.body;
    try {
        const updatedProduct = await updateProduct(req.params.id, nombre, descripcion, precio, stock, imagen_url, categoria_id);
        if (!updatedProduct) return res.status(404).json({ error: 'Producto no encontrado' });
        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el producto' });
    }
};

// Eliminar un producto
exports.deleteProduct = async (req, res) => {
    try {
        const deletedProduct = await deleteProduct(req.params.id);
        if (!deletedProduct) return res.status(404).json({ error: 'Producto no encontrado' });
        res.status(200).json({ message: 'Producto eliminado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el producto' });
    }
};

exports.updateStock = async (req, res) => {
    const { id } = req.params;
    const { cantidad } = req.body;

    try {
        const query = `
            UPDATE productos
            SET stock = stock - $1
            WHERE id = $2 AND stock >= $1 RETURNING *`;
        const values = [cantidad, id];
        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            return res.status(400).json({ error: 'Stock insuficiente o producto no encontrado' });
        }

        res.status(200).json({
            message: 'Stock actualizado correctamente',
            producto: result.rows[0],
        });
    } catch (error) {
        console.error('Error al actualizar el stock:', error.message);
        res.status(500).json({ error: 'Error al actualizar el stock' });
    }
};

exports.setProductStock = async (req, res) => {
    const { id } = req.params; // ID del producto
    const { nuevoStock } = req.body; // Nuevo valor absoluto del stock

    try {
        // Consulta para establecer el stock directamente
        const query = `
            UPDATE productos
            SET stock = $1
            WHERE id = $2 RETURNING *`;
        const values = [nuevoStock, id];

        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.status(200).json({
            message: 'Stock establecido correctamente',
            producto: result.rows[0],
        });
    } catch (error) {
        console.error('Error al establecer el stock:', error.message);
        res.status(500).json({ error: 'Error al establecer el stock' });
    }
};


