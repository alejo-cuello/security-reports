const { QueryTypes, Op } = require('sequelize');
const sequelize = require('../database/db-connection');
const models = require('../models');
const dayjs = require('dayjs');
const validator = require('validator');
const ApiError = require('../utils/apiError');
const getDataFromToken = require('../utils/getDataFromToken');


// Variables globales
let replacements = [];
let where = "";
// -----------------------------


/**
 * Devuelve la subconsulta para obtener el último estado de un reclamo 
*/
const getSubQueryLastClaimStatus = () => {
    return "( SELECT " +
                "er.idReclamo, " +
                "max(er.fechaHoraInicioEstado) 'ultFechaHoraInicioEstado' " +
            "FROM estado_reclamo er " +
            "INNER JOIN reclamo rec " + 
                "ON er.idReclamo = rec.idReclamo " +
            "INNER JOIN favoritos fav " +
                "ON rec.idReclamo = fav.idReclamo " +
            "WHERE fav.idVecino = ? " +
            "GROUP BY er.idReclamo ) ultimos_estado_reclamo ";
};


/**
 * Devuelve el select de la query para obtener los reclamos 
*/
const getSelectQuery = () => {
    return "er.idEstadoReclamo 'statusClaimId', " +
            "rec.idReclamo 'claimId', " + 
            "rec.fechaHoraCreacion 'dateTimeCreation', " +
            "rec.fechaHoraObservacion 'dateTimeObservation', " +
            "rec.fechaHoraFin 'dateTimeEnd', " +
            "rec.calle 'street', " +
            "rec.numeroCalle 'streetNumber', " +
            "rec.latitud 'latitude', " +
            "rec.longitud 'longitude', " +
            "rec.direccionMapa 'mapAddress', " +
            "rec.comentario 'comment', " +
            "rec.calificacionResolucion 'resolutionQualification', " +
            "rec.foto 'photo', " +
            "rec.idAgenteMunicipal 'municipalAgentId', " +
            "rec.idVecino 'neighborId', " +
            "scr.idSubcategoriaReclamo 'claimSubcategoryId', " +
            "scr.descripcionSCR 'CSCdescription', " +
            "tr.idTipoReclamo 'claimTypeId', " +
            "tr.descripcionTR 'CTdescription', " +
            "est.idEstado 'statusId', " +
            "est.descripcionEST 'STAdescription', " +
            "er.fechaHoraInicioEstado 'dateTimeStatusStart' ";
};


/**
 * Devuelve la query para obtener todos los reclamos favoritos de un vecino 
 * @param {string} where - Condición para filtrar los reclamos. Si no es provisto, por defecto es un string vacío
*/
const getQueryMyFavoritesClaims = ( where = "" ) => {
    let query = 
    "SELECT " +
        "fav.idFavoritos 'favoriteId', " +
        getSelectQuery() +
    "FROM estado_reclamo er " +
    "INNER JOIN " + 
        getSubQueryLastClaimStatus() +
        "ON er.idReclamo = ultimos_estado_reclamo.idReclamo " +
            "AND er.fechaHoraInicioEstado = ultimos_estado_reclamo.ultFechaHoraInicioEstado " +
    "LEFT JOIN reclamo rec " +
        "ON er.idReclamo = rec.idReclamo " +
    "LEFT JOIN favoritos fav " +
        "ON fav.idReclamo = rec.idReclamo " +
    "LEFT JOIN subcategoria_reclamo scr " +
        "ON rec.idSubcategoriaReclamo = scr.idSubcategoriaReclamo " +
    "LEFT JOIN tipo_reclamo tr " +
        "ON scr.idTipoReclamo = tr.idTipoReclamo " +
    "LEFT JOIN estado est " +
        "ON er.idEstado = est.idEstado " +
    "WHERE fav.idVecino = ?";
    
    if ( where !== "" ) {
        query = query + where;
    };
    
    query = query + " ORDER BY rec.fechaHoraCreacion DESC";
    return query;
};


