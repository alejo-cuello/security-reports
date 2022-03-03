const { QueryTypes, Op } = require('sequelize');
const sequelize = require('../database/db-connection');
const models = require('../models');
const dayjs = require('dayjs');
const validator = require('validator');
const ApiError = require('../utils/apiError');
const getDataFromToken = require('../utils/getDataFromToken');
const fs = require('fs/promises');
const checkMissingRequiredAttributes = require('../utils/checkMissingRequiredAttributes');



// Variables globales
let replacements = [];
let where = "";
// -----------------------------


/**
 * Devuelve la subconsulta para obtener el último estado de un reclamo
 * @param {boolean} withJoin - Indica si es necesario hacer inner join con las tablas reclamo y favoritos para agregarlo a la query
 * @returns {string} Subconsulta
*/
const getSubQueryLastClaimStatus = ( withJoin ) => {
    let query = 
    "( SELECT " +
        "er.idReclamo, " +
        "max(er.fechaHoraInicioEstado) 'ultFechaHoraInicioEstado' " +
    "FROM estado_reclamo er ";

    if ( withJoin ) {
        query = query + "INNER JOIN reclamo rec " + 
                            "ON er.idReclamo = rec.idReclamo " +
                        "INNER JOIN favoritos fav " +
                            "ON rec.idReclamo = fav.idReclamo " +
                        "WHERE fav.idVecino = ? ";
    };

    query = query + "GROUP BY er.idReclamo ) ultimos_estado_reclamo ";
    return query;
};


