const jwt = require('jsonwebtoken');

const authorize = (roles = []) => {
    return (req, res, next) => {
        try {
            const token = req.headers['authorization']?.split(' ')[1]; // Formato: Bearer <token>
            if (!token) {
                return res.status(401).json({ error: 'Acceso no autorizado. Token no proporcionado.' });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded; // Adjuntar el usuario decodificado a la solicitud

            if (roles.length && !roles.includes(decoded.rol)) {
                return res.status(403).json({ error: 'No tienes permisos para realizar esta acción.' });
            }

            next();
        } catch (error) {
            return res.status(401).json({ error: 'Token inválido o expirado.' });
        }
    };
};

module.exports = authorize;
