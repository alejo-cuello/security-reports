const jwt = require('jsonwebtoken');
const ApiError = require('./apiError');


const getDataFromToken = (headerAuthorization) => {
    try {
        const bearerHeader = headerAuthorization;
        
        if (typeof bearerHeader === 'undefined') {
            throw ApiError.forbidden('No token provided. You must login first');
        };

        const bearerToken = bearerHeader.split(' ')[1];

        const decoded = jwt.verify(bearerToken, process.env.TOKEN_KEY);
        
        return decoded;
    } catch (error) {
        throw error;
    }
};

module.exports = getDataFromToken;