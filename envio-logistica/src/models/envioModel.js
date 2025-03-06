const { pool } = require('../../config/db');

// Crear un envío
const createEnvio = async (pedidoId, usuarioId, direccionEnvio, transportista) => {
    const query = `
        INSERT INTO envios (pedido_id, usuario_id, direccion_envio, transportista, estado)
        VALUES ($1, $2, $3, $4, 'pendiente') RETURNING *`;
    const values = [pedidoId, usuarioId, direccionEnvio, transportista];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Actualizar estado y transportista del envío
const updateEnvioEstado = async (envioId, estado, transportista = null) => {
    const query = `
        UPDATE envios
        SET estado = $1, transportista = COALESCE($2, transportista), fecha_actualizacion = NOW()
        WHERE id = $3 RETURNING *`;
    const values = [estado, transportista, envioId];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Obtener envíos de un usuario
const getEnviosByUsuario = async (usuarioId) => {
    const query = `SELECT * FROM envios WHERE usuario_id = $1`;
    const result = await pool.query(query, [usuarioId]);
    return result.rows;
};

// Obtener un envío por ID
const getEnvioById = async (envioId) => {
    const query = `SELECT * FROM envios WHERE id = $1`;
    const result = await pool.query(query, [envioId]);
    return result.rows[0];
};

// Obtener todos los envíos
const getEnvios = async () => {
    const query = `SELECT * FROM envios`;
    const result = await pool.query(query);
    return result.rows;
};

// Asignar un transportista a un envío
const updateTransportista = async (envioId, transportista) => {
    const query = `
        UPDATE envios
        SET transportista = $1
        WHERE id = $2 RETURNING *`;
    const values = [transportista, envioId];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Obtener un envío por el pedido_id
const getEnvioByPedidoId = async (pedidoId) => {
    const query = `SELECT * FROM envios WHERE pedido_id = $1`;
    const result = await pool.query(query, [pedidoId]);
    return result.rows[0];
};

module.exports = {
    createEnvio,
    updateEnvioEstado,
    getEnviosByUsuario,
    getEnvioById,
    updateTransportista,
    getEnvios,
    getEnvioByPedidoId,
};
