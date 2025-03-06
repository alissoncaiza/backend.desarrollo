const request = require('supertest');
const server = require('../services/server');
const { pool } = require('../../config/db');
const jwt = require('jsonwebtoken');

jest.mock('../models/productModel', () => ({
    getAllProducts: jest.fn(),
    getProductById: jest.fn(),
    createProduct: jest.fn(),
    updateProduct: jest.fn(),
    deleteProduct: jest.fn(),
    updateProductStock: jest.fn(),
}));

const {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    updateProductStock
} = require('../models/productModel');

describe('Product Controller Tests', () => {
    let authToken;

    beforeAll(() => {
        authToken = jwt.sign({ id: 1, rol: 'administrador' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    });

    afterAll(async () => {
        server.close();  // ✅ Cierra el servidor después de las pruebas
        await pool.end();  // ✅ Cierra la conexión a PostgreSQL
    });

    test('GET /api/productos - Obtener productos', async () => {
        getAllProducts.mockResolvedValue([{ id: 1, nombre: "Manzana", precio: 1.5, stock: 100 }]);

        const res = await request(server).get('/api/productos');

        console.log('📌 Respuesta del servidor - Obtener productos:', res.body); // ✅ Imprimir la respuesta

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([{ id: 1, nombre: "Manzana", precio: 1.5, stock: 100 }]);
    });

    test('POST /api/productos - Crear producto', async () => {
        getAllProducts.mockResolvedValue([]);
        createProduct.mockResolvedValue({ id: 2, nombre: "Pera", precio: 1.2, stock: 50 });

        const res = await request(server)
            .post('/api/productos')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ nombre: "Pera", precio: 1.2, stock: 50, categoria_id: 1 });

        console.log('📌 Respuesta del servidor - Crear producto:', res.body); // ✅ Imprimir la respuesta

        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({ id: 2, nombre: "Pera", precio: 1.2, stock: 50 });
    });

    test('PUT /api/productos/:id - Actualizar producto', async () => {
        updateProduct.mockResolvedValue({ id: 1, nombre: "Manzana Roja", precio: 1.8, stock: 80 });

        const res = await request(server)
            .put('/api/productos/1')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ nombre: "Manzana Roja", precio: 1.8, stock: 80 });

        console.log('📌 Respuesta del servidor - Actualizar producto:', res.body); // ✅ Imprimir la respuesta

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ id: 1, nombre: "Manzana Roja", precio: 1.8, stock: 80 });
    });

    test('DELETE /api/productos/:id - Eliminar producto', async () => {
        deleteProduct.mockResolvedValue({ id: 1 });

        const res = await request(server)
            .delete('/api/productos/1')
            .set('Authorization', `Bearer ${authToken}`);

        console.log('📌 Respuesta del servidor - Eliminar producto:', res.body); // ✅ Imprimir la respuesta

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ message: 'Producto eliminado' });
    });
});
