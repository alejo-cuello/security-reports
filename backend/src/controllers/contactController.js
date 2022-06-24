const models = require('../models');
const sequelize = require('../database/db-connection');
const getDataFromToken = require('../utils/getDataFromToken');
const ApiError = require('../utils/apiError');
const checkMissingRequiredAttributes = require('../utils/checkMissingRequiredAttributes');
const ValidateAuthorization = require('../utils/validateAuthorization');

/**
 * Define la cantidad máxima de contactos que puede tener un vecino
*/
const maxQuantityOfContacts = 3;

const getContacts = async (req, res, next) => {
    try {
        // Obtiene la información contenida en el token para poder usar el neighborId
        const dataFromToken = getDataFromToken(req.headers['authorization']);

        ValidateAuthorization.oneUserHasAuthorization(dataFromToken.neighborId);

        const myContacts = await models.Contact.findAll({
            where: {
                neighborId: dataFromToken.neighborId
            },
            order: [['name', 'ASC']]
        });

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

        ValidateAuthorization.oneUserHasAuthorization(dataFromToken.neighborId);

        const missingAttributes = checkMissingRequiredAttributes(req.body, ['name', 'phoneNumber']);
        if ( missingAttributes.length > 0 ) {
            throw ApiError.badRequest(`Faltan datos obligatorios. Por favos, complete todos los campos`);
        };

        const neighborContacts = await models.Contact.findAll({
            where: {
                neighborId: dataFromToken.neighborId
            }
        });

        if ( neighborContacts.length >= maxQuantityOfContacts ) {
            throw ApiError.badRequest(`No puedes agregar más contactos`);
        };

        req.body.neighborId = dataFromToken.neighborId;

        await models.Contact.create(req.body, { transaction });

        await transaction.commit();

        return res.status(201).json({
            message: 'Contacto creado correctamente'
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

        ValidateAuthorization.oneUserHasAuthorization(dataFromToken.neighborId);

        const contact = await models.Contact.findOne({
            where: {
                contactId: req.params.contactId,
                neighborId: dataFromToken.neighborId
            }
        });

        if ( !contact ) {
            throw ApiError.notFound(`El contacto con id '${ req.params.contactId }' no existe para este vecino`);
        };

        await models.Contact.destroy({
            where: {
                contactId: req.params.contactId,
                neighborId: dataFromToken.neighborId
            }, transaction
        });

        await transaction.commit();

        return res.status(200).json({
            message: 'Contacto eliminado correctamente'
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