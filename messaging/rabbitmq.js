const amqp = require('amqplib');

let connection = null;
let channel = null;

// Conectar a RabbitMQ
async function connectRabbitMQ() {
    try {
        if (!connection) {
            connection = await amqp.connect('amqp://localhost');
            console.log('Conexión a RabbitMQ establecida');
        }
        if (!channel) {
            channel = await connection.createChannel();
            console.log('Canal de RabbitMQ creado');
        }
        return channel;
    } catch (error) {
        console.error('Error al conectar a RabbitMQ:', error.message);
        throw error;
    }
}

// Publicar un mensaje en una cola
async function publishToQueue(queueName, message) {
    try {
        if (!channel) {
            await connectRabbitMQ();
        }
        await channel.assertQueue(queueName, { durable: true });
        channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
            persistent: true,
        });
        console.log(`Mensaje publicado en la cola "${queueName}":`, message);
    } catch (error) {
        console.error(`Error al publicar mensaje en la cola "${queueName}":`, error.message);
        throw error;
    }
}

// Cerrar conexión
async function closeConnection() {
    try {
        if (channel) {
            await channel.close();
            console.log('Canal de RabbitMQ cerrado');
        }
        if (connection) {
            await connection.close();
            console.log('Conexión a RabbitMQ cerrada');
        }
    } catch (error) {
        console.error('Error al cerrar conexión a RabbitMQ:', error.message);
    }
}

module.exports = {
    connectRabbitMQ,
    publishToQueue,
    closeConnection,
};
