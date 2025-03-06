const jwt = require('jsonwebtoken');

// Middleware para validar token y rol
const authorize = (roles = []) => {
    return (req, res, next) => {
        try {
            // Obtener el token del encabezado Authorization
            const token = req.headers['authorization']?.split(' ')[1]; // Formato: Bearer <token>
            if (!token) {
                return res.status(401).json({ error: 'Acceso no autorizado. Token no proporcionado.' });
            }

            // Verificar y decodificar el token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded; // Adjuntar los datos del usuario a la solicitud

            // Verificar si el rol es permitido
            if (roles.length && !roles.includes(decoded.rol)) {
                return res.status(403).json({ error: 'No tienes permisos para realizar esta acción.' });
            }

            next(); // Continuar con la siguiente función
        } catch (error) {
            return res.status(401).json({ error: 'Token inválido o expirado.' });
        }
    };
};

module.exports = authorize;
