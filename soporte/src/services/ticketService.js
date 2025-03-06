const ticketController = require('../controllers/ticketController');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecreto';

const ticketService = {
  TicketService: {
    TicketPort: {
      // Middleware para validar el token y obtener usuarioId y rol
      authenticate: async (args) => {
        const token = args.token;
        if (!token) {
          throw new Error('Autenticación requerida: Token no proporcionado.');
        }

        try {
          const decoded = jwt.verify(token, JWT_SECRET);
          return decoded; // Devuelve los datos del usuario (id, email, rol)
        } catch (error) {
          throw new Error('Token inválido o expirado.');
        }
      },

      // Crear un nuevo ticket (Solo CLIENTES pueden hacerlo)
      CreateTicket: async (args) => {
        const { token, asunto, descripcion } = args;

        // Validar el token y obtener usuarioId y rol
        const userData = await ticketService.TicketService.TicketPort.authenticate({ token });
        const { id: usuarioId, rol } = userData; // Extrae usuarioId y rol

        if (rol !== 'cliente') {
          throw new Error('Acceso denegado: Solo los clientes pueden crear tickets.');
        }

        // Validar si el usuario existe
        const usuario = await ticketController.validateUser(usuarioId, token);
        if (!usuario) {
          throw new Error(`El usuario con ID ${usuarioId} no existe.`);
        }

        // Crear el ticket si el usuario es válido
        const ticket = await ticketController.createTicket(usuarioId, asunto, descripcion);
        return { ticket };
      },

      // Obtener un ticket por ID (Solo ADMIN puede hacerlo)
      GetTicketById: async ({ token, id }) => {
        const userData = await ticketService.TicketService.TicketPort.authenticate({ token });
        if (userData.rol !== 'administrador') {
          throw new Error('Acceso denegado: Solo los administradores pueden ver tickets.');
        }

        const ticket = await ticketController.getTicketById(id);
        if (!ticket) {
          throw new Error('Ticket no encontrado.');
        }
        return { ticket };
      },

      // Actualizar el estado de un ticket (Solo ADMIN puede hacerlo)
      UpdateTicketStatus: async ({ token, id, estado }) => {
        const userData = await ticketService.TicketService.TicketPort.authenticate({ token });
        if (userData.rol !== 'administrador') {
          throw new Error('Acceso denegado: Solo los administradores pueden actualizar tickets.');
        }

        const ticket = await ticketController.updateTicketStatus(id, estado);
        return { ticket };
      },

      // Obtener todos los tickets (Solo ADMIN puede hacerlo)
      GetAllTickets: async ({ token }) => {
        const userData = await ticketService.TicketService.TicketPort.authenticate({ token });
        if (userData.rol !== 'administrador') {
          throw new Error('Acceso denegado: Solo los administradores pueden ver todos los tickets.');
        }

        const tickets = await ticketController.getAllTickets();
        return { tickets };
      },
    },
  },
};

module.exports = ticketService;
