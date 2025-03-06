const pool = require('../../config/db');

// Crear un nuevo ticket
const createTicket = async (usuarioId, asunto, descripcion) => {
  const query = `
    INSERT INTO tickets (usuario_id, asunto, descripcion)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const values = [usuarioId, asunto, descripcion];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Obtener un ticket por ID
const getTicketById = async (id) => {
  const query = `SELECT * FROM tickets WHERE id = $1;`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// Actualizar el estado de un ticket
const updateTicketStatus = async (id, estado) => {
  const query = `
    UPDATE tickets
    SET estado = $1, fecha_actualizacion = NOW()
    WHERE id = $2
    RETURNING *;
  `;
  const result = await pool.query(query, [estado, id]);
  return result.rows[0];
};

// Obtener todos los tickets
const getAllTickets = async () => {
  const query = `SELECT * FROM tickets ORDER BY fecha_creacion DESC;`;
  const result = await pool.query(query);
  return result.rows;
};

module.exports = {
  createTicket,
  getTicketById,
  updateTicketStatus,
  getAllTickets,
};
