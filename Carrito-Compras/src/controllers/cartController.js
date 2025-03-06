const { createCart, getCartByUserId, addProductToCart, updateProductQuantity, removeProductFromCart, emptyCart} = require('../models/cartModel');
const axios = require('axios');

// Obtener el carrito del usuario
exports.getCart = async (req, res) => {
    try {
        const { id: usuarioId } = req.user; // El ID del usuario autenticado
        const cart = await getCartByUserId(usuarioId);
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el carrito' });
    }
};

// Agregar un producto al carrito
exports.addProduct = async (req, res) => {
    const { productoId, cantidad } = req.body;

    try {
        const { id: usuarioId } = req.user; // El ID del usuario autenticado

        // Verificar si existe un carrito para el usuario
        let cart = await getCartByUserId(usuarioId);
        if (!cart.length) {
            // Crear un nuevo carrito si no existe
            const newCart = await createCart(usuarioId);
            cart = [{ carrito_id: newCart.id }];
        }

        // Consultar el catálogo para verificar el stock disponible
        const catalogoUrl = `http://localhost:3001/api/productos/${productoId}`;
        let producto;
        try {
            const catalogoResponse = await axios.get(catalogoUrl);
            producto = catalogoResponse.data;
            if (!producto) {
                return res.status(404).json({ error: 'El producto no existe en el catálogo' });
            }
        } catch (error) {
            if (error.response && error.response.status === 404) {
                return res.status(404).json({ error: 'El producto no existe en el catálogo' });
            }
            console.error('Error al consultar el catálogo:', error.message);
            return res.status(500).json({ error: 'Error al consultar el catálogo' });
        }

        // Validar que la cantidad solicitada no exceda el stock disponible
        if (cantidad > producto.stock) {
            return res.status(400).json({ 
                error: `La cantidad solicitada (${cantidad}) excede el stock disponible (${producto.stock})`
            });
        }

        // Si el producto existe y la cantidad es válida, agregarlo al carrito
        const addedProduct = await addProductToCart(cart[0].carrito_id, productoId, cantidad);
        res.status(201).json(addedProduct);
    } catch (error) {
        console.error('Error al agregar el producto al carrito:', error.message);
        res.status(500).json({ error: 'Error al agregar el producto al carrito' });
    }
};



// Actualizar la cantidad de un producto
exports.updateQuantity = async (req, res) => {
    const { productoId, cantidad } = req.body;
    try {
        const { id: usuarioId } = req.user;
        const cart = await getCartByUserId(usuarioId);
        const updatedProduct = await updateProductQuantity(cart[0].carrito_id, productoId, cantidad);
        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la cantidad' });
    }
};

// Eliminar un producto del carrito
exports.removeProduct = async (req, res) => {
    const { productoId } = req.body;
    try {
        const { id: usuarioId } = req.user;
        const cart = await getCartByUserId(usuarioId);
        const removedProduct = await removeProductFromCart(cart[0].carrito_id, productoId);
        res.status(200).json(removedProduct);
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el producto del carrito' });
    }
};

// Vaciar el carrito
exports.clearCart = async (req, res) => {
    try {
        const { id: usuarioId } = req.user; // ID del usuario autenticado
        await emptyCart(usuarioId); // Vaciar el carrito del usuario
        res.status(200).json({ message: 'Carrito vaciado correctamente' });
    } catch (error) {
        console.error('Error al vaciar el carrito:', error.message);
        res.status(500).json({ error: 'Error al vaciar el carrito' });
    }
};