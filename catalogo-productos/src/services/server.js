const app = require('../app');  // ✅ Ahora `app.js` exporta la instancia correctamente

const PORT = process.env.TEST_PORT || 0; // Asignar un puerto libre automáticamente
const server = app.listen(PORT, () => {
    console.log(`Servidor de pruebas en ejecución en el puerto ${server.address().port}`);
});

module.exports = server;
