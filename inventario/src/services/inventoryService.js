const axios = require('axios');
const { publishToQueue } = require('../../../messaging/rabbitmq');

const inventoryService = {
  InventoryService: {
    InventoryPort: {
      // Método GetProduct
      GetProduct: async (args) => {
        try {
          const productId = args.id;
          const response = await axios.get(`http://localhost:3001/api/productos/${productId}`);
          const product = response.data;

          if (!product) {
            throw new Error('Producto no encontrado');
          }

          return {
            product: {
              id: product.id,
              nombre: product.nombre,
              descripcion: product.descripcion,
              precio: product.precio,
              stock: product.stock,
              imagen_url: product.imagen_url,
              fecha_creacion: product.fecha_creacion,
              fecha_actualizacion: product.fecha_actualizacion,
              categoria_id: product.categoria_id || null,
            },
          };
        } catch (error) {
          console.error('Error al obtener el producto:', error.message);
          throw {
            Fault: {
              faultcode: 'SOAP-ENV:Client',
              faultstring: 'Error al obtener el producto: ' + error.message,
            },
          };
        }
      },

      // Método UpdateStock
      UpdateStock: async (args) => {
        try {
          const { id, cantidad } = args;

          // Actualizar el stock directamente
          const response = await axios.put(`http://localhost:3001/api/productos/${id}/establecer-stock`, {
            nuevoStock: cantidad,
          });

          const updatedProduct = response.data.producto;

          // Publicar evento en RabbitMQ
          await publishToQueue('inventory_events', {
            type: 'STOCK_UPDATED',
            data: {
              id: updatedProduct.id,
              nombre: updatedProduct.nombre,
              stock: updatedProduct.stock,
              fecha_actualizacion: updatedProduct.fecha_actualizacion,
            },
          });

          return {
            status: 'Stock establecido correctamente',
            product: updatedProduct,
          };
        } catch (error) {
          console.error('Error al actualizar el stock:', error.message);
          throw {
            Fault: {
              faultcode: 'SOAP-ENV:Client',
              faultstring: 'Error al actualizar el stock: ' + error.message,
            },
          };
        }
      },
    },
  },
};

module.exports = inventoryService;