/**
 * Devuelve el select de la query para obtener los reclamos
 * @returns {string} Select de la query
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
 * @returns {string} Query completa para obtener los reclamos favoritos de un vecino
*/
const getQueryMyFavoritesClaims = ( where = "" ) => {
    let query = 
    "SELECT " +
        "fav.idFavoritos 'favoriteId', " +
        getSelectQuery() +
    "FROM estado_reclamo er " +
    "INNER JOIN " + 
        getSubQueryLastClaimStatus( true ) +
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
 * Devuelve la query para obtener los reclamos que están en estado pendiente o tomados por el agente municipal según la condición "where". Es usada por el agente municipal
 * @param {string} where - Condición para filtrar los reclamos
 * @returns {string} Query completa para obtener los reclamos que están en estado pendiente
*/
const getQueryClaimsForMunicipalAgent = (where) => {
    return "SELECT " +
                getSelectQuery() +
            "FROM estado_reclamo er " +
            "INNER JOIN " +
                getSubQueryLastClaimStatus( false ) +
                "ON er.idReclamo = ultimos_estado_reclamo.idReclamo " +
                    "AND er.fechaHoraInicioEstado = ultimos_estado_reclamo.ultFechaHoraInicioEstado " +
            "INNER JOIN estado est " +
                "ON er.idEstado = est.idEstado " +
            "INNER JOIN reclamo rec " +
                "ON er.idReclamo = rec.idReclamo " + 
            "INNER JOIN subcategoria_reclamo scr " +
                "ON rec.idSubcategoriaReclamo = scr.idSubcategoriaReclamo " +
            "INNER JOIN tipo_reclamo tr " +
                "ON scr.idTipoReclamo = tr.idTipoReclamo " +
            where +
            "ORDER BY rec.fechaHoraCreacion ASC ";
};


/**
 * Devuelve la query para obtener un reclamo por su id
 * @returns {string} Query completa para obtener un reclamo por su id
*/
// Se usa en la función getClaimById
const getQueryClaimById = (neighbor) => {
    let query =
                "SELECT " +
                    getSelectQuery() +
                "FROM estado_reclamo er " +
                "INNER JOIN " + 
                    getSubQueryLastClaimStatus( neighbor ) +
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
                "WHERE rec.idReclamo = ?";
    
    if( neighbor )  query = query + " AND rec.idVecino = ?";

    return query;
};


/**
 * Devuelve la query para editar o eliminar un reclamo 
 * @return {string} Query completa para editar o eliminar un reclamo
*/
// Se usa en la función editClaim y deleteClaim
const getQueryClaimTo = () => {
    return "SELECT " +
                "rec.idReclamo 'claimId', " +
                "rec.idVecino 'neighborId', " +
                "rec.foto 'photo', " +
                "er.idEstado 'statusId' " +
            "FROM estado_reclamo er " +
            "INNER JOIN " + 
                getSubQueryLastClaimStatus( true ) +
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

    //Agregué esta linea para que reconozca el filtro como un array
    filter = filter.split(',');

    if ( Array.isArray(filter) ) { // Verifica si filter es un array
        partialWhere = ` AND tr.idTipoReclamo IN (?`;
        filter.forEach( (eachFilter) => {
            replacements.push(eachFilter); // Al array de reemplazos se le agregan los filtros
            where = where + partialWhere; // Se arma la cláusula where con los filtros
            partialWhere = `,?`;
        });
        partialWhere = `)`;
        where = where + partialWhere;
    } else { // Si el filter no es un array, solo se agrega el filtro
        replacements.push(filter); // Al array de reemplazos se le agrega el filtro
        where = ` AND tr.idTipoReclamo = ?`;
    };
};


/**
 * Setea el o los filtros para la query de obtener los reclamos por subtipos
 * @param {string|string[]} filter - Filtro a aplicar a la cláusula where para obtener los reclamos
*/
const setFilterSubcategory = (filter) => {
    let partialWhere = "";
    where = "";

    //Agregué esta linea para que reconozca el filtro como un array
    filter = filter.split(',');

    if ( Array.isArray(filter) ) { // Verifica si filter es un array
        partialWhere = ` AND rec.idSubcategoriaReclamo IN (?`;
        filter.forEach( (eachFilter) => {
            replacements.push(eachFilter); // Al array de reemplazos se le agregan los filtros
            where = where + partialWhere; // Se arma la cláusula where con los filtros
            partialWhere = `,?`;
        });
        partialWhere = `)`;
        where = where + partialWhere;
    } else { // Si el filter no es un array, solo se agrega el filtro
        replacements.push(filter); // Al array de reemplazos se le agrega el filtro
        where = ` AND rec.idSubcategoriaReclamo = ?`;
    };
};


// Listar todos los reclamos favoritos del vecino
const getFavoriteClaims = async (req, res, next) => {
    try {
        // Obtiene la información contenida en el token para poder usar el neighborId
        const dataFromToken = getDataFromToken(req.headers['authorization']);

        let myFavoritesClaims = [];

        let queryMyFavoritesClaims = "";

        if ( !dataFromToken.neighborId ) {
            throw ApiError.forbidden(`You can't access to this resource`);
        };

        replacements = [];
        replacements.push(dataFromToken.neighborId, dataFromToken.neighborId); // Se agrega el vecino al array de reemplazos

        if ( req.query.claimSubcategory) {
            setFilterSubcategory(req.query.claimSubcategory);
            queryMyFavoritesClaims = getQueryMyFavoritesClaims( where );
        }
        else {
            if ( req.query.claimType ) { // Si se quiere filtrar por tipo de reclamo
                setFilter(req.query.claimType);
                queryMyFavoritesClaims = getQueryMyFavoritesClaims( where );
            } else { // En caso de que no se aplique ningún filtro
                queryMyFavoritesClaims = getQueryMyFavoritesClaims();
            };
        }

        myFavoritesClaims = await sequelize.query( queryMyFavoritesClaims,
            {
                replacements,   // El signo '?' (ver query) se reemplaza por 
                                // lo que está dentro de este arreglo según
                                // aparición. 
                                // Con esto evitamos la inyección SQL.
                type: QueryTypes.SELECT
            }
        );

        return res.status(200).json(myFavoritesClaims);
    } catch (error) {
        next(error);
    }
};


// Funcionalidad para el agente municipal: Listar todos los reclamos pendientes
const getPendingClaims = async (req, res, next) => {
    try {
        // Obtiene la información contenida en el token para poder usar el municipalAgentId
        const dataFromToken = getDataFromToken(req.headers['authorization']);

        if ( !dataFromToken.municipalAgentId ) {
            throw ApiError.forbidden(`You can't access to this resource`);
        };

        where = "";
        where = `WHERE est.descripcionEST = 'Pendiente' `;
        const queryPendingClaims = getQueryClaimsForMunicipalAgent(where); // TODO: Posiblemente haya que agregar un LIMIT y OFFSET
        
        // Query para obtener los reclamos pendientes
        const pendingClaims = await sequelize.query( queryPendingClaims, {
            type: QueryTypes.SELECT
        });

        return res.status(200).json(pendingClaims);
    } catch (error) {
        next(error);
    }
}; 


// Funcionalidad para el agente municipal: Devuelve los reclamos tomados por el agente municipal
const getTakenClaims = async (req, res, next) => {
    try {
        // Obtiene la información contenida en el token para poder usar el municipalAgentId
        const dataFromToken = getDataFromToken(req.headers['authorization']);

        if ( !dataFromToken.municipalAgentId ) {
            throw ApiError.forbidden(`You can't access to this resource`);
        };

        replacements = [];
        where = "";

        replacements.push(dataFromToken.municipalAgentId);
        where = `WHERE rec.idAgenteMunicipal = ? `;

        const queryTakenClaims = getQueryClaimsForMunicipalAgent(where);

        const myTakenClaims = await sequelize.query( queryTakenClaims, {
            replacements,
            type: QueryTypes.SELECT
        });

        if ( myTakenClaims.length === 0 ) {
            throw ApiError.notFound(`You did not take any claim`);
        };

        return res.status(200).json(myTakenClaims);
    } catch (error) {
        next(error);
    }
};


// Devuelve un reclamo en específico por id
const getClaimById = async (req, res, next) => {
    try {
        // Obtiene la información contenida en el token para poder usar el neighborId
        const dataFromToken = getDataFromToken(req.headers['authorization']);

        if ( !dataFromToken.neighborId && !dataFromToken.municipalAgentId  ) {
            throw ApiError.forbidden(`You can't access to this resource`);
        };

        // Definí estos dos parámetros para modificar la query en caso que acceda un agente municipal
        const isNeighborQuery = dataFromToken.neighborId ? true : false;
        const replacements =
            dataFromToken.neighborId ?
                [ dataFromToken.neighborId, req.params.claimId, dataFromToken.neighborId ]
                : [ req.params.claimId ];

        const queryClaimById = getQueryClaimById(isNeighborQuery);

        const claim = await sequelize.query( queryClaimById,
            {
                replacements,
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

        if ( !dataFromToken.neighborId ) {
            throw ApiError.forbidden(`You can't access to this resource`);
        };

        if ( !req.body.claimSubcategoryId && !req.body.insecurityFactTypeId ) {
            throw ApiError.badRequest('Claim subcategory ID or insecurity fact type ID is required');
        };

        // Valida que sea o un reclamo o un hecho de inseguridad
        if ( req.body.claimSubcategoryId && req.body.insecurityFactTypeId ) {
            throw ApiError.badRequest('You can only create a claim or an insecurity fact');
        };

        // Valida que los datos obligatorios son proporcionados
        const missingAttributes = checkMissingRequiredAttributes(req.body, ['dateTimeObservation', 'street', 'streetNumber']);
        if ( missingAttributes.length > 0 ) {
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

        let fileUrl = null;

        if ( req.file ) {
            // Mete en el body la url donde está alojada la foto para poder guardarla en la base de datos
            fileUrl = req.file.filename;
        };

        let body = req.body;
        body.photo = fileUrl;
        
        // Crea el nuevo reclamo
        const newClaim = await models.Claim.create(body, { transaction });

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
        if ( req.file ) {
            await deleteImage(req.file.path);
        };
        next(error);
    }
};


// Editar un reclamo o un hecho de inseguridad existente
const editClaim = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        // Obtiene la información contenida en el token para poder usar el neighborId
        const dataFromToken = getDataFromToken(req.headers['authorization']);

        if ( !dataFromToken.neighborId ) {
            throw ApiError.forbidden(`You can't access to this resource`);
        };

        if ( !req.body.claimSubcategoryId && !req.body.insecurityFactTypeId ) {
            throw ApiError.badRequest('Claim subcategory ID or insecurity fact type ID is required');
        };

        // Valida que sea o un reclamo o un hecho de inseguridad
        if ( req.body.claimSubcategoryId && req.body.insecurityFactTypeId ) {
            throw ApiError.badRequest('You can only update a claim or an insecurity fact');
        };

        // Valida que los datos obligatorios son proporcionados
        const missingAttributes = checkMissingRequiredAttributes(req.body, ['dateTimeObservation', 'street', 'streetNumber']);
        if ( missingAttributes.length > 0 ) {
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

        let claimToUpdate = [];

        if ( req.body.claimSubcategoryId ) {
            // Valida que el id de la subcategoría de reclamo sea válido
            if ( ! await claimSubcategoryIdIsValid(req.body.claimSubcategoryId) ) {
                throw ApiError.badRequest('Invalid claim subcategory id');
            };

            const queryClaimToUpdate = getQueryClaimTo();

            // Busca el reclamo a actualizar
            claimToUpdate = await sequelize.query( queryClaimToUpdate,
                {
                    replacements: [dataFromToken.neighborId, req.params.claimId, dataFromToken.neighborId],
                    type: QueryTypes.SELECT
                }
            );

            if ( claimToUpdate.length === 0 ) {
                throw ApiError.notFound(`Claim with id ${ req.params.claimId } not found for this neighbor`);
            };

            // Si el usuario envía una calificación
            if ( req.body.resolutionRating ) {
                // Se valida que el estado sea 'Terminado'. Si no tiene ese estado, entonces no se puede actualizar.
                if ( claimToUpdate[0].statusId !== 5 ) {
                    throw ApiError.badRequest(`Cannot update the claim resolution rating because the status is other than 'Terminado'`);
                };

                // Valida que el número de la calificación esté entre 1 y 10
                if ( req.body.resolutionRating < 1 || req.body.resolutionRating > 10 ) {
                    throw ApiError.badRequest(`The resolution rating must be an integer between 1 and 10`);
                };
            } else { // El usuario no envía una calificación
                // Valida que el estado sea 'Pendiente'. Si no tiene ese estado, entonces no se puede actualizar
                if ( claimToUpdate[0].statusId !== 1 ) {
                    throw ApiError.badRequest(`The claim cannot be updated because the status is other than 'Pendiente'`);
                };
            };
        };

        let insecurityFactToUpdate = {};

        if ( req.body.insecurityFactTypeId ) {
            // Valida que el id del tipo de hecho de inseguridad sea válido
            if ( ! await insecurityFactTypeIdIsValid(req.body.insecurityFactTypeId) ) {
                throw ApiError.badRequest('Invalid insecurity fact type id');
            };

            // Busca el hecho de inseguridad a actualizar
            insecurityFactToUpdate = await models.Claim.findOne({
                where: {
                    claimId: req.params.claimId,
                    neighborId: dataFromToken.neighborId,
                    insecurityFactTypeId: {
                        [Op.not]: null
                    }
                }
            });

            if ( !insecurityFactToUpdate ) {
                throw ApiError.notFound(`Insecurity fact with id ${ req.params.claimId } not found for this neighbor`);
            };
        };

        let fileUrl;
        if ( claimToUpdate.length !== 0 ) {
            fileUrl = await photoUpdateHandler(req.file, claimToUpdate[0].photo);
        } else {
            fileUrl = await photoUpdateHandler(req.file, insecurityFactToUpdate.photo);
        };

        let body = {
            ...req.body
        }

        if(fileUrl) body.photo = fileUrl;

        // Actualiza el reclamo
        await models.Claim.update(body, { 
            where: {
                claimId: req.params.claimId,
                neighborId: dataFromToken.neighborId
            },
            transaction });

        await transaction.commit();

        if ( req.body.claimSubcategoryId ) {
            return res.status(200).json({
                message: 'Claim updated successfully',
            });
        };

        if ( req.body.insecurityFactTypeId ) {
            return res.status(200).json({
                message: 'Insecurity fact updated successfully',
            });
        }
    } catch (error) {
        await transaction.rollback();
        if ( req.file ) {
            await deleteImage(req.file.path);
        };
        next(error);
    }
};


// Se usa para que el agente municipal pueda cambiar el estado del reclamo (realizar el seguimiento)
const changeClaimStatus = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        // Obtiene la información contenida en el token para poder usar el municipalAgentId
        const dataFromToken = getDataFromToken(req.headers['authorization']);

        if ( !dataFromToken.municipalAgentId ) {
            throw ApiError.forbidden(`You can't access to this resource`);
        };

        const missingAttributes = checkMissingRequiredAttributes(req.body, ['statusId']);
        if ( missingAttributes.length > 0 ) {
            throw ApiError.badRequest('Missing required data. Please, fill all fields');
        };

        // Busca el reclamo para luego verificar si ya tiene un agente asignado o no
        const claim = await models.Claim.findOne({
            where: {
                claimId: req.params.claimId,
                claimSubcategoryId: {
                    [Op.not]: null
                }
            }
        });

        if ( !claim ) {
            throw ApiError.notFound(`Claim with id ${ req.params.claimId } not found`);
        };

        // Valida que si el reclamo encontrado ya tiene asignado un id de agente municipal, entonces el agente que intenta cambiar el estado del reclamo sea el mismo agente municipal
        if ( claim.municipalAgentId ) {
            if ( claim.municipalAgentId !== dataFromToken.municipalAgentId ) {
                throw ApiError.badRequest(`The claim with id ${ req.params.claimId } has already been assigned to a municipal agent`);
            };
        };

        // Busca la descripción del estado que le quiere asignar al reclamo
        const status = await models.Status.findOne({
            attributes: ['STAdescription'],
            where: {
                statusId: req.body.statusId
            }
        });

        let body = req.body;

        // Si la descripción del estado es algunos de estos, entonces setea la fecha de fin del reclamo
        if ( status.STAdescription === 'Terminado' || 
             status.STAdescription === 'Rechazado' || 
             status.STAdescription === 'Rechazado por falsedad' ) {
            body.dateTimeEnd = dayjs().format('YYYY-MM-DD HH:mm:ss');
        } else { // Si la descripción del estado no coincide con ninguno de los estados anteriores, entonces la fecha de fin se setea en null
            body.dateTimeEnd = null;
        };

        body.municipalAgentId = dataFromToken.municipalAgentId;
        body.claimId = req.params.claimId;

        await models.Claim.update(body, {
            where: {
                claimId: req.params.claimId
            }, transaction
        });

        await models.StatusClaim.create(body, { transaction });

        await transaction.commit();

        return res.status(200).json({
            message: 'Claim status updated successfully'
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

        if ( !dataFromToken.neighborId ) {
            throw ApiError.forbidden(`You can't access to this resource`);
        };
        
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

        if ( claimToDelete[0].photo ) {
            await deleteImage(claimToDelete[0].photo);
        };

        return res.status(200).json({
            message: 'Claim deleted successfully'
        });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};


// Listar todos los hechos de inseguridad favoritos del vecino
const getFavoriteInsecurityFacts = async (req, res, next) => {
    try {
        // Obtiene la información contenida en el token para poder usar el neighborId
        const dataFromToken = getDataFromToken(req.headers['authorization']);

        if ( !dataFromToken.neighborId ) {
            throw ApiError.forbidden(`You can't access to this resource`);
        };
        
        if(req.query.insecurityFactType) req.query.insecurityFactType = req.query.insecurityFactType.split(',');

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

        if ( !dataFromToken.neighborId ) {
            throw ApiError.forbidden(`You can't access to this resource`);
        };

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

        if ( !dataFromToken.neighborId ) {
            throw ApiError.forbidden(`You can't access to this resource`);
        };

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

        // if ( insecurityFactToDelete.photo ) {
        //     await deleteImage(insecurityFactToDelete.photo);
        // };

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
 * Maneja la actualización de la foto de un reclamo
 * @param {object} file - Objeto con la imagen que envía el usuario
 * @param {string|null} previousPhoto - Ruta donde se encuentra la foto antigua del reclamo. Null si no tiene foto
*/
const photoUpdateHandler = async (file, previousPhoto) => {
    try {
        let newPhoto = "";
        if ( previousPhoto ) { // Si el reclamo ya tiene foto
            if ( file ) { // Si el usuario envía una foto
                // Mete en el body la url donde está alojada la foto para poder guardarla en la base de datos
                newPhoto = file.filename;
            } else { // Si el usuario no envía una foto
                newPhoto = null;
            };

            // Lo dejo comentado de momento, revisar más adelante como borrar la foto anterior

            // const filename = previousPhoto;
            // Borra la foto del servidor
            // await deleteImage(filename);
        } else { // Si el reclamo no tiene foto
            if ( file ) { // Si el usuario envía una foto
                // Mete en el body la url donde está alojada la foto para poder guardarla en la base de datos
                newPhoto = file.filename;
            };
        };
        return newPhoto;
    } catch (error) {
        throw error;
    }
};


/**
 * Valida que la fecha de observación sea menor a la fecha actual
 * @param {Date} dateTimeObservation - Fecha de observación del reclamo
 * @returns {boolean} Retorna true si la fecha de observación es menor a la fecha actual, false si no
*/
const dateTimeObservationIsValid = (dateTimeObservation) => {
    return dateTimeObservation < dayjs().format('YYYY-MM-DD HH:mm:ss');
};


/**
 * Valida que el id de la subcategoría de reclamo pertenezca a una subcategoría definida en la Base de Datos
 * @param {number} claimSubcategoryId - Id de la subcategoría de reclamo
 * @returns {Promise<boolean>} Retorna true si el id de la subcategoría pertenece a una subcategoría definida en la Base de Datos, false si no
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
 * @param {number} insecurityFactTypeId - Id del tipo de hecho de inseguridad
 * @returns {Promise<boolean>} Retorna true si el id del tipo de hecho de inseguridad pertenece a un tipo definido en la Base de Datos, false si no 
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
 * @param {Date} dateTimeCreation - Fecha de creación del reclamo
 * @returns {number} Retorna la diferencia en horas entre la fecha de creación del reclamo y la fecha de hoy
*/
const calculateHoursOfDifference = (dateTimeCreation) => {
    const today = new Date();
    const todayInHours = today.getTime() / 1000 / 60 / 60;
    const dateTimeCreationInHours = dateTimeCreation.getTime() / 1000 / 60 / 60;
    return todayInHours - dateTimeCreationInHours;
};


/**
 * Elimina la imagen almacenada en el servidor
 * @param {string} path - Ruta donde está alojada la imagen
*/
const deleteImage = async (path) => {
    try {
        await fs.unlink(path);
    } catch (error) {
        throw error;
    }
};

module.exports = {
    getFavoriteClaims,
    getPendingClaims,
    getTakenClaims,
    getClaimById,
    createClaim,
    editClaim,
    changeClaimStatus,
    deleteClaim,
    getFavoriteInsecurityFacts,
    getInsecurityFactById,
    deleteInsecurityFact
}