const { pool } = require('../../config/db');

// Crear un nuevo pedido con un total inicial de 0
const createPedido = async (usuarioId) => {
    const query = `
        INSERT INTO pedidos (usuario_id, estado, fecha_creacion, total) 
        VALUES ($1, 'pendiente', NOW(), 0) RETURNING *`;
    const values = [usuarioId];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Agregar productos al pedido
const addProductosToPedido = async (pedidoId, productos) => {
    const query = `
        INSERT INTO pedido_productos (pedido_id, producto_id, cantidad, subtotal) 
        VALUES ($1, $2, $3, $4) RETURNING *`;
    const results = [];
    for (const producto of productos) {
        const values = [pedidoId, producto.producto_id, producto.cantidad, producto.subtotal];
        const result = await pool.query(query, values);
        results.push(result.rows[0]);
    }
    return results;
};

// Actualizar el total del pedido
const updatePedidoTotal = async (pedidoId, total) => {
    const query = `
        UPDATE pedidos
        SET total = $1
        WHERE id = $2 RETURNING *`;
    const values = [total, pedidoId];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Actualizar estado del pedido
const updatePedidoEstado = async (pedidoId, estado) => {
    const query = `
        UPDATE pedidos
        SET estado = $1
        WHERE id = $2 RETURNING *`;
    const values = [estado, pedidoId];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Obtener productos del pedido
const getProductosByPedidoId = async (pedidoId) => {
    const query = `
        SELECT producto_id, cantidad
        FROM pedido_productos
        WHERE pedido_id = $1`;
    const result = await pool.query(query, [pedidoId]);
    return result.rows;
};

// Obtener un pedido por su ID
const getPedidoById = async (pedidoId) => {
    const query = `
        SELECT * FROM pedidos 
        WHERE id = $1`;
    const result = await pool.query(query, [pedidoId]);
    return result.rows[0];
};

// Obtener todos los pedidos de un usuario
const getPedidosByUsuarioId = async (usuarioId) => {
    const query = `
        SELECT id, estado, fecha_creacion, total 
        FROM pedidos 
        WHERE usuario_id = $1 
        ORDER BY fecha_creacion DESC`;
    const values = [usuarioId];
    const result = await pool.query(query, values);
    return result.rows;
};

module.exports = {
    createPedido,
    addProductosToPedido,
    updatePedidoTotal,
    updatePedidoEstado,
    getProductosByPedidoId,
    getPedidoById,
    getPedidosByUsuarioId,
};
