const fs = require('fs/promises');
const path = './public/uploadedImages/';

const getByFilename = async (req, res, next) => {
    try {
        const response = await fs.readFile(path + req.params.fileName , {encoding: 'base64'});
        res.send(response);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getByFilename
};