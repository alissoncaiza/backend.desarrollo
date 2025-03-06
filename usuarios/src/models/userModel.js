const { pool } = require('../../config/db');

// Crear un nuevo usuario
const createUser = async (nombre, email, hashedPassword, rolId) => {
    const query = `
        INSERT INTO usuarios (nombre, email, password, rol_id, is_verified) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING *`;
    const values = [nombre, email, hashedPassword, rolId, false];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Obtener usuario por correo electrónico
const getUserByEmail = async (email) => {
    const query = `
        SELECT u.*, r.nombre AS rol_nombre 
        FROM usuarios u
        JOIN roles r ON u.rol_id = r.id
        WHERE u.email = $1`;
    const result = await pool.query(query, [email]);
    return result.rows[0];
};

// Obtener el ID de un rol por su nombre
const getRoleIdByName = async (roleName) => {
    const query = 'SELECT id FROM roles WHERE nombre = $1';
    const result = await pool.query(query, [roleName]);
    return result.rows[0]?.id || null; // Devuelve null si no encuentra el rol
};

// Obtener usuario por ID
const getUserById = async (id) => {
    const query = `
        SELECT u.id, u.nombre, u.email, u.is_verified, r.nombre AS rol
        FROM usuarios u
        JOIN roles r ON u.rol_id = r.id
        WHERE u.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0]; // Devuelve el usuario o undefined si no existe
};

module.exports = { createUser, getUserByEmail, getRoleIdByName, getUserById};
