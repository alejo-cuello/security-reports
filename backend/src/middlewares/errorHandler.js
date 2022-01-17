const ApiError = require('../utils/apiError');

const errorHandler = ( err, req, res, next ) => {
    if ( err instanceof ApiError ) {
        return res.status( err.statusCode ).json({
            message: err.message
        });
    };

    return res.status(500).json({
        message: 'Something went wrong'
    });
}

module.exports = errorHandler;