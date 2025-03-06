const { Pool } = require('pg');
require('dotenv').config();

// ✅ **Crear una sola instancia de pool (sin llamar a `.connect()`)**
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    max: 10, // 🔄 **Límite de conexiones en el pool**
    idleTimeoutMillis: 30000, // 🕒 **Tiempo antes de cerrar conexiones inactivas**
    connectionTimeoutMillis: 2000, // ⏳ **Tiempo máximo de espera para conexión**
});

// ✅ **Probar la conexión (una sola vez)**
(async () => {
    try {
        const client = await pool.connect();
        console.log('✅ Conexión a PostgreSQL exitosa');
        client.release(); // 🔄 **Liberar conexión inmediatamente**
    } catch (err) {
        console.error('❌ Error al conectar a PostgreSQL:', err.message);
        process.exit(1);
    }
})();

// ✅ **Cerrar el pool al terminar las pruebas**
const closePool = async () => {
    try {
        await pool.end();
        console.log('✅ Conexión a PostgreSQL cerrada correctamente.');
    } catch (err) {
        console.error('❌ Error al cerrar la conexión a PostgreSQL:', err.message);
    }
};

module.exports = { pool, closePool };
