const fs = require('fs')
const path = './public/uploadedImages/';

const getByFilename = async (req, res, next) => {
    try {
        fs.readFile(path + req.params.fileName , {encoding: 'base64'} , (error, data) => {
            if (error) {
                res.send(error)
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