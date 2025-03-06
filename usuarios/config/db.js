const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: process.env.POSTGRES_PORT || 5432,
    idleTimeoutMillis: 5000, // ⏳ Cierra conexiones inactivas después de 5s
    connectionTimeoutMillis: 10000 // ⏳ Timeout para evitar bloqueos en pruebas
});

pool.on('error', (err) => {
    console.error('❌ Error inesperado en la conexión de la base de datos:', err.message);
});

const connectDB = async () => {
    try {
        const client = await pool.connect();
        console.log('✅ Conexión a PostgreSQL exitosa');
        client.release();  // 🔄 **Liberar conexión inmediatamente**
    } catch (error) {
        console.error('❌ Error al conectar a PostgreSQL:', error.message);
        process.exit(1);
    }
};


module.exports = { pool, connectDB };
