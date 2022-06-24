const jwt = require('jsonwebtoken');
const ApiError = require('../utils/apiError');


const verifyToken = (req, res, next) => {
    try {
        const bearerHeader = req.headers['authorization'];
        
        if (typeof bearerHeader === 'undefined') {
            throw ApiError.unauthorized('Debes iniciar sesión para acceder a este recurso');
        };

        const bearerToken = bearerHeader.split(' ')[1];

        jwt.verify(bearerToken, process.env.TOKEN_KEY, (err) => {
            if (err) {
                throw ApiError.unauthorized('Token inválido');
            };
            next();
        });
    } catch (error) {
        next(error);
    }
};

module.exports = verifyToken;