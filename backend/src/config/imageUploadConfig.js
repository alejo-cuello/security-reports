const multer = require('multer');

const destination = './public/uploadedImages';

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, destination);
    },
    filename: (req, file, callback) => {
        const extension = file.originalname.split('.').pop();
        callback(null, `${Date.now()}.${extension}`);
    }
});

const upload = multer({ storage }).single('photo');

module.exports = upload;