/**
 * Devuelve la query para obtener un reclamo por su id 
*/
// Se usa en la función getClaimById
const getQueryClaimById = () => {
    return "SELECT " +
                getSelectQuery() +
            "FROM estado_reclamo er " +
            "INNER JOIN " + 
                getSubQueryLastClaimStatus() +
                "ON er.idReclamo = ultimos_estado_reclamo.idReclamo " +
                    "AND er.fechaHoraInicioEstado = ultimos_estado_reclamo.ultFechaHoraInicioEstado " +
            "INNER JOIN reclamo rec " +
                "ON er.idReclamo = rec.idReclamo " +
            "INNER JOIN subcategoria_reclamo scr " +
                "ON rec.idSubcategoriaReclamo = scr.idSubcategoriaReclamo " +
            "INNER JOIN tipo_reclamo tr " +
                "ON scr.idTipoReclamo = tr.idTipoReclamo " +
            "INNER JOIN estado est " +
                "ON er.idEstado = est.idEstado " +
            "WHERE rec.idReclamo = ? AND rec.idVecino = ?";
};


/**
 * Devuelve la query para editar o eliminar un reclamo 
*/
// Se usa en la función editClaim y deleteClaim
const getQueryClaimTo = () => {
    return "SELECT " +
                "rec.idReclamo 'claimId', " +
                "rec.idVecino 'neighborId', " +
                "er.idEstado 'statusId' " +
            "FROM estado_reclamo er " +
            "INNER JOIN " + 
                getSubQueryLastClaimStatus() +
                "ON er.idReclamo = ultimos_estado_reclamo.idReclamo " +
                    "AND er.fechaHoraInicioEstado = ultimos_estado_reclamo.ultFechaHoraInicioEstado " +
            "INNER JOIN reclamo rec " +
                "ON er.idReclamo = rec.idReclamo " +
            "WHERE rec.idReclamo = ? AND rec.idVecino = ?";
};


/**
 * Setea el o los filtros para la query de obtener los reclamos
 * @param {string|string[]} filter - Filtro a aplicar a la cláusula where para obtener los reclamos
*/
const setFilter = (filter) => {
    let partialWhere = "";
    where = "";
    if ( Array.isArray(filter) ) { // Verifica si filter es un array
        partialWhere = ` AND tr.descripcionTR LIKE ?`;
        filter.forEach( (eachFilter) => {
            replacements.push(eachFilter); // Al array de reemplazos se le agregan los filtros
            where = where + partialWhere; // Se arma la cláusula where con los filtros
            partialWhere = ` OR tr.descripcionTR LIKE ?`;
        });
    } else { // Si el filter no es un array, solo se agrega el filtro
        replacements.push(filter); // Al array de reemplazos se le agrega el filtro
        where = ` AND tr.descripcionTR LIKE ?`;
    };
};


// Listar todos los reclamos favoritos del vecino
const getClaims = async (req, res, next) => {
    try {
        // Obtiene la información contenida en el token para poder usar el neighborId
        const dataFromToken = getDataFromToken(req.headers['authorization']);

        let myFavoritesClaims = [];

        let queryMyFavoritesClaims = "";

        if ( dataFromToken.neighborId ) {

            replacements = [];
            replacements.push(dataFromToken.neighborId, dataFromToken.neighborId); // Se agrega el vecino al array de reemplazos

            if ( req.query.claimType ) { // Si se quiere filtrar por tipo de reclamo
                setFilter(req.query.claimType);
                queryMyFavoritesClaims = getQueryMyFavoritesClaims( where );
            } else { // En caso de que no se aplique ningún filtro
                queryMyFavoritesClaims = getQueryMyFavoritesClaims();
            };

            myFavoritesClaims = await sequelize.query( queryMyFavoritesClaims,
                {
                    replacements,   // El signo '?' (ver query) se reemplaza por 
                                    // lo que está dentro de este arreglo según
                                    // aparición. 
                                    // Con esto evitamos la inyección SQL.
                    type: QueryTypes.SELECT
                }
            );
        };

        if ( myFavoritesClaims.length === 0 ) {
            throw ApiError.notFound('No claims to show');
        };

        return res.status(200).json(myFavoritesClaims);
    } catch (error) {
        next(error);
    }
};


// Devuelve un reclamo en específico por id
const getClaimById = async (req, res, next) => {
    try {
        // Obtiene la información contenida en el token para poder usar el neighborId
        const dataFromToken = getDataFromToken(req.headers['authorization']);

        const queryClaimById = getQueryClaimById();

        const claim = await sequelize.query( queryClaimById,
            {
                replacements: [dataFromToken.neighborId, req.params.claimId, dataFromToken.neighborId],
                type: QueryTypes.SELECT
            }
        );

        if ( claim.length === 0 ) {
            throw ApiError.notFound(`Claim with id ${ req.params.claimId } not found for this neighbor`);
        };

        return res.status(200).json(claim);
    } catch (error) {
        next(error);
    }
};


