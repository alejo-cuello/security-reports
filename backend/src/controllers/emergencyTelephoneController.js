const models = require('../models');

const getEmergencyTelephones = async (req, res, next) => {
    try {
        const emergencyTelephones = await models.EmergencyTelephones.findAll();
        return res.status(200).json(emergencyTelephones);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getEmergencyTelephones
};