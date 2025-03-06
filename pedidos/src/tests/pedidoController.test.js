const request = require('supertest');
const app = require('../../src/app');
const { pool } = require('../../config/db');
const jwt = require('jsonwebtoken');
const nock = require('nock');

// 🔄 **Mock de RabbitMQ para evitar errores de conexión**
jest.mock('../../../messaging/rabbitmq', () => ({
    publishToQueue: jest.fn().mockResolvedValue(true),
}));

describe('Pedido Controller Tests', () => {
    let authTokenCliente;
    let testPedidoId;

    beforeAll(async () => {
        jest.setTimeout(30000);  // ⏳ Aumenta el timeout global a 30 segundos
        console.log('📌 Preparando pruebas de pedido...');

        // 🔄 **Simular autenticación**
        authTokenCliente = jwt.sign(
            { id: 1, email: 'test@example.com', rol: 'cliente' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // 🔄 **Mock del microservicio de carrito**
        nock('http://localhost:3002')
            .persist()
            .get('/api/carrito')
            .reply(200, [
                { producto_id: 1, cantidad: 2 },
                { producto_id: 2, cantidad: 1 }
            ]);

        // 🔄 **Mock de productos del catálogo**
        nock('http://localhost:3001')
            .persist()
            .get('/api/productos/1')
            .reply(200, { id: 1, nombre: 'Producto A', precio: 10 });

        nock('http://localhost:3001')
            .persist()
            .get('/api/productos/2')
            .reply(200, { id: 2, nombre: 'Producto B', precio: 20 });

        // 🔄 **Mock para actualizar stock**
        nock('http://localhost:3001')
            .persist()
            .put('/api/productos/1/actualizar-stock')
            .reply(200, { message: 'Stock actualizado correctamente' });

        nock('http://localhost:3001')
            .persist()
            .put('/api/productos/2/actualizar-stock')
            .reply(200, { message: 'Stock actualizado correctamente' });

        // 🔄 **Mock para limpiar el carrito**
        nock('http://localhost:3002')
            .persist()
            .delete('/api/carrito/clear')
            .reply(200, { message: 'Carrito vacío' });
    });

    afterAll(async () => {
        console.log('📌 Cerrando conexiones activas...');
        try {
            await pool.end(); // ✅ Cierra la conexión a PostgreSQL
            console.log('✅ Conexión a PostgreSQL cerrada correctamente.');
        } catch (error) {
            console.error('❌ Error al cerrar la conexión:', error.message);
        } finally {
            nock.cleanAll();
            nock.restore();
            jest.resetModules(); // 🛠 Limpia Jest
        }
    });
    

    test('POST /api/pedidos - Registrar un pedido', async () => {
        const res = await request(app)
            .post('/api/pedidos')
            .set('Authorization', `Bearer ${authTokenCliente}`)
            .send();

        console.log('📌 Respuesta del servidor - Registrar pedido:', res.body);

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('message', 'Pedido registrado correctamente');
        expect(res.body.pedido).toHaveProperty('id');
        testPedidoId = res.body.pedido.id; // Guardar ID del pedido para pruebas posteriores
    });

    test('PUT /api/pedidos/confirm - Confirmar un pedido', async () => {
        const res = await request(app)
            .put('/api/pedidos/confirm')
            .set('Authorization', `Bearer ${authTokenCliente}`)
            .send({ pedidoId: testPedidoId });

        console.log('📌 Respuesta del servidor - Confirmar pedido:', res.body);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('message', 'Pedido confirmado correctamente');
    });

    test('PUT /api/pedidos/cancel - Cancelar un pedido', async () => {
        // 🔄 **Crear un nuevo pedido para esta prueba**
        const resPedido = await request(app)
            .post('/api/pedidos')
            .set('Authorization', `Bearer ${authTokenCliente}`)
            .send();
    
        console.log('📌 Nuevo pedido para cancelación:', resPedido.body);
    
        expect(resPedido.statusCode).toBe(201);
        const pedidoIdParaCancelar = resPedido.body.pedido.id; // 🆕 Usar este pedido
    
        // 🔄 **Intentar cancelar el nuevo pedido**
        const resCancel = await request(app)
            .put('/api/pedidos/cancel')
            .set('Authorization', `Bearer ${authTokenCliente}`)
            .send({ pedidoId: pedidoIdParaCancelar });
    
        console.log('📌 Respuesta del servidor - Cancelar pedido:', resCancel.body);
    
        expect(resCancel.statusCode).toBe(200);
        expect(resCancel.body).toHaveProperty('message', 'Pedido cancelado correctamente');
    });

    test('GET /api/pedidos/historial - Obtener historial de pedidos', async () => {
        const res = await request(app)
            .get('/api/pedidos/historial')
            .set('Authorization', `Bearer ${authTokenCliente}`);

        console.log('📌 Respuesta del servidor - Historial de pedidos:', res.body);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('pedidos');
        expect(Array.isArray(res.body.pedidos)).toBe(true);
    });

    test('GET /api/pedidos/:id - Obtener pedido por ID', async () => {
        const res = await request(app)
            .get(`/api/pedidos/${testPedidoId}`)
            .set('Authorization', `Bearer ${authTokenCliente}`);

        console.log('📌 Respuesta del servidor - Obtener pedido por ID:', res.body);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('id', testPedidoId);
    });
});
