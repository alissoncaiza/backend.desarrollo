const { pool } = require('../../config/db');

// Obtener todos los productos
const getAllProducts = async () => {
    const result = await pool.query('SELECT * FROM productos');
    return result.rows;
};

// Obtener un producto por ID
const getProductById = async (id) => {
    console.log(`Consultando producto con ID: ${id}`);
    const result = await pool.query('SELECT * FROM productos WHERE id = $1', [id]);
    if (result.rows.length === 0) {
        console.error(`Producto con ID ${id} no encontrado en la base de datos`);
    } else {
        console.log('Producto encontrado en la base de datos:', result.rows[0]);
    }
    return result.rows[0];
};


// Crear un nuevo producto
const createProduct = async (nombre, descripcion, precio, stock, imagen_url, categoria_id) => {
    const query = `
        INSERT INTO productos (nombre, descripcion, precio, stock, imagen_url, categoria_id)
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
    const values = [nombre, descripcion, precio, stock, imagen_url, categoria_id];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Actualizar un producto
const updateProduct = async (id, nombre, descripcion, precio, stock, imagen_url, categoria_id) => {
    const query = `
        UPDATE productos
        SET nombre = $1, descripcion = $2, precio = $3, stock = $4, imagen_url = $5, categoria_id = $6
        WHERE id = $7 RETURNING *`;
    const values = [nombre, descripcion, precio, stock, imagen_url, categoria_id, id];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Eliminar un producto
const deleteProduct = async (id) => {
    const result = await pool.query('DELETE FROM productos WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
};

const updateProductStock = async (id, cantidad) => {
    const query = `
        UPDATE productos
        SET stock = stock + $1, fecha_actualizacion = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *`;
    const values = [cantidad, id];
    const result = await pool.query(query, values);
    return result.rows[0];
};

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, updateProductStock};
