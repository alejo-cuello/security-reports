const models = require('../models');


const getInsecurityFactTypes = async (req, res, next) => {
    try {
        const insecurityFactTypes = await models.InsecurityFactType.findAll();

        return res.status(200).json(insecurityFactTypes);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getInsecurityFactTypes
}