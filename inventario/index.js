const express = require('express');
const soap = require('soap');
const fs = require('fs');
const path = require('path');
const inventoryService = require('./src/services/inventoryService');
const { connectRabbitMQ } = require('../messaging/rabbitmq'); // Importa la conexión a RabbitMQ

const app = express();
const port = 4000;

// Middleware para parsear JSON
app.use(express.json());

// Cargar archivo WSDL
const wsdlPath = path.join(__dirname, 'inventory.wsdl');
const wsdl = fs.readFileSync(wsdlPath, 'utf8');

// Conectar a RabbitMQ antes de iniciar el servidor
(async () => {
  try {
    await connectRabbitMQ(); // Establece la conexión con RabbitMQ
    console.log('Conexión a RabbitMQ establecida en el servicio SOAP de Inventario.');
  } catch (error) {
    console.error('Error al conectar a RabbitMQ:', error.message);
    process.exit(1); // Termina el proceso si no se puede conectar
  }
})();

// Configurar el servicio SOAP en '/inventario'
soap.listen(app, '/inventario', inventoryService, wsdl);

// Servir el archivo WSDL en '/inventario?wsdl'
app.get('/inventario?wsdl', (req, res) => {
  res.set('Content-Type', 'text/xml');
  res.send(wsdl);
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servicio SOAP de Inventario corriendo en http://localhost:${port}/inventario`);
  console.log(`WSDL disponible en http://localhost:${port}/inventario?wsdl`);
});