// Crear un nuevo reclamo o un nuevo hecho de inseguridad
const createClaim = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        // Obtiene la información contenida en el token para poder usar el neighborId
        const dataFromToken = getDataFromToken(req.headers['authorization']);

        // Valida que sea o un reclamo o un hecho de inseguridad
        if ( req.body.claimSubcategoryId && req.body.insecurityFactTypeId ) {
            throw ApiError.badRequest('You can only create a claim or an insecurity fact');
        };

        // Valida que los datos obligatorios son proporcionados
        if ( !req.body.dateTimeObservation || !dataFromToken.neighborId ) {
            throw ApiError.badRequest('Missing required data. Please, fill all fields');
        };

        req.body.neighborId = dataFromToken.neighborId;
        
        // Valida que el formato de la fecha de observación sea correcto
        if ( !validator.isISO8601(req.body.dateTimeObservation) ) {
            throw ApiError.badRequest('The format of the observation date and time field is incorrect');
        };

        // Valida que la fecha de observación sea menor a la fecha actual
        if ( !dateTimeObservationIsValid(req.body.dateTimeObservation) ) {
            throw ApiError.badRequest('Observation date and time are greater than the current date');
        };

        // Valida que el id de la subcategoría de reclamo sea válido
        if ( req.body.claimSubcategoryId ) {
            if ( ! await claimSubcategoryIdIsValid(req.body.claimSubcategoryId) ) {
                throw ApiError.badRequest('Invalid claim subcategory id');
            };
        };

        // Valida que el id del tipo de hecho de inseguridad sea válido
        if ( req.body.insecurityFactTypeId ) {
            if ( ! await insecurityFactTypeIdIsValid(req.body.insecurityFactTypeId) ) {
                throw ApiError.badRequest('Invalid insecurity fact type id');
            };
        };

        // TODO: Queda pendiente ver dónde subimos las fotos cuando se crea un nuevo reclamo

        // TODO: Queda pendiente la conexión con la api de google maps para obtener la dirección del reclamo en caso de que sea proporcionada.

        // Crea el nuevo reclamo
        const newClaim = await models.Claim.create(req.body, { transaction });

        // Crea un nuevo registro en favoritos
        await models.Favorites.create({
            neighborId: dataFromToken.neighborId,
            claimId: newClaim.claimId             // El claimId viene del id del reclamo que se crea arriba
        }, { transaction });

        if ( req.body.claimSubcategoryId ) {        // Si viene el id de la subcategoría del reclamo, 
                                                    // entonces crea un nuevo registro en la tabla 
                                                    // estado_reclamo

            // Busca el estado donde la descripción sea 'Pendiente'
            const status = await models.Status.findOne({
                where: {
                    STAdescription: 'Pendiente'
                }
            });
    
            // Crea un nuevo registro en estado_reclamo
            await models.StatusClaim.create({
                statusId: status.statusId,
                claimId: newClaim.claimId 
            }, { transaction });
        };

        await transaction.commit();

        if ( req.body.claimSubcategoryId ) {
            return res.status(201).json({
                message: 'Claim created successfully',
            });
        };

        if ( req.body.insecurityFactTypeId ) {
            return res.status(201).json({
                message: 'Insecurity fact created successfully',
            });
        }
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};


