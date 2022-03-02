const models = require('../models');


const getAllStatus = async (req, res, next) => {
    try {
        const status = await models.Status.findAll();

        if(!status) {
            throw ApiError.notFound('There are not status to show');
        }

        return res.status(200).json(status);

    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllStatus
}