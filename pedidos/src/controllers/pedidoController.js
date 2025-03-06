const { createPedido, addProductosToPedido, updatePedidoTotal, updatePedidoEstado, getProductosByPedidoId, getPedidoById, getPedidosByUsuarioId} = require('../models/pedidoModel');
const axios = require('axios');
const { publishToQueue } = require('../../../messaging/rabbitmq');

// Registrar un pedido basado en el carrito completo
exports.registerPedido = async (req, res) => {
    const { id: usuarioId } = req.user;
  
    try {
      // Obtener el carrito completo del usuario desde el microservicio de carrito
      const carritoUrl = `http://localhost:3002/api/carrito`;
      const response = await axios.get(carritoUrl, {
        headers: { Authorization: req.headers.authorization },
      });
      const carrito = response.data;
  
      // Validar que el carrito no esté vacío
      if (!carrito.length) {
        return res.status(400).json({ error: 'El carrito está vacío, no se puede crear el pedido' });
      }
  
      // Crear un único pedido para el usuario
      const pedido = await createPedido(usuarioId);
  
      let total = 0;
  
      // Obtener detalles de los productos desde el microservicio de catálogo
      const productos = [];
      for (const item of carrito) {
        const catalogoUrl = `http://localhost:3001/api/productos/${item.producto_id}`;
        const catalogoResponse = await axios.get(catalogoUrl);
        const producto = catalogoResponse.data;
  
        if (!producto) {
          return res.status(404).json({ error: `Producto con ID ${item.producto_id} no encontrado en el catálogo` });
        }
  
        // Calcular el subtotal para este producto
        const subtotal = producto.precio * item.cantidad;
        total += subtotal;
  
        productos.push({
          producto_id: item.producto_id,
          cantidad: item.cantidad,
          subtotal,
        });
      }
  
      // Agregar los productos del carrito al pedido
      const pedidoProductos = await addProductosToPedido(pedido.id, productos);
  
      // Actualizar el total del pedido
      const pedidoActualizado = await updatePedidoTotal(pedido.id, total);
  
      // Vaciar el carrito después de registrar el pedido
      const clearCartUrl = `http://localhost:3002/api/carrito/clear`;
      await axios.delete(clearCartUrl, {
        headers: { Authorization: req.headers.authorization },
      });
  
      res.status(201).json({
        message: 'Pedido registrado correctamente',
        pedido: pedidoActualizado,
        productos: pedidoProductos,
      });
    } catch (error) {
        console.error('Error al registrar el pedido:', error.stack);
      res.status(500).json({ error: 'Error al registrar el pedido' });
    }
  };

  exports.confirmPedido = async (req, res) => {
    const { pedidoId } = req.body;

    try {
        // Verificar que el pedido exista y obtener su estado actual
        const pedido = await getPedidoById(pedidoId);
        if (!pedido) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        // Validar que el pedido no esté ya confirmado o cancelado
        if (pedido.estado === 'confirmado') {
            return res.status(400).json({ error: 'El pedido ya está confirmado, no se puede volver a confirmar' });
        }
        if (pedido.estado === 'cancelado') {
            return res.status(400).json({ error: 'El pedido ya está cancelado, no se puede confirmar' });
        }

        // Obtener los productos del pedido
        const productos = await getProductosByPedidoId(pedidoId);
        if (!productos.length) {
            return res.status(404).json({ error: 'El pedido no tiene productos asociados' });
        }

        // Actualizar el stock en el catálogo para cada producto
        for (const producto of productos) {
            const catalogoUrl = `http://localhost:3001/api/productos/${producto.producto_id}/actualizar-stock`;
            await axios.put(
                catalogoUrl,
                { cantidad: producto.cantidad },
                { headers: { Authorization: req.headers.authorization } }
            );
        }

        // Cambiar el estado del pedido a "confirmado"
        const pedidoActualizado = await updatePedidoEstado(pedidoId, 'confirmado');

        // Publicar el evento en RabbitMQ
        await publishToQueue('pedido_events', {
            type: 'PEDIDO_CONFIRMADO',
            data: {
                id: pedidoId,
                estado: 'confirmado',
                usuarioId: pedidoActualizado.usuario_id,
                productos,
                total: pedidoActualizado.total,
                fechaConfirmacion: new Date().toISOString(),
            },
        });

        res.status(200).json({
            message: 'Pedido confirmado correctamente',
            pedido: pedidoActualizado,
        });
    } catch (error) {
        console.error('Error al confirmar el pedido:', error.message);
        res.status(500).json({ error: 'Error al confirmar el pedido' });
    }
};

// Cancelar un pedido
exports.cancelPedido = async (req, res) => {
    const { pedidoId } = req.body;

    try {
        // Verificar que el pedido exista y obtener su estado actual
        const pedido = await getPedidoById(pedidoId);
        if (!pedido) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        // Validar que el pedido no esté ya confirmado o cancelado
        if (pedido.estado === 'confirmado') {
            return res.status(400).json({ error: 'El pedido ya está confirmado, no se puede cancelar' });
        }
        if (pedido.estado === 'cancelado') {
            return res.status(400).json({ error: 'El pedido ya está cancelado, no se puede volver a cancelar' });
        }

        // Cambiar el estado del pedido a "cancelado"
        const pedidoActualizado = await updatePedidoEstado(pedidoId, 'cancelado');

        // Publicar el evento de cancelación en RabbitMQ
        await publishToQueue('pedido_events', {
            type: 'PEDIDO_CANCELADO',
            data: {
                id: pedidoId,
                estado: 'cancelado',
                usuarioId: pedidoActualizado.usuario_id,
                total: pedidoActualizado.total,
                fechaCancelacion: new Date().toISOString(),
            },
        });

        res.status(200).json({
            message: 'Pedido cancelado correctamente',
            pedido: pedidoActualizado,
        });
    } catch (error) {
        console.error('Error al cancelar el pedido:', error.message);
        res.status(500).json({ error: 'Error al cancelar el pedido' });
    }
};


// Obtener historial de pedidos por usuario
exports.getPedidosByUser = async (req, res) => {
    const { id: usuarioId } = req.user;

    try {
        // Obtener todos los pedidos del usuario
        const pedidos = await getPedidosByUsuarioId(usuarioId);

        if (!pedidos.length) {
            return res.status(404).json({ message: 'No se encontraron pedidos para este usuario' });
        }

        res.status(200).json({ pedidos });
    } catch (error) {
        console.error('Error al obtener el historial de pedidos:', error.message);
        res.status(500).json({ error: 'Error al obtener el historial de pedidos' });
    }
};

exports.getPedidoById = async (req, res) => {
    const { id } = req.params;

    try {
        const pedido = await getPedidoById(id);
        if (!pedido) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }
        res.status(200).json(pedido);
    } catch (error) {
        console.error('Error al obtener el pedido:', error.message);
        res.status(500).json({ error: 'Error al obtener el pedido' });
    }
};