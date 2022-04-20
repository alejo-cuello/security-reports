const multer = require('multer');
const upload = require('../config/imageUploadConfig');

const multerErrorHandler = (req, res, next) => {
    upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(500).json({
                message: `Un error de Multer ocurrió mientras subía la foto --> ${ err.message }`
            });
        } else if (err) {
            return res.status(500).json({
                message: `Un error inesperado ocurrió mientras subía la foto --> ${ err.message }`
            });
        };

        // Everything went fine.
        next();
    });
};

module.exports = multerErrorHandler;