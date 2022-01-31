const models = require('../models');
const sequelize = require('../database/db-connection');
const getDataFromToken = require('../utils/getDataFromToken');
const ApiError = require('../utils/apiError');


const newContact = async (req, res, next) => {
    const transaction = await sequelize.transaction(); 
    try {
        // Obtiene la información contenida en el token para poder usar el neighborId
        const dataFromToken = getDataFromToken(req.headers['authorization']);

        if ( !dataFromToken.neighborId ) {
            throw ApiError.forbidden(`You can't access to this resource`);
        };

        if ( !req.body.name || !req.body.phoneNumber || !dataFromToken.neighborId ) {
            throw ApiError.badRequest(`Missing required fields. Please, fill all fields`);
        };

        req.body.neighborId = dataFromToken.neighborId;

        await models.Contact.create(req.body, { transaction });

        await transaction.commit();

        return res.status(201).json({
            message: 'Contact created successfully'
        });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};


const deleteContact = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        // Obtiene la información contenida en el token para poder usar el neighborId
        const dataFromToken = getDataFromToken(req.headers['authorization']);

        if ( !dataFromToken.neighborId ) {
            throw ApiError.forbidden(`You can't access to this resource`);
        };

        const contact = await models.Contact.findOne({
            where: {
                contactId: req.params.contactId,
                neighborId: dataFromToken.neighborId
            }
        });

        if ( !contact ) {
            throw ApiError.notFound(`Contact not found for this neighbor`);
        };

        await models.Contact.destroy({
            where: {
                contactId: req.params.contactId,
                neighborId: dataFromToken.neighborId
            }, transaction
        });

        await transaction.commit();

        return res.status(200).json({
            message: 'Contact deleted successfully'
        });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};


module.exports = {
    newContact,
    deleteContact
}