// Editar un reclamo o un hecho de inseguridad existente
const editClaim = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        // Obtiene la información contenida en el token para poder usar el neighborId
        const dataFromToken = getDataFromToken(req.headers['authorization']);

        // Valida que sea o un reclamo o un hecho de inseguridad
        if ( req.body.claimSubcategoryId && req.body.insecurityFactTypeId ) {
            throw ApiError.badRequest('You can only update a claim or an insecurity fact');
        };

        // Valida que los datos obligatorios son proporcionados
        if ( !req.body.dateTimeObservation || !dataFromToken.neighborId ) {
            throw ApiError.badRequest('Missing required data. Please, fill all fields');
        };

        // Valida que el formato de la fecha de observación sea correcto
        if ( !validator.isISO8601(req.body.dateTimeObservation) ) {
            throw ApiError.badRequest('The format of the observation date and time field is incorrect');
        };

        // Valida que la fecha de observación sea menor a la fecha actual
        if ( !dateTimeObservationIsValid(req.body.dateTimeObservation) ) {
            throw ApiError.badRequest('Observation date and time are greater than the current date');
        };

        if ( req.body.claimSubcategoryId ) {
            // Valida que el id de la subcategoría de reclamo sea válido
            if ( ! await claimSubcategoryIdIsValid(req.body.claimSubcategoryId) ) {
                throw ApiError.badRequest('Invalid claim subcategory id');
            };

            const queryClaimToUpdate = getQueryClaimTo();

            // Busca el reclamo a actualizar
            const claimToUpdate = await sequelize.query( queryClaimToUpdate,
                {
                    replacements: [dataFromToken.neighborId, req.params.claimId, dataFromToken.neighborId],
                    type: QueryTypes.SELECT
                }
            );

            if ( claimToUpdate.length === 0 ) {
                throw ApiError.notFound(`Claim with id ${ req.params.claimId } not found for this neighbor`);
            };

            // Valida que el estado del reclamo sea 'Pendiente'
            if ( claimToUpdate[0].statusId !== 1 ) {
                throw ApiError.badRequest(`The claim cannot be updated because the status is other than 'Pendiente'`);
            };
        };

        if ( req.body.insecurityFactTypeId ) {
            // Valida que el id del tipo de hecho de inseguridad sea válido
            if ( ! await insecurityFactTypeIdIsValid(req.body.insecurityFactTypeId) ) {
                throw ApiError.badRequest('Invalid insecurity fact type id');
            };

            // Busca el hecho de inseguridad a actualizar
            const insecurityFactToUpdate = await models.Claim.findOne({
                where: {
                    claimId: req.params.claimId,
                    neighborId: dataFromToken.neighborId
                }
            });

            if ( !insecurityFactToUpdate ) {
                throw ApiError.notFound(`Insecurity fact with id ${ req.params.claimId } not found for this neighbor`);
            };
        };

        // TODO: Queda pendiente ver dónde subimos las fotos cuando se crea un nuevo reclamo

        // TODO: Queda pendiente la conexión con la api de google maps para obtener la dirección del reclamo en caso de que sea proporcionada.

        // Actualiza el reclamo
        await models.Claim.update(req.body, { 
            where: {
                claimId: req.params.claimId,
                neighborId: dataFromToken.neighborId
            },
            transaction });

        await transaction.commit();

        return res.status(200).json({
            message: 'Claim updated successfully'
        });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};


// Eliminar un reclamo
const deleteClaim = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        // Obtiene la información contenida en el token para poder usar el neighborId
        const dataFromToken = getDataFromToken(req.headers['authorization']);

        const queryClaimToDelete = getQueryClaimTo();

        // Busca el reclamo a eliminar
        const claimToDelete = await sequelize.query( queryClaimToDelete, 
            {
                replacements: [dataFromToken.neighborId, req.params.claimId, dataFromToken.neighborId],
                type: QueryTypes.SELECT
            }
        );

        if ( claimToDelete.length === 0 ) {
            throw ApiError.notFound(`Claim with id ${ req.params.claimId } not found for this neighbor`);
        };

        if ( claimToDelete[0].statusId !== 1 ) {
            throw ApiError.badRequest(`The claim cannot be deleted because the status is other than 'Pendiente'`);
        };

        await models.Claim.destroy({
            where: {
                claimId: req.params.claimId,
                neighborId: dataFromToken.neighborId
            },
            transaction
        });

        await transaction.commit();

        return res.status(200).json({
            message: 'Claim deleted successfully'
        });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};


// Listar todos los hechos de inseguridad favoritos del vecino
const getInsecurityFacts = async (req, res, next) => {
    try {
        // Obtiene la información contenida en el token para poder usar el neighborId
        const dataFromToken = getDataFromToken(req.headers['authorization']);

        let where = {};
        if ( req.query.insecurityFactType ) { // Si se quiere filtrar por tipo de hecho de inseguridad
            where = {
                insecurityFactTypeId: req.query.insecurityFactType
            }
        };

        const myFavoritesInsecurityFacts = await models.Favorites.findAll({
            where: {
                neighborId: dataFromToken.neighborId
            },
            include: [
                {
                    model: models.Claim,
                    as: 'claim',
                    where: {
                        insecurityFactTypeId: {
                            [Op.not]: null
                        }
                    },
                    include: [
                        {
                            model: models.InsecurityFactType,
                            as: 'insecurityFactType',
                            where      // Solo en caso que se quiera filtrar por tipo de hecho de inseguridad
                        }
                    ]
                }
            ]
        });

        if ( myFavoritesInsecurityFacts.length === 0 ) {
            throw ApiError.notFound('There are not insecurity facts to show');
        };

        return res.status(200).json(myFavoritesInsecurityFacts);
    } catch (error) {
        next(error);
    }
};


// Devuelve un hecho de inseguridad en específico por id
const getInsecurityFactById = async (req, res, next) => {
    try {
        // Obtiene la información contenida en el token para poder usar el neighborId
        const dataFromToken = getDataFromToken(req.headers['authorization']);
        
        const insecurityFact = await models.Claim.findOne({
            where: {
                claimId: req.params.claimId,
                neighborId: dataFromToken.neighborId
            },
            include: [
                {
                    model: models.InsecurityFactType,
                    as: 'insecurityFactType',
                    required: true                      // Para hacer un inner join
                }
            ]
        });

        if ( !insecurityFact ) {
            throw ApiError.notFound(`Insecurity fact with id ${ req.params.claimId } not found for this neighbor`);
        };

        return res.status(200).json(insecurityFact);
    } catch (error) {
        next(error);
    }
};


// Elimina un hecho de inseguridad
const deleteInsecurityFact = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        // Obtiene la información contenida en el token para poder usar el neighborId
        const dataFromToken = getDataFromToken(req.headers['authorization']);

        const insecurityFactToDelete = await models.Claim.findOne({
            where: {
                claimId: req.params.claimId,
                neighborId: dataFromToken.neighborId,
                insecurityFactTypeId: {
                    [Op.not]: null
                }
            }
        });

        if ( !insecurityFactToDelete ) {
            throw ApiError.notFound(`Insecurity fact with id ${ req.params.claimId } not found for this neighbor`);
        };
    
        const differenceInHours = calculateHoursOfDifference(insecurityFactToDelete.dateTimeCreation);
        // Valida que la diferencia entre la fecha de creación y la fecha de hoy no sea mayor a 24hs
        if ( differenceInHours >= 24 ) {
            throw ApiError.badRequest('The insecurity fact cannot be deleted because it was created more than 24 hours ago');
        };

        await models.Claim.destroy({
            where: {
                claimId: req.params.claimId,
                neighborId: dataFromToken.neighborId,
                insecurityFactTypeId: {
                    [Op.not]: null
                }
            },
            transaction
        });

        await transaction.commit();

        return res.status(200).json({
            message: 'Insecurity fact deleted successfully'
        });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};


/**
 * Valida que la fecha de observación sea menor a la fecha actual
*/
const dateTimeObservationIsValid = (dateTimeObservation) => {
    return dateTimeObservation < dayjs().format('YYYY-MM-DD HH:mm:ss');
};


/**
 * Valida que el id de la subcategoría de reclamo pertenezca a una subcategoría definida en la Base de Datos
*/
const claimSubcategoryIdIsValid = async (claimSubcategoryId) => {
    try {
        const claimSubcategory = await models.ClaimSubcategory.findByPk(claimSubcategoryId);
        if ( claimSubcategory ) {
            return true;
        } else {
            return false;
        };
    } catch (error) {
        throw error;
    }
};


/**
 * Valida que el id del tipo de hecho de inseguridad pertenezca a un tipo definido en la Base de Datos
*/
const insecurityFactTypeIdIsValid = async (insecurityFactTypeId) => {
    try {
        const insecurityFactType = await models.InsecurityFactType.findByPk(insecurityFactTypeId);
        if ( insecurityFactType ) {
            return true;
        } else {
            return false;
        };
    } catch (error) {
        throw error;
    }
};


/**
 * Calcula la diferencia entre la fecha de creación del reclamo y la fecha de hoy
*/
const calculateHoursOfDifference = (dateTimeCreation) => {
    const today = new Date();
    const todayInHours = today.getTime() / 1000 / 60 / 60;
    const dateTimeCreationInHours = dateTimeCreation.getTime() / 1000 / 60 / 60;
    return todayInHours - dateTimeCreationInHours;
};

module.exports = {
    getClaims,
    getClaimById,
    createClaim,
    editClaim,
    deleteClaim,
    getInsecurityFacts,
    getInsecurityFactById,
    deleteInsecurityFact
}