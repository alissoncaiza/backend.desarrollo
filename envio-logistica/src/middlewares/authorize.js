const jwt = require('jsonwebtoken');
require('dotenv').config();

const authorize = (allowedRoles) => {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ error: 'No se proporcionó un token de autenticación' });
        }

        const token = authHeader.split(' ')[1];

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;

            // Validar si el rol del usuario está permitido
            if (!allowedRoles.includes(decoded.rol)) {
                return res.status(403).json({ error: 'No tienes permiso para realizar esta acción' });
            }

            next();
        } catch (error) {
            console.error('Error al verificar el token:', error.message);
            return res.status(401).json({ error: 'Token inválido o expirado' });
        }
    };
};

module.exports = authorize;
