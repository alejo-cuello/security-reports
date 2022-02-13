const models = require('../models');
const ApiError = require('../utils/apiError');


const getInsecurityFactTypes = async (req, res, next) => {
    try {
        const insecurityFactTypes = await models.InsecurityFactType.findAll();

        if ( insecurityFactTypes.length === 0 ) {
            throw ApiError.notFound('There are not insecurity fact types to show');
        };

        return res.status(200).json(insecurityFactTypes);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getInsecurityFactTypes
}