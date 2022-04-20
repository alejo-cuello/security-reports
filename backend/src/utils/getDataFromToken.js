const jwt = require('jsonwebtoken');
const ApiError = require('./apiError');


/**
 * Devuelve los datos contenidos en el token
 * @param {string} headerAuthorization - Header 'authorization' de la petición
 * @returns {object} Datos desencriptados del token
 */
const getDataFromToken = (headerAuthorization) => {
    try {
        const bearerHeader = headerAuthorization;
        
        if (typeof bearerHeader === 'undefined') {
            throw ApiError.forbidden('No se encontró el token. Debes iniciar sesión primero');
        };

        const bearerToken = bearerHeader.split(' ')[1];

        const decoded = jwt.verify(bearerToken, process.env.TOKEN_KEY);
        
        return decoded;
    } catch (error) {
        throw error;
    }
};

module.exports = getDataFromToken;