const request = require('supertest');
const app = require('../../src/app');
const { pool } = require('../../config/db');
const jwt = require('jsonwebtoken');

describe('User Controller Tests', () => {
    let testEmail = 'test@example.com';
    let testPassword = 'Password123';
    let authTokenClient;

    beforeAll(async () => {
        console.log('📌 Preparando pruebas de usuario...');

        // 🛠 **Eliminar usuario si ya existe**
        await pool.query('DELETE FROM usuarios WHERE email = $1', [testEmail]);

        // 🛠 **Registrar usuario**
        const registerRes = await request(app).post('/api/usuarios/register').send({
            nombre: 'Prueba Usuario',
            email: testEmail,
            password: testPassword,
            rol: 'cliente'
        });

        console.log('📌 Respuesta del servidor - Registro:', registerRes.body);

        // 🛑 **Si la respuesta no es 201, lanzar error**
        if (registerRes.statusCode !== 201) {
            throw new Error(`❌ Error en el registro: ${JSON.stringify(registerRes.body)}`);
        }

        // 🛠 **Marcar el usuario como verificado**
        await pool.query('UPDATE usuarios SET is_verified = TRUE WHERE email = $1', [testEmail]);

        // 🛠 **Generar token de autenticación**
        authTokenClient = jwt.sign({ email: testEmail, rol: 'cliente' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    });

    afterAll(async () => {
        console.log('📌 Cerrando conexiones activas...');

        try {
            // 🛠 **Cerrar conexiones activas correctamente**
            await pool.query('SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = current_database() AND pid <> pg_backend_pid()');

            console.log('📌 Intentando cerrar pool de conexiones...');
            await pool.end();
            console.log('✅ Conexión a PostgreSQL cerrada correctamente.');
        } catch (error) {
            console.error('❌ Error al cerrar la conexión:', error.message);
        }

        // 🕐 **Evitar problemas con Jest**
        await new Promise(resolve => setTimeout(resolve, 1000));
    });

    test('POST /api/usuarios/register - Registro de usuario', async () => {
        const uniqueEmail = `nuevo${Date.now()}@example.com`; // Evita conflicto de usuario existente

        const res = await request(app).post('/api/usuarios/register').send({
            nombre: 'Nuevo Usuario',
            email: uniqueEmail,
            password: 'TestPassword123',
            rol: 'cliente'
        });

        console.log('📌 Respuesta del servidor - Registro:', res.body);

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('message', 'Usuario registrado. Verifica tu correo electrónico.');
        expect(res.body.user).toHaveProperty('email', uniqueEmail);
    });

    test('POST /api/usuarios/login - Inicio de sesión', async () => {
        const res = await request(app).post('/api/usuarios/login').send({
            email: testEmail,
            password: testPassword,
        });

        console.log('📌 Respuesta del servidor - Inicio de sesión:', res.body);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token');
    });

    test('GET /api/usuarios/verify - Verificar usuario', async () => {
        const verificationToken = jwt.sign({ email: testEmail }, process.env.JWT_SECRET, { expiresIn: '1h' });

        const res = await request(app).get(`/api/usuarios/verify?token=${verificationToken}`);

        console.log('📌 Respuesta del servidor - Verificar usuario:', res.body);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ message: 'Correo verificado exitosamente' });
    });
});
