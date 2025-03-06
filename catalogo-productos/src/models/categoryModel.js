const { pool } = require('../../config/db');

// Obtener todas las categorías
const getAllCategories = async () => {
    const result = await pool.query('SELECT * FROM categorias');
    return result.rows;
};

// Obtener una categoría por ID
const getCategoryById = async (id) => {
    const result = await pool.query('SELECT * FROM categorias WHERE id = $1', [id]);
    return result.rows[0];
};

// Crear una nueva categoría
const createCategory = async (nombre, descripcion) => {
    const query = `INSERT INTO categorias (nombre, descripcion) VALUES ($1, $2) RETURNING *`;
    const values = [nombre, descripcion];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Actualizar una categoría
const updateCategory = async (id, nombre, descripcion) => {
    const query = `UPDATE categorias SET nombre = $1, descripcion = $2 WHERE id = $3 RETURNING *`;
    const values = [nombre, descripcion, id];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Eliminar una categoría
const deleteCategory = async (id) => {
    const result = await pool.query('DELETE FROM categorias WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
};

module.exports = { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory };
