const { pool } = require('../../config/db');

// Crear un carrito para un usuario
const createCart = async (usuarioId) => {
    const query = `INSERT INTO carritos (usuario_id) VALUES ($1) RETURNING *`;
    const values = [usuarioId];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Obtener el carrito de un usuario
const getCartByUserId = async (usuarioId) => {
    const query = `
        SELECT c.id AS carrito_id, cp.producto_id, cp.cantidad, cp.fecha_agregado
        FROM carritos c
        LEFT JOIN carrito_productos cp ON c.id = cp.carrito_id
        WHERE c.usuario_id = $1`;
    const values = [usuarioId];
    const result = await pool.query(query, values);
    return result.rows;
};

// Agregar un producto al carrito
const addProductToCart = async (carritoId, productoId, cantidad) => {
    const query = `
        INSERT INTO carrito_productos (carrito_id, producto_id, cantidad)
        VALUES ($1, $2, $3) RETURNING *`;
    const values = [carritoId, productoId, cantidad];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Actualizar la cantidad de un producto en el carrito
const updateProductQuantity = async (carritoId, productoId, cantidad) => {
    const query = `
        UPDATE carrito_productos
        SET cantidad = $1
        WHERE carrito_id = $2 AND producto_id = $3 RETURNING *`;
    const values = [cantidad, carritoId, productoId];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Eliminar un producto del carrito
const removeProductFromCart = async (carritoId, productoId) => {
    const query = `DELETE FROM carrito_productos WHERE carrito_id = $1 AND producto_id = $2 RETURNING *`;
    const values = [carritoId, productoId];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Vaciar el carrito de un usuario
const emptyCart = async (usuarioId) => {
    const query1 = `
        DELETE FROM carrito_productos
        WHERE carrito_id = (
            SELECT id FROM carritos WHERE usuario_id = $1
        )`;
    const query2 = `
        DELETE FROM carritos WHERE usuario_id = $1`;

    const values = [usuarioId];
    await pool.query(query1, values); // Eliminar productos del carrito
    await pool.query(query2, values); // Eliminar el carrito
};

module.exports = {
    createCart,
    getCartByUserId,
    addProductToCart,
    updateProductQuantity,
    removeProductFromCart,
    emptyCart
};
