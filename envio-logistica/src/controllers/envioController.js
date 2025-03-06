const { createEnvio, updateEnvioEstado, getEnviosByUsuario, getEnvioById, updateTransportista, getEnvioByPedidoId, getEnvios} = require('../models/envioModel');
const axios = require('axios');

exports.createEnvio = async (req, res) => {
    const { pedidoId, direccionEnvio } = req.body;

    try {
        // Validar que el pedido exista y esté confirmado
        const pedidoUrl = `http://localhost:3003/api/pedidos/${pedidoId}`;
        const response = await axios.get(pedidoUrl, {
            headers: { Authorization: req.headers.authorization },
        });

        if (!response.data || response.data.estado !== 'confirmado') {
            return res.status(404).json({
                error: 'El pedido no existe o no está en estado confirmado',
            });
        }

        // Verificar si ya existe un envío para este pedido
        const envioExistente = await getEnvioByPedidoId(pedidoId);
        if (envioExistente) {
            return res.status(400).json({
                error: 'El pedido ya tiene un envío asociado',
            });
        }

        // Crear el registro del envío
        const envio = await createEnvio(pedidoId, response.data.usuario_id, direccionEnvio);

        res.status(201).json({
            message: 'Envío creado correctamente',
            envio,
        });
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return res.status(404).json({
                error: 'El pedido no existe en la base de datos',
            });
        }
        console.error('Error al crear el envío:', error.message);
        res.status(500).json({ error: 'Error al crear el envío' });
    }
};

// Actualizar estado del envío (solo administradores)
exports.updateEnvioEstado = async (req, res) => {
    const { envioId, estado, transportista } = req.body;

    try {
        const envio = await getEnvioById(envioId);
        if (!envio) {
            return res.status(404).json({ error: 'Envío no encontrado' });
        }

        // Validar si el estado está permitido
        const estadosPermitidos = ['pendiente', 'en tránsito', 'entregado', 'cancelado'];
        if (!estadosPermitidos.includes(estado)) {
            return res.status(400).json({ error: 'Estado no permitido' });
        }

        // Actualizar el transportista y el estado del envío
        const envioActualizado = await updateEnvioEstado(envioId, estado, transportista);

        res.status(200).json({
            message: 'Estado del envío actualizado correctamente',
            envio: envioActualizado,
        });
    } catch (error) {
        console.error('Error al actualizar el estado del envío:', error.message);
        res.status(500).json({ error: 'Error al actualizar el estado del envío' });
    }
};

// Obtener envíos de un usuario (clientes)
exports.getEnvios = async (req, res) => {
    const { id: usuarioId } = req.user;

    try {
        const envios = await getEnviosByUsuario(usuarioId);
        res.status(200).json(envios);
    } catch (error) {
        console.error('Error al obtener los envíos:', error.message);
        res.status(500).json({ error: 'Error al obtener los envíos' });
    }
};

// Asignar transportista (solo administrador)
exports.assignTransportista = async (req, res) => {
    const { envioId, transportista } = req.body;

    try {
        const envioActualizado = await updateTransportista(envioId, transportista);

        res.status(200).json({
            message: 'Transportista asignado correctamente',
            envio: envioActualizado,
        });
    } catch (error) {
        console.error('Error al asignar el transportista:', error.message);
        res.status(500).json({ error: 'Error al asignar el transportista' });
    }
};

// Obtener todos los envíos (solo administrador)
exports.getAllEnvios = async (req, res) => {
    try {
        const envios = await getEnvios();
        res.status(200).json(envios);
    } catch (error) {
        console.error('Error al obtener los envíos:', error.message);
        res.status(500).json({ error: 'Error al obtener los envíos' });
    }
};

// Obtener un envío por ID (cliente o administrador)
exports.getEnvioById = async (req, res) => {
    const { id } = req.params;

    try {
        const envio = await getEnvioById(id);

        if (!envio) {
            return res.status(404).json({ error: 'Envío no encontrado' });
        }

        res.status(200).json(envio);
    } catch (error) {
        console.error('Error al obtener el envío:', error.message);
        res.status(500).json({ error: 'Error al obtener el envío' });
    }
};
