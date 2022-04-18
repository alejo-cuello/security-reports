const models = require('../models');


const getAllStatus = async (req, res, next) => {
    try {
        const status = await models.Status.findAll();

        return res.status(200).json(status);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllStatus
}