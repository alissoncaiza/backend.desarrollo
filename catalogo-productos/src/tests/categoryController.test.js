const request = require('supertest');
const server = require('../services/server'); // Importar el servidor
const { pool } = require('../../config/db');
const jwt = require('jsonwebtoken');

jest.mock('../models/categoryModel', () => ({
    getAllCategories: jest.fn(),
    getCategoryById: jest.fn(),
    createCategory: jest.fn(),
    updateCategory: jest.fn(),
    deleteCategory: jest.fn(),
}));

const {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
} = require('../models/categoryModel');

describe('Category Controller Tests', () => {
    let authToken;

    beforeAll(() => {
        authToken = jwt.sign({ id: 1, rol: 'administrador' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    });

    afterAll(async () => {
        server.close();  // ✅ Cierra el servidor después de las pruebas
        await pool.end();  // ✅ Cierra la conexión a PostgreSQL
    });

    test('GET /api/categorias - Obtener categorías', async () => {
        getAllCategories.mockResolvedValue([{ id: 1, nombre: "Frutas", descripcion: "Frutas frescas" }]);

        const res = await request(server).get('/api/categorias');

        console.log('📌 Respuesta del servidor - Obtener categorías:', res.body); // ✅ Imprimir la respuesta

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([{ id: 1, nombre: "Frutas", descripcion: "Frutas frescas" }]);
    });

    test('POST /api/categorias - Crear categoría', async () => {
        getAllCategories.mockResolvedValue([]);
        createCategory.mockResolvedValue({ id: 2, nombre: "Verduras", descripcion: "Verduras frescas" });

        const res = await request(server)
            .post('/api/categorias')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ nombre: "Verduras", descripcion: "Verduras frescas" });

        console.log('📌 Respuesta del servidor - Crear categoría:', res.body); // ✅ Imprimir la respuesta

        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({ id: 2, nombre: "Verduras", descripcion: "Verduras frescas" });
    });

    test('PUT /api/categorias/:id - Actualizar categoría', async () => {
        updateCategory.mockResolvedValue({ id: 1, nombre: "Frutas Actualizado", descripcion: "Frutas frescas actualizadas" });

        const res = await request(server)
            .put('/api/categorias/1')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ nombre: "Frutas Actualizado", descripcion: "Frutas frescas actualizadas" });

        console.log('📌 Respuesta del servidor - Actualizar categoría:', res.body); // ✅ Imprimir la respuesta

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ id: 1, nombre: "Frutas Actualizado", descripcion: "Frutas frescas actualizadas" });
    });

    test('DELETE /api/categorias/:id - Eliminar categoría', async () => {
        deleteCategory.mockResolvedValue({ id: 1 });

        const res = await request(server)
            .delete('/api/categorias/1')
            .set('Authorization', `Bearer ${authToken}`);

        console.log('📌 Respuesta del servidor - Eliminar categoría:', res.body); // ✅ Imprimir la respuesta

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ message: 'Categoría eliminada' });
    });
});
