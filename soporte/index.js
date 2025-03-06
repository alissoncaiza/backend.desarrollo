const express = require('express');
const soap = require('soap');
const fs = require('fs');
const path = require('path');
const ticketService = require('./src/services/ticketService');

const app = express();
const port = 5000;

// Middleware para parsear JSON
app.use(express.json());

// Cargar archivo WSDL
const wsdlPath = path.join(__dirname, 'ticket.wsdl');
const wsdl = fs.readFileSync(wsdlPath, 'utf8');

// Configurar servicio SOAP
soap.listen(app, '/tickets', ticketService, wsdl);

// Servir WSDL
app.get('/tickets?wsdl', (req, res) => {
  res.set('Content-Type', 'text/xml');
  res.send(wsdl);
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servicio SOAP corriendo en http://localhost:${port}/tickets`);
  console.log(`WSDL disponible en http://localhost:${port}/tickets?wsdl`);
});
