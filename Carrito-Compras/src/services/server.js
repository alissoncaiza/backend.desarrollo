const app = require('../app');

const PORT = process.env.TEST_PORT || 0;  // Cambia a 0 para asignar un puerto aleatorio
const server = app.listen(PORT, () => {
    console.log(`Servidor de pruebas en ejecución en el puerto ${server.address().port}`);
});

module.exports = server;
