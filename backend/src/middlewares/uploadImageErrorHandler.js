const multer = require('multer');
const upload = require('../config/imageUploadConfig');

const multerErrorHandler = (req, res, next) => {
    upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(500).json({
                message: `A Multer error occurred when uploading --> ${ err.message }`
            });
        } else if (err) {
            return res.status(500).json({
                message: `An unknown error occurred when uploading --> ${ err.message }`
            });
        };

        // Everything went fine.
        next();
    });
};

module.exports = multerErrorHandler;