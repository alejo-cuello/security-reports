const fs = require('fs')
const path = './public/uploadedImages/';

const getByFilename = async (req, res, next) => {
    try {
        fs.readFile(path + req.params.fileName , (err, data) => {
            if (err) {
                throw ApiError.forbidden(`An error ocurred reading this file`);
            }
            res.send(data);
          })
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getByFilename
};