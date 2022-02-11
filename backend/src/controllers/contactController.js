const models = require('../models');
const sequelize = require('../database/db-connection');
const getDataFromToken = require('../utils/getDataFromToken');
const ApiError = require('../utils/apiError');
const checkMissingRequiredAttributes = require('../utils/checkMissingRequiredAttributes');

/**
 * Define la cantidad máxima de contactos que puede tener un vecino
*/
const maxQuantityOfContacts = 1;

const getContacts = async (req, res, next) => {
    try {
        // Obtiene la información contenida en el token para poder usar el neighborId
        const dataFromToken = getDataFromToken(req.headers['authorization']);

        if ( !dataFromToken.neighborId ) {
            throw ApiError.forbidden(`You can't access to this resource`);
        };

        const myContacts = await models.Contact.findAll({
            where: {
                neighborId: dataFromToken.neighborId
            },
            order: [['name', 'ASC']]
        });

        if ( myContacts.length === 0 ) {
            throw ApiError.notFound(`You have no contacts added yet`);
        };

        return res.status(200).json(myContacts);
    } catch (error) {
        next(error);
    }
};


const newContact = async (req, res, next) => {
    const transaction = await sequelize.transaction(); 
    try {
        // Obtiene la información contenida en el token para poder usar el neighborId
        const dataFromToken = getDataFromToken(req.headers['authorization']);

        if ( !dataFromToken.neighborId ) {
            throw ApiError.forbidden(`You can't access to this resource`);
        };

        const missingAttributes = checkMissingRequiredAttributes(req.body, ['name', 'phoneNumber']);
        if ( missingAttributes.length > 0 ) {
            throw ApiError.badRequest(`Missing required data. Please, fill all fields`);
        };

        const neighborContacts = await models.Contact.findAll({
            where: {
                neighborId: dataFromToken.neighborId
            }
        });

        if ( neighborContacts.length >= maxQuantityOfContacts ) {
            throw ApiError.badRequest(`You can't add more contacts`);
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
    deleteContact,
    getContacts
}