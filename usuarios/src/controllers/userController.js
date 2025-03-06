const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createUser, getUserByEmail, getRoleIdByName, getUserById} = require('../models/userModel');
const { sendConfirmationEmail } = require('../services/emailService');
const { pool } = require('../../config/db');

exports.registerUser = async (req, res) => {
    const { nombre, email, password, rol = 'cliente' } = req.body; // rol predeterminado: cliente

    try {
        // Validar el correo
        if (!validator.isEmail(email)) {
            return res.status(400).json({ error: 'El correo ingresado no es válido' });
        }

        // Verificar si el usuario ya existe
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'El correo ya está registrado' });
        }

        // Obtener el ID del rol
        const roleId = await getRoleIdByName(rol);
        if (!roleId) {
            return res.status(400).json({ error: 'El rol especificado no es válido' });
        }

        // Cifrar la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear el usuario
        const newUser = await createUser(nombre, email, hashedPassword, roleId);

        // Generar un token de verificación
        const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Crear el enlace de verificación
        const verificationLink = `http://localhost:3000/api/usuarios/verify?token=${verificationToken}`;

        // Enviar correo de verificación con enlace
        await sendConfirmationEmail(email, nombre, verificationLink, password);

        res.status(201).json({
            message: 'Usuario registrado. Verifica tu correo electrónico.',
            user: {
                id: newUser.id,
                nombre: newUser.nombre,
                email: newUser.email,
                rol: rol
            }
        });
    } catch (error) {
        console.error('Error al registrar usuario:', error.message);
        res.status(500).json({ error: 'Error al registrar el usuario' });
    }
};

// Verificar el correo electrónico
exports.verifyUser = async (req, res) => {
    const { token } = req.query;

    try {
        // Verificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { email } = decoded;

        // Actualizar el campo is_verified en la base de datos
        const result = await pool.query(
            'UPDATE usuarios SET is_verified = TRUE WHERE email = $1 RETURNING *',
            [email]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.status(200).json({ message: 'Correo verificado exitosamente' });
    } catch (error) {
        console.error('Error en la verificación:', error.message);
        res.status(400).json({ error: 'Enlace de verificación inválido o expirado' });
    }
};

// Inicio de sesión
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Validar que el correo y la contraseña estén presentes
        if (!email || !password) {
            return res.status(400).json({ error: 'Por favor ingresa correo y contraseña' });
        }

        // Buscar el usuario en la base de datos
        const user = await getUserByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        // Comparar la contraseña ingresada con la almacenada
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        // Generar el token JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, rol: user.rol_nombre }, // rol_nombre contiene el nombre del rol
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Inicio de sesión exitoso',
            token,
            user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol_nombre }
        });
    } catch (error) {
        console.error('Error en el login:', error.message);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

exports.getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id; // Esto viene del token JWT decodificado
        const query = `
            SELECT u.id, u.nombre, u.email, r.nombre AS rol
            FROM usuarios u
            JOIN roles r ON u.rol_id = r.id
            WHERE u.id = $1
        `;
        const result = await pool.query(query, [userId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener el perfil del usuario:', error.message);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

exports.getUserById = async (req, res) => {
    const { id } = req.params; // ID proporcionado en los parámetros de la URL

    try {
        const user = await getUserById(id);

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Error al obtener el usuario por ID:', error.message);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};
