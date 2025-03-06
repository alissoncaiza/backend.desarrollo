const { pool } = require('../../config/db');
const { createCart, getCartByUserId, addProductToCart, updateProductQuantity, removeProductFromCart, emptyCart } = require('../models/cartModel');

describe('Cart Model Tests', () => {
    beforeAll(async () => {
        await pool.query('TRUNCATE TABLE carrito_productos, carritos RESTART IDENTITY CASCADE');
    });

    afterAll(async () => {
        try {
            console.log('Cerrando conexión a PostgreSQL...');
            await pool.end();  // ✅ Cerrar la conexión a PostgreSQL
            console.log('Conexión cerrada exitosamente.');
        } catch (error) {
            console.error('Error al cerrar la conexión:', error);
        }
    });
        

    test('Debe crear un carrito', async () => {
        const newCart = await createCart(1);
        expect(newCart).toHaveProperty('id');
    });

    test('Debe obtener el carrito por usuario', async () => {
        const cart = await getCartByUserId(1);
        expect(cart).toBeInstanceOf(Array);
    });

    test('Debe agregar un producto al carrito', async () => {
        const addedProduct = await addProductToCart(1, 2, 3);
        expect(addedProduct).toHaveProperty('producto_id', 2);
        expect(addedProduct).toHaveProperty('cantidad', 3);
    });

    test('Debe actualizar la cantidad de un producto en el carrito', async () => {
        const updatedProduct = await updateProductQuantity(1, 2, 5);
        expect(updatedProduct).toHaveProperty('cantidad', 5);
    });

    test('Debe eliminar un producto del carrito', async () => {
        const removedProduct = await removeProductFromCart(1, 2);
        expect(removedProduct).toHaveProperty('producto_id', 2);
    });

    test('Debe vaciar el carrito', async () => {
        await emptyCart(1);
        const cart = await getCartByUserId(1);
        expect(cart).toEqual([]);
    });
});
