const request = require('supertest');
const server = require('../../src/services/server');  
const { pool } = require('../../config/db');
const jwt = require('jsonwebtoken');

jest.mock('../models/cartModel', () => ({
    createCart: jest.fn(),
    getCartByUserId: jest.fn(),
    addProductToCart: jest.fn(),
    updateProductQuantity: jest.fn(),
    removeProductFromCart: jest.fn(),
    emptyCart: jest.fn(),
}));

const { createCart, getCartByUserId, addProductToCart, updateProductQuantity, removeProductFromCart, emptyCart } = require('../models/cartModel');

describe('Cart Controller Tests', () => {
    let authToken;

    beforeAll(() => {
        authToken = jwt.sign({ id: 1, rol: 'cliente' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    });

    afterAll(async () => {
        server.close();  // ✅ Cierra el servidor después de las pruebas
        await pool.end();  // ✅ Asegura que la conexión a PostgreSQL también se cierra
    });

    test('GET /api/carrito - Obtener carrito', async () => {
        getCartByUserId.mockResolvedValue([{ carrito_id: 1, producto_id: 2, cantidad: 3 }]);

        const res = await request(server)
            .get('/api/carrito')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([{ carrito_id: 1, producto_id: 2, cantidad: 3 }]);
    });

    test('POST /api/carrito - Agregar producto al carrito', async () => {
        getCartByUserId.mockResolvedValue([]);
        createCart.mockResolvedValue({ id: 1 });
        addProductToCart.mockResolvedValue({ carrito_id: 1, producto_id: 2, cantidad: 3 });

        const res = await request(server)
            .post('/api/carrito')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ productoId: 2, cantidad: 3 });

        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({ carrito_id: 1, producto_id: 2, cantidad: 3 });
    });

    test('PUT /api/carrito - Actualizar cantidad de producto', async () => {
        getCartByUserId.mockResolvedValue([{ carrito_id: 1 }]);
        updateProductQuantity.mockResolvedValue({ carrito_id: 1, producto_id: 2, cantidad: 5 });

        const res = await request(server)
            .put('/api/carrito')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ productoId: 2, cantidad: 5 });

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ carrito_id: 1, producto_id: 2, cantidad: 5 });
    });

    test('DELETE /api/carrito - Eliminar producto del carrito', async () => {
        getCartByUserId.mockResolvedValue([{ carrito_id: 1 }]);
        removeProductFromCart.mockResolvedValue({ carrito_id: 1, producto_id: 2 });

        const res = await request(server)
            .delete('/api/carrito')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ productoId: 2 });

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ carrito_id: 1, producto_id: 2 });
    });

    test('DELETE /api/carrito/clear - Vaciar carrito', async () => {
        emptyCart.mockResolvedValue();

        const res = await request(server)
            .delete('/api/carrito/clear')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ message: 'Carrito vaciado correctamente' });
    });
});
