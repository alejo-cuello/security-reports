const models = require('../models');


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

        return res.status(200).json(claimTypesWithSubcategories);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getClaimTypesWithSubcategories
}