const { connectRabbitMQ } = require('./rabbitmq');
const { consumeMessages } = require('./consumer');

const startMessaging = async () => {
  try {
    await connectRabbitMQ();

    // Consumir eventos de inventario
    consumeMessages('inventory_events', (event) => {
      console.log('Evento de inventario procesado:', event);
    });

    // Consumir eventos de pedidos
    consumeMessages('pedido_events', (event) => {
      console.log('Evento de pedido procesado:', event);
    });

    console.log('Sistema de mensajería inicializado');
  } catch (error) {
    console.error('Error al inicializar el sistema de mensajería:', error.message);
  }
};

startMessaging();
