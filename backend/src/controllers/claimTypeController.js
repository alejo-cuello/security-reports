const models = require('../models');
const ApiError = require('../utils/apiError');


const getClaimTypesWithSubcategories = async (req, res, next) => {
    try {
        const claimTypesWithSubcategories = await models.ClaimType.findAll({
            include: [
                {
                    model: models.ClaimSubcategory,
                    as: 'claimSubcategory'
                }
            ]
        });

        if ( claimTypesWithSubcategories.length === 0 ) {
            throw ApiError.notFound('There are not claim types to show');
        };

        return res.status(200).json(claimTypesWithSubcategories);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getClaimTypesWithSubcategories
}