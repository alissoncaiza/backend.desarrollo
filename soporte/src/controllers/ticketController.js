const axios = require('axios');
const {
  createTicket,
  getTicketById,
  updateTicketStatus,
  getAllTickets,
} = require('../models/ticketModel');

const USERS_SERVICE_URL = process.env.USERS_SERVICE_URL || 'http://localhost:3000/api/usuarios';

// Crear un nuevo ticket
exports.createTicket = async (usuarioId, asunto, descripcion) => {
  return await createTicket(usuarioId, asunto, descripcion);
};

// Obtener un ticket por su ID
exports.getTicketById = async (id) => {
  return await getTicketById(id);
};

// Actualizar el estado de un ticket
exports.updateTicketStatus = async (id, estado) => {
  return await updateTicketStatus(id, estado);
};

// Obtener todos los tickets
exports.getAllTickets = async () => {
  return await getAllTickets();
};

// Validar si el usuario existe en el microservicio de usuarios con JWT
exports.validateUser = async (usuarioId, token) => {
  try {
    const response = await axios.get(`${USERS_SERVICE_URL}/${usuarioId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error(`Error al validar usuario ${usuarioId}:`, error.message);
    return null;
  }
};
