const { connectRabbitMQ } = require('./rabbitmq');

// Función genérica para consumir mensajes de cualquier cola
async function consumeMessages(queueName, onMessage) {
  try {
    const channel = await connectRabbitMQ();
    if (!channel) {
      throw new Error('El canal no fue inicializado correctamente.');
    }

    // Asegurarse de que la cola existe
    await channel.assertQueue(queueName, { durable: true });

    console.log(`Esperando mensajes en la cola: ${queueName}`);

    channel.consume(queueName, (msg) => {
      if (msg) {
        const content = msg.content.toString();
        console.log(`Mensaje recibido de ${queueName}:`, content);
        onMessage(JSON.parse(content)); // Procesar el mensaje con la función de callback
        channel.ack(msg); // Confirmar recepción del mensaje
      } else {
        console.log('Mensaje vacío recibido');
      }
    });
  } catch (error) {
    console.error(`Error al consumir mensajes de la cola "${queueName}":`, error.message);
  }
}

// Función específica para consumir eventos de inventario
async function consumeInventoryEvents() {
  consumeMessages('inventory_events', (message) => {
    console.log('Procesando evento de inventario:', message);
    // Aquí puedes agregar lógica específica para manejar los mensajes de inventario
  });
}

// Inicia el consumo de eventos de inventario
consumeInventoryEvents();

async function consumePedidoEvents() {
  try {
      const channel = await connectRabbitMQ();
      if (!channel) {
          throw new Error('El canal no fue inicializado correctamente.');
      }

      const queueName = 'pedido_events';

      // Asegurarse de que la cola existe
      await channel.assertQueue(queueName, { durable: true });

      console.log(`Esperando mensajes en la cola: ${queueName}`);

      channel.consume(queueName, (msg) => {
          if (msg) {
              console.log('Mensaje recibido:', msg.content.toString());
              channel.ack(msg); // Confirmar recepción del mensaje
          } else {
              console.log('Mensaje vacío recibido');
          }
      });
  } catch (error) {
      console.error('Error al consumir mensajes:', error.message);
  }
}

consumePedidoEvents();

module.exports = { consumeMessages };
