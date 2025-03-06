const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    try {
        // Obtener el token del header Authorization
        const token = req.headers['authorization']?.split(' ')[1]; // Formato: "Bearer <token>"
        if (!token) {
            return res.status(401).json({ error: 'No autorizado. Token no proporcionado.' });
        }

        // Verificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Adjuntar la información decodificada al objeto req
        next(); // Pasar al siguiente middleware o controlador
    } catch (error) {
        console.error('Error de autenticación:', error.message);
        return res.status(401).json({ error: 'Token inválido o expirado.' });
    }
};

module.exports = authenticate;
