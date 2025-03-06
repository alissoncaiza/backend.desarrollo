const request = require('supertest');
const app = require('../../src/app');
const { pool } = require('../../config/db');
const jwt = require('jsonwebtoken');
const nock = require('nock');

jest.setTimeout(30000); // Aumenta el timeout para evitar fallos por pruebas lentas

// 🔹 Mock de autenticación
const authTokenCliente = jwt.sign(
    { id: 1, email: 'cliente@example.com', rol: 'cliente' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
);

const authTokenAdmin = jwt.sign(
    { id: 2, email: 'admin@example.com', rol: 'administrador' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
);

describe('📦 Pruebas del Microservicio de Envíos', () => {
    let testEnvioId;
    let testPedidoId = Math.floor(Math.random() * 1000000); // 🔹 Genera un ID dentro del rango seguro

    beforeAll(async () => {
        console.log('📌 Preparando mocks y pruebas...');

        // 🔹 Mock de validación de pedidos (pedido confirmado)
        nock('http://localhost:3003')
            .persist()
            .get(new RegExp(`/api/pedidos/${testPedidoId}`))
            .reply(200, { id: testPedidoId, usuario_id: 1, estado: 'confirmado' });

        // 🔹 Mock para verificar que el pedido no tenga un envío
        nock('http://localhost:3004')
            .persist()
            .get(new RegExp(`/api/envios/${testPedidoId}`))
            .reply(404, { error: 'Envío no encontrado' });

        // 🔹 Limpieza previa para evitar errores de duplicado
        await pool.query('DELETE FROM envios WHERE pedido_id = $1', [testPedidoId]);
    });

    afterAll(async () => {
        console.log('📌 Cerrando conexiones activas...');
    
        // Espera a que todas las operaciones asíncronas terminen
        await new Promise((resolve) => setTimeout(resolve, 500));
    
        try {
            await pool.end();
            console.log('✅ Conexión a PostgreSQL cerrada correctamente.');
        } catch (error) {
            console.error('❌ Error al cerrar la conexión a PostgreSQL:', error.message);
        }
    
        try {
            nock.cleanAll();
            nock.restore();
            console.log('✅ Mocks de nock limpiados correctamente.');
        } catch (error) {
            console.error('❌ Error al limpiar los mocks de nock:', error.message);
        }
    
        console.log('✅ Todas las pruebas han finalizado.');
    });    
    

    test('✅ POST /api/envios - Crear un envío', async () => {
        const res = await request(app)
            .post('/api/envios')
            .set('Authorization', `Bearer ${authTokenCliente}`)
            .send({ pedidoId: testPedidoId, direccionEnvio: 'Calle Falsa 123' });

        console.log('📌 Respuesta del servidor - Crear envío:', res.body);

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('message', 'Envío creado correctamente');
        expect(res.body.envio).toHaveProperty('id');
        testEnvioId = res.body.envio.id;
    });

    test('✅ GET /api/envios/:id - Obtener un envío por ID', async () => {
        expect(testEnvioId).toBeDefined();

        const res = await request(app)
            .get(`/api/envios/${testEnvioId}`)
            .set('Authorization', `Bearer ${authTokenCliente}`);

        console.log('📌 Respuesta del servidor - Obtener envío:', res.body);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('id', testEnvioId);
    });

    test('✅ PUT /api/envios/estado - Actualizar estado del envío', async () => {
        const res = await request(app)
            .put('/api/envios/estado')
            .set('Authorization', `Bearer ${authTokenAdmin}`)
            .send({ envioId: testEnvioId, estado: 'en tránsito' });

        console.log('📌 Respuesta del servidor - Actualizar estado:', res.body);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('message', 'Estado del envío actualizado correctamente');
        expect(res.body.envio).toHaveProperty('estado', 'en tránsito');
    });

    test('✅ PUT /api/envios/transportista - Asignar transportista', async () => {
        const res = await request(app)
            .put('/api/envios/transportista')
            .set('Authorization', `Bearer ${authTokenAdmin}`)
            .send({ envioId: testEnvioId, transportista: 'Transportes Rápidos' });

        console.log('📌 Respuesta del servidor - Asignar transportista:', res.body);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('message', 'Transportista asignado correctamente');
        expect(res.body.envio).toHaveProperty('transportista', 'Transportes Rápidos');
    });

    test('✅ GET /api/envios - Obtener todos los envíos', async () => {
        const res = await request(app)
            .get('/api/envios')
            .set('Authorization', `Bearer ${authTokenAdmin}`);

        console.log('📌 Respuesta del servidor - Obtener todos los envíos:', res.body);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test('🛑 POST /api/envios - No debe permitir crear un envío sin token', async () => {
        const res = await request(app)
            .post('/api/envios')
            .send({ pedidoId: testPedidoId, direccionEnvio: 'Calle Falsa 123' });

        console.log('📌 Respuesta del servidor - Crear envío sin token:', res.body);

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('error', 'No se proporcionó un token de autenticación');
    });

    test('🛑 PUT /api/envios/estado - No debe permitir actualizar estado sin ser admin', async () => {
        const res = await request(app)
            .put('/api/envios/estado')
            .set('Authorization', `Bearer ${authTokenCliente}`)
            .send({ envioId: testEnvioId, estado: 'entregado' });

        console.log('📌 Respuesta del servidor - Actualizar estado sin permisos:', res.body);

        expect(res.statusCode).toBe(403);
        expect(res.body).toHaveProperty('error', 'No tienes permiso para realizar esta acción');
    });

    test('🛑 GET /api/envios/:id - No debe encontrar un envío inexistente', async () => {
        const res = await request(app)
            .get('/api/envios/9999')
            .set('Authorization', `Bearer ${authTokenAdmin}`);

        console.log('📌 Respuesta del servidor - Obtener envío inexistente:', res.body);

        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('error', 'Envío no encontrado');
    });
});
