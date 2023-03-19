const { QueryTypes, Op } = require('sequelize');
const sequelize = require('../database/db-connection');
const models = require('../models');
const dayjs = require('dayjs');
const validator = require('validator');
const ApiError = require('../utils/apiError');
const getDataFromToken = require('../utils/getDataFromToken');
const fs = require('fs/promises');
const checkMissingRequiredAttributes = require('../utils/checkMissingRequiredAttributes');
const ValidateAuthorization = require('../utils/validateAuthorization');



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
    return  "rec.idReclamo 'claimId', " + 
            "rec.fechaHoraCreacion 'dateTimeCreation', " +
            "rec.fechaHoraObservacion 'dateTimeObservation', " +
            "rec.fechaHoraFin 'dateTimeEnd', " +
            "rec.calle 'street', " +
            "rec.numeroCalle 'streetNumber', " +
            "rec.latitud 'latitude', " +
            "rec.longitud 'longitude', " +
            "rec.direccionMapa 'mapAddress', " +
            "rec.comentario 'comment', " +
            "rec.calificacionResolucion 'resolutionRating', " +
            "rec.foto 'photo', " +
            "rec.idAgenteMunicipal 'municipalAgentId', " +
            "rec.idVecino 'neighborId', " +
            "scr.idSubcategoriaReclamo 'claimSubcategoryId', " +
            "scr.descripcionSCR 'CSCdescription', " +
            "tr.idTipoReclamo 'claimTypeId', " +
            "tr.descripcionTR 'CTdescription', " +
            "er.idEstadoReclamo 'statusClaimId', " +
            "er.fechaHoraInicioEstado 'dateTimeStatusStart', " +
            "est.idEstado 'statusId', " +
            "est.descripcionEST 'STAdescription' ";
};


/**
 * Devuelve el order by de la query por fechaHoraCreación de manera descendente
 * @param {string} field - Campo por el cual ordenar la query
 * @param {string} direction - Dirección de ordenamiento de la query
 * @returns {string} Order by de la query
 */
const queryOrderBy = (field, direction) => {
    return ` ORDER BY ${field} ${direction}`;
};


/**
 * Devuelve la query para obtener todos los reclamos favoritos de un vecino 
 * @returns {string} Query completa para obtener los reclamos favoritos de un vecino
*/
const getQueryMyFavoritesClaims = () => {
    return "SELECT " +
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
};


/**
 * Retorna un select genérico de una query para obtener reclamos
 * @returns {string} Select de la query
 */
const getSelectOfGenericalQuery = () => {
    return "SELECT " +
                getSelectQuery();
};


/**
 * Retorna la parte del "FROM" y los respectivos joins de una query genérica para obtener reclamos
 * @returns {string} Parte del "FROM" e "INNER JOIN" de la query
 */
const getFromOfQuery = () => {
    return  "FROM estado_reclamo er " +
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
                "ON scr.idTipoReclamo = tr.idTipoReclamo";
};


/**
 * Devuelve la query para obtener un reclamo por su id
 * @returns {string} Query completa para obtener un reclamo por su id
*/
// Se usa en la función getClaimById
const getQueryClaimById = (neighbor) => {
    return "SELECT " +
                getSelectQuery() +
            "FROM estado_reclamo er " +
            "INNER JOIN " + 
                getSubQueryLastClaimStatus( false ) +
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
};


const getQueryFavoriteByClaimId = (claimId, neighborId) => {
    return "SELECT * FROM favoritos WHERE idReclamo =" + claimId + " AND idVecino =" + neighborId;
}


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
 * Contruye la cláusula where en base a los filtros y la parte inicial del where
 * @param {string} filter - Filtro a aplicar a la cláusula where
 * @param {string} partialWhere - Parte inicial de la cláusula where
 */
const buildWhere = (filter, partialWhere) => {
    filter = filter.split(',');             // Para que reconozca el filtro como un array
    for ( key in filter ) {
        replacements.push(filter[key]);     // Al array de reemplazos se le agrega/n el/los filtro/s
        where = where + partialWhere;       // Se arma la cláusula where con el/los filtro/s
        partialWhere = `,?`;
    };
    partialWhere = `)`;
    where = where + partialWhere;
};


/**
 * Setea el/los filtro/s en la cláusula where de una query para obtener los reclamos favoritos de un vecino
 * @param {string|string[]} filter - Filtro a aplicar a la cláusula where
 * @param {string} query - Query a la que se le aplicará/n el/los filtro/s
 * @returns {string} Devuelve la query con los filtros aplicados
*/
const setFiltersForClaims = (filter, query) => {
    let partialWhere = "";
    
    if ( filter.claimType ) {
        partialWhere = ` AND tr.idTipoReclamo IN (?`;
        where = "";
        buildWhere(filter.claimType, partialWhere);
        query = query + where;
    };

    if ( filter.claimSubcategory ) {
        partialWhere = ` AND rec.idSubcategoriaReclamo IN (?`;
        where = "";
        buildWhere(filter.claimSubcategory, partialWhere);
        query = query + where;
    };

    if ( filter.status ) {
        partialWhere = ` AND est.idEstado IN (?`;
        where = "";
        buildWhere(filter.status, partialWhere);
        query = query + where;
    };

    if ( filter.startDate && filter.endDate ) {
        if ( !validator.isDate(filter.startDate) || !validator.isDate(filter.endDate) ) {
            throw ApiError.badRequest('Formato de fecha inválido. Asegurese que coincida con el formato YYYY-MM-DD');
        };
        if ( new Date(filter.startDate) > new Date(filter.endDate) ) {
            throw ApiError.badRequest('La fecha de inicio debe ser menor a la fecha de fin');
        };
        query = query + ` AND rec.fechaHoraObservacion BETWEEN ? AND ?`;
        replacements.push(filter.startDate, filter.endDate);
    }
    else if ( filter.startDate ) {
        if ( !validator.isDate(filter.startDate) ) {
            throw ApiError.badRequest('Formato de fecha inválido. Asegurese que coincida con el formato YYYY-MM-DD');
        };

        query = query + ` AND rec.fechaHoraObservacion >= ?`;
        replacements.push(filter.startDate);
    }
    else if ( filter.endDate ) {
        if ( !validator.isDate(filter.endDate) ) {
            throw ApiError.badRequest('Formato de fecha inválido. Asegurese que coincida con el formato YYYY-MM-DD');
        };

        query = query + ` AND rec.fechaHoraObservacion <= ?`;
        replacements.push(filter.endDate);
    };

    return query;
};


/**
 * Setea y devuelve el/los filtro/s en la cláusula where de una query para obtener los hechos de inseguridad favoritos de un vecino
 * @param {object} filter - Filtro/s a aplicar a la cláusula where
 * @returns {object} Devuelve un objeto con los filtros aplicados
*/
const setAndGetFiltersForInsecurityFacts = (filter) => {
    let whereInsecurityFactType = {};
    // Por defecto ya hace el where por aquellos reclamos que no tengan null los tipos de hechos de inseguridad
    let whereClaim = {
        insecurityFactTypeId: {
            [Op.not]: null
        }
    };

    if ( filter.insecurityFactType ) { // Si se quiere filtrar por tipo de hecho de inseguridad
        filter.insecurityFactType = filter.insecurityFactType.split(',');
        whereInsecurityFactType = {
            insecurityFactTypeId: filter.insecurityFactType
        };
    };

    if ( filter.startDate && filter.endDate ) { // Si se quiere filtrar por fecha de creación
        if ( !validator.isDate(filter.startDate) || !validator.isDate(filter.endDate) ) {
            throw ApiError.badRequest('Formato de fecha inválido. Asegurese que coincida con el formato YYYY-MM-DD');
        };
        if ( new Date(filter.startDate) > new Date(filter.endDate) ) {
            throw ApiError.badRequest('La fecha de inicio debe ser menor a la fecha de fin');
        };

        whereClaim = {
            [Op.and]: [
                {
                    insecurityFactTypeId: {
                        [Op.not]: null
                    }
                },
                {
                    dateTimeCreation: {
                        [Op.between]: [filter.startDate, filter.endDate]
                    }
                }
            ]
        };
    } else if ( filter.startDate ) {
        if ( !validator.isDate(filter.startDate) ) {
            throw ApiError.badRequest('Formato de fecha inválido. Asegurese que coincida con el formato YYYY-MM-DD');
        };

        whereClaim = {
            [Op.and]: [
                {
                    insecurityFactTypeId: {
                        [Op.not]: null
                    }
                },
                {
                    dateTimeCreation: {
                        [Op.gte]: filter.startDate
                    }
                }
            ]
        };
    } else if ( filter.endDate ) {
        if ( !validator.isDate(filter.endDate) ) {
            throw ApiError.badRequest('Formato de fecha inválido. Asegurese que coincida con el formato YYYY-MM-DD');
        };

        whereClaim = {
            [Op.and]: [
                {
                    insecurityFactTypeId: {
                        [Op.not]: null
                    }
                },
                {
                    dateTimeCreation: {
                        [Op.lte]: filter.endDate
                    }
                }
            ]
        };
    }
    return {
        whereInsecurityFactType,
        whereClaim
    };
};


/**
 * Setea el/los filtro/s a la cláusula where y devuelve la query armada para obtener los reclamos para un agente municipal
 * @param {object} filter - Filtro/s a aplicar a la cláusula where
 * @param {string} query - Query a la que se le aplicará/n el/los filtro/s
 * @param {string} where - Parte inicial de la cláusula where
 * @param {string} orderByDirection - Dirección de ordenamiento. Por defecto = 'DESC'
 * @returns {string} Devuelve la query con los filtros aplicados
*/
const setFiltersForMunicipalAgent = (filter, query, where, orderByDirection = 'DESC') => {
    if ( filter.orderByNumberOfFavorites === "yes" ) {
        query = query + ", count(fav.idReclamo) 'NumberOfFavorites' "
                      + getFromOfQuery()
                      + " INNER JOIN favoritos fav ON rec.idReclamo = fav.idReclamo"
                      + " INNER JOIN vecino vec ON rec.idVecino = vec.idVecino"
                      + where;
        query = setFiltersForClaims(filter, query)
                      + " GROUP BY fav.idReclamo"
                      + queryOrderBy('count(fav.idReclamo)', 'DESC');
    } else {
        query = query + getFromOfQuery()
                      + " INNER JOIN vecino vec ON rec.idVecino = vec.idVecino"
                      + where;
        query = setFiltersForClaims(filter, query)
                      + queryOrderBy('rec.fechaHoraCreacion', orderByDirection);
    };
    return query;
};


const saveImage = async (file) => {
    try {
        const destination = './public/uploadedImages/';
        const newFileName = Date.now() + '.jpg';

        await fs.writeFile(destination + newFileName, file, 'base64').catch((error) => {
            throw error;
        });

        return newFileName;
    }
    catch(error) {
        throw error;
    }
}


// Listar todos los reclamos favoritos del vecino
const getFavoriteClaims = async (req, res, next) => {
    try {
        // Obtiene la información contenida en el token para poder usar el neighborId
        const dataFromToken = getDataFromToken(req.headers['authorization']);

        ValidateAuthorization.oneUserHasAuthorization(dataFromToken.neighborId);

        replacements = [];
        // Se agrega el vecino al array de reemplazos
        replacements.push(dataFromToken.neighborId, dataFromToken.neighborId);

        let query = getQueryMyFavoritesClaims();
        // Este if es para que no revise cada if dentro de la función setFiltersForClaims si la query no tiene filtros
        if ( Object.keys(req.query).length ) query = setFiltersForClaims(req.query, query);
        const orderBy = queryOrderBy('rec.fechaHoraCreacion', 'DESC');
        query = query + orderBy;

        const myFavoritesClaims = await sequelize.query( query,
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


// Devuelve todos los estados por los que pasó el reclamo para hacer un seguimiento
const getClaimTracking = async (req, res, next) => {
    try {
        // Obtiene la información contenida en el token para poder usar el neighborId
        const dataFromToken = getDataFromToken(req.headers['authorization']);

        ValidateAuthorization.oneUserHasAuthorization(dataFromToken.neighborId);

        const claimTracking = await models.Claim.findOne({
            attributes: ['claimId'],
            include: [
                {
                    model: models.Favorites,
                    as: 'favorites',
                    attributes: { exclude: ['favoritesId', 'claimId', 'neighborId'] },
                    where: {
                        neighborId: dataFromToken.neighborId
                    }
                },
                {
                    model: models.StatusClaim,
                    as: 'status_claim',
                    attributes: ['dateTimeStatusStart'],
                    where: {
                        claimId: req.params.claimId
                    },
                    include: [
                        {
                            model: models.Status,
                            as: 'status',
                            attributes: ['statusId', 'STAdescription']
                        }
                    ]
                }
            ]
        });

        if ( !claimTracking ) {
            throw ApiError.notFound(`No se encontró el reclamo con id '${ req.params.claimId }'`);
        };

        return res.status(200).json(claimTracking);
    } catch (error) {
        next(error);
    }
};


// Devuelve los reclamos creados en las últimas 48hs para mostrarlos en el mapa.
const getClaimsForMap = async (req, res, next) => {
    try {
        // Obtiene la información contenida en el token para poder usar el neighborId
        const dataFromToken = getDataFromToken(req.headers['authorization']);

        ValidateAuthorization.oneUserHasAuthorization(dataFromToken.neighborId);

        // Lo que buscamos es que se muestren los reclamos hechos el mismo día y hace 2 días, por eso le sumo un día a la fecha de hoy (tomorrow) y le resto 2 (dateTwoDaysAgo)
        const tomorrow = calculateDate(dayjs(), 1);
        const dateTwoDaysAgo = calculateDate(dayjs(), -2);

        const query = getSelectOfGenericalQuery()
                      + getFromOfQuery()
                      + ` WHERE rec.fechaHoraCreacion BETWEEN '${dateTwoDaysAgo}' AND '${tomorrow}'`;

        const claimsForMap = await sequelize.query(query, {type: QueryTypes.SELECT});

        return res.status(200).json(claimsForMap);
    } catch (error) {
        next(error);
    }
};


// Funcionalidad para el agente municipal: Listar todos los reclamos pendientes
const getPendingClaims = async (req, res, next) => {
    try {
        // Obtiene la información contenida en el token para poder usar el municipalAgentId
        const dataFromToken = getDataFromToken(req.headers['authorization']);

        ValidateAuthorization.oneUserHasAuthorization(dataFromToken.municipalAgentId);

        replacements = [];
        where = " WHERE est.descripcionEST = 'Pendiente'";

        // FIXME: Posiblemente haya que agregar un LIMIT y OFFSET a la query para que no traiga todos los registros de una.
        let query = getSelectOfGenericalQuery()
                    + ", vec.nombre 'neighborFirstName', "
                    + " vec.apellido 'neighborLastName'";
        query = setFiltersForMunicipalAgent(req.query, query, where);

        // Query para obtener los reclamos pendientes
        const pendingClaims = await sequelize.query( query, {
            replacements,
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

        ValidateAuthorization.oneUserHasAuthorization(dataFromToken.municipalAgentId);

        replacements = [];
        replacements.push(dataFromToken.municipalAgentId);
        where = " WHERE rec.idAgenteMunicipal = ?";
        
        // FIXME: Posiblemente haya que agregar un LIMIT y OFFSET a la query para que no traiga todos los registros de una.
        let queryTakenClaims = getSelectOfGenericalQuery()
                               + ", vec.nombre 'neighborFirstName', "
                               + " vec.apellido 'neighborLastName'";
        queryTakenClaims = setFiltersForMunicipalAgent(req.query, queryTakenClaims, where, 'ASC');

        const myTakenClaims = await sequelize.query( queryTakenClaims, {
            replacements,
            type: QueryTypes.SELECT
        });

        return res.status(200).json(myTakenClaims);
    } catch (error) {
        next(error);
    }
};


// Devuelve un reclamo en específico por id
const getClaimById = async (req, res, next) => {
    try {
        // Obtiene la información contenida en el token para poder usar el neighborId y/o municipalAgentId
        const dataFromToken = getDataFromToken(req.headers['authorization']);

        ValidateAuthorization.bothUsersHaveAuthorization(dataFromToken.neighborId, dataFromToken.municipalAgentId);

        // Definí estos dos parámetros para modificar la query en caso que acceda un agente municipal
        const isNeighborQuery = dataFromToken.neighborId ? true : false;
        const replacements = [ req.params.claimId ];

        const queryClaimById = getQueryClaimById(isNeighborQuery);

        const claim = await sequelize.query( queryClaimById,
            {
                replacements,
                type: QueryTypes.SELECT
            }
        );

        if ( isNeighborQuery ) {
            if ( claim.length === 0 ) {
                throw ApiError.notFound(`El reclamo con id '${ req.params.claimId }' no se encontró para este vecino`);
            }
            else {
                if( claim[0].neighborId === dataFromToken.neighborId ) {
                    claim[0].own = true;
                }
                else {
                    claim[0].own = false;
                }

                if ( claim[0].own === false ) {
                    const queryFavoriteByClaimId = getQueryFavoriteByClaimId(claim[0].claimId, dataFromToken.neighborId);
                    
                    let favorite = await sequelize.query( queryFavoriteByClaimId, { type: QueryTypes.SELECT } );
                    
                    if ( favorite.length === 0 ) {
                        claim[0].hasFavorite = false;
                    }
                    else {
                        claim[0].hasFavorite = true;
                    }
                    
                }
            };
        } else {
            if ( claim.length === 0 ) {
                throw ApiError.notFound(`No se encontró el reclamo con id '${ req.params.claimId }'`);
            };
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

        ValidateAuthorization.oneUserHasAuthorization(dataFromToken.neighborId);

        if ( !req.body.claimSubcategoryId && !req.body.insecurityFactTypeId ) {
            throw ApiError.badRequest('El id de la subcategoría del reclamo o del hecho de inseguridad es requerido');
        };

        // Valida que sea o un reclamo o un hecho de inseguridad
        if ( req.body.claimSubcategoryId && req.body.insecurityFactTypeId ) {
            throw ApiError.badRequest('Solo puedes crear un reclamo o un hecho de inseguridad');
        };

        // Valida que los datos obligatorios son proporcionados
        const missingAttributes = checkMissingRequiredAttributes(req.body, ['dateTimeObservation', 'street', 'streetNumber']);
        if ( missingAttributes.length > 0 ) {
            throw ApiError.badRequest('Faltan datos obligatorios. Por favor, complete todos los campos');
        };

        req.body.neighborId = dataFromToken.neighborId;
        
        // Valida que el formato de la fecha de observación sea correcto
        if ( !validator.isISO8601(req.body.dateTimeObservation) ) {
            throw ApiError.badRequest('El formato de la fecha y hora de observación es incorrecto');
        };

        if ( !validator.isBefore(req.body.dateTimeObservation) ) {
            throw ApiError.badRequest('La fecha y hora de observación no puede ser mayor a la fecha actual');
        };

        // Valida que el id de la subcategoría de reclamo sea válido
        if ( req.body.claimSubcategoryId ) {
            if ( ! await claimSubcategoryIdIsValid(req.body.claimSubcategoryId) ) {
                throw ApiError.badRequest('El id de la subcategoría del reclamo es inválido');
            };
        };

        // Valida que el id del tipo de hecho de inseguridad sea válido
        if ( req.body.insecurityFactTypeId ) {
            if ( ! await insecurityFactTypeIdIsValid(req.body.insecurityFactTypeId) ) {
                throw ApiError.badRequest('El id del tipo de hecho de inseguridad es inválido');
            };
        };

        let fileName = '';
        if(req.body.photo) fileName = await saveImage(req.body.photo);

        let body = req.body;
        body.photo = fileName;
        
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
                message: 'Reclamo creado correctamente'
            });
        };

        if ( req.body.insecurityFactTypeId ) {
            return res.status(201).json({
                message: 'Hecho de inseguridad creado correctamente'
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


// Marca como favorito un reclamo o un hecho de inseguridad
const markClaimOrInsecurityFactAsFavorite = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        // Obtiene la información contenida en el token para poder usar el neighborId
        const dataFromToken = getDataFromToken(req.headers['authorization']);

        ValidateAuthorization.oneUserHasAuthorization(dataFromToken.neighborId);

        const claim = await models.Claim.findByPk(req.params.claimId);

        if (!claim) {
            throw ApiError.badRequest(`El reclamo con id '${req.params.claimId}' no existe`);
        };

        const isAlreadyMarkAsFavorite = await models.Favorites.findOne({
            where: {
                claimId: req.params.claimId,
                neighborId: dataFromToken.neighborId
            }
        });

        if ( isAlreadyMarkAsFavorite ) {
            throw ApiError.badRequest(`El reclamo con id '${req.params.claimId}' ya está marcado como favorito`);
        };

        await models.Favorites.create({
            claimId: req.params.claimId,
            neighborId: dataFromToken.neighborId
        }, { transaction });

        await transaction.commit();

        return res.status(201).json({
            message: 'Reclamo marcado como favorito correctamente'
        });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};


// Elimina de favoritos un reclamo o un hecho de inseguridad
const deleteClaimOrInsecurityFactMarkedAsFavorite = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        // Obtiene la información contenida en el token para poder usar el neighborId
        const dataFromToken = getDataFromToken(req.headers['authorization']);

        ValidateAuthorization.oneUserHasAuthorization(dataFromToken.neighborId);

        // Busca que exista el reclamo y esté marcado como favorito por el vecino actual
        const claim = await models.Favorites.findOne({
            where: {
                claimId: req.params.claimId,
                neighborId: dataFromToken.neighborId
            }
        });
        
        if (!claim) {
            throw ApiError.badRequest(`El reclamo con id '${req.params.claimId}' no está marcado como favorito para este vecino`);
        };

        // Si esta query devuelve un resultado, entonces no puede eliminar el reclamo, si no devuelve resultado entonces sí puede. Esto es para que no pueda eliminar un reclamo o HI creado por el usuario actual.
        const claimOfUser = await models.Claim.findOne({
            where: {
                claimId: req.params.claimId,
                neighborId: dataFromToken.neighborId
            },
            include: [
                {
                    model: models.Favorites,
                    as: 'favorites',
                    required: true,
                    where: {
                        claimId: req.params.claimId,
                        neighborId: dataFromToken.neighborId
                    }
                }
            ]
        });

        if (claimOfUser) {
            throw ApiError.badRequest(`No puedes eliminar de favoritos un reclamo propio`);
        };

        await models.Favorites.destroy({
            where: {
                claimId: req.params.claimId,
                neighborId: dataFromToken.neighborId
            },
            transaction
        });

        await transaction.commit();

        return res.status(200).json({
            message: `El reclamo se eliminó de favoritos correctamente`
        })
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

        ValidateAuthorization.oneUserHasAuthorization(dataFromToken.neighborId);

        if ( !req.body.claimSubcategoryId && !req.body.insecurityFactTypeId ) {
            throw ApiError.badRequest('El id de la subcategoría del reclamo o del hecho de inseguridad es requerido');
        };

        // Valida que sea o un reclamo o un hecho de inseguridad
        if ( req.body.claimSubcategoryId && req.body.insecurityFactTypeId ) {
            throw ApiError.badRequest('Solo puedes editar un reclamo o un hecho de inseguridad');
        };

        // Valida que los datos obligatorios son proporcionados
        const missingAttributes = checkMissingRequiredAttributes(req.body, ['dateTimeObservation', 'street', 'streetNumber']);
        if ( missingAttributes.length > 0 ) {
            throw ApiError.badRequest('Faltan datos obligatorios. Por favor, complete todos los campos');
        };

        // Valida que el formato de la fecha de observación sea correcto
        if ( !validator.isISO8601(req.body.dateTimeObservation) ) {
            throw ApiError.badRequest('El formato de la fecha y hora de observación es incorrecto');
        };

        // Valida que la fecha de observación sea menor a la fecha actual
        if ( !validator.isBefore(req.body.dateTimeObservation) ) {
            throw ApiError.badRequest('La fecha y hora de observación no puede ser mayor a la fecha actual');
        };

        let claimToUpdate = [];

        if ( req.body.claimSubcategoryId ) {
            // Valida que el id de la subcategoría de reclamo sea válido
            if ( ! await claimSubcategoryIdIsValid(req.body.claimSubcategoryId) ) {
                throw ApiError.badRequest('El id de la subcategoría del reclamo es inválido');
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
                throw ApiError.notFound(`El reclamo con id '${ req.params.claimId }' no se encontró para este vecino`);
            };

            // Si el usuario envía una calificación
            if ( req.body.resolutionRating ) {
                // Se valida que el estado sea 'Terminado'. Si no tiene ese estado, entonces no se puede actualizar.
                if ( claimToUpdate[0].statusId !== 5 ) {
                    throw ApiError.badRequest(`No se puede actualizar la calificación de la resolución del reclamo porque el estado es diferente a 'Terminado'`);
                };

                // Valida que el número de la calificación esté entre 1 y 10
                if ( req.body.resolutionRating < 1 || req.body.resolutionRating > 10 ) {
                    throw ApiError.badRequest(`La calificación de la resolución del reclamo debe ser un número entre 1 y 10`);
                };
            } else { // El usuario no envía una calificación
                // Valida que el estado sea 'Pendiente'. Si no tiene ese estado, entonces no se puede actualizar
                if ( claimToUpdate[0].statusId !== 1 ) {
                    throw ApiError.badRequest(`El reclamo no se puede actualizar porque el estado es diferente a 'Pendiente'`);
                };
            };
        };

        let insecurityFactToUpdate = {};

        if ( req.body.insecurityFactTypeId ) {
            // Valida que el id del tipo de hecho de inseguridad sea válido
            if ( ! await insecurityFactTypeIdIsValid(req.body.insecurityFactTypeId) ) {
                throw ApiError.badRequest('El id del tipo de hecho de inseguridad es inválido');
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
                throw ApiError.notFound(`El hecho de inseguridad con id '${ req.params.claimId }' no se encontró para este vecino`);
            };

            const differenceInHours = calculateHoursOfDifference(insecurityFactToUpdate.dateTimeCreation);
            // Valida que la diferencia entre la fecha de creación y la fecha de hoy no sea mayor a 24hs
            if ( differenceInHours >= 24 ) {
                throw ApiError.badRequest('El hecho de inseguridad no se puede editar porque fue creado hace más de 24hs');
            };
        };

        let body = {
            ...req.body
        };

        if  ( req.file ) {
            if ( claimToUpdate.length !== 0 ) {
                body.photo = await photoUpdateHandler(req.file, claimToUpdate[0].photo);
            } else {
                body.photo = await photoUpdateHandler(req.file, insecurityFactToUpdate.photo);
            };
        }
        else {
            if (!req.body.photo || validator.isBase64(req.body.photo)) {    //Con esto veo si es un base64 (osea, un archivo nuevo). Se puede mejorar
                if ( claimToUpdate.length !== 0 ) {
                    body.photo = await photoUpdateHandler(req.body.photo, claimToUpdate[0].photo);
                } else {
                    body.photo = await photoUpdateHandler(req.body.photo, insecurityFactToUpdate.photo);
                };
            }
        }

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
                message: 'Reclamo actualizado correctamente'
            });
        };

        if ( req.body.insecurityFactTypeId ) {
            return res.status(200).json({
                message: 'Hecho de inseguridad actualizado correctamente'
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

        ValidateAuthorization.oneUserHasAuthorization(dataFromToken.municipalAgentId);

        const missingAttributes = checkMissingRequiredAttributes(req.body, ['statusId']);
        if ( missingAttributes.length > 0 ) {
            throw ApiError.badRequest('Faltan datos obligatorios. Por favor, complete todos los campos');
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
            throw ApiError.notFound(`El reclamo con id '${ req.params.claimId }' no se encontró`);
        };

        // Valida que si el reclamo encontrado ya tiene asignado un id de agente municipal, entonces el agente que intenta cambiar el estado del reclamo sea el mismo agente municipal
        if ( claim.municipalAgentId ) {
            if ( claim.municipalAgentId !== dataFromToken.municipalAgentId ) {
                throw ApiError.badRequest(`El reclamo con id '${ req.params.claimId }' ya tiene asignado un agente municipal`);
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
            message: 'Estado del reclamo actualizado correctamente'
        });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};


// Eliminar solo un reclamo
const deleteClaim = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        // Obtiene la información contenida en el token para poder usar el neighborId
        const dataFromToken = getDataFromToken(req.headers['authorization']);

        ValidateAuthorization.oneUserHasAuthorization(dataFromToken.neighborId);
        
        const queryClaimToDelete = getQueryClaimTo();

        // Busca el reclamo a eliminar
        const claimToDelete = await sequelize.query( queryClaimToDelete, 
            {
                replacements: [dataFromToken.neighborId, req.params.claimId, dataFromToken.neighborId],
                type: QueryTypes.SELECT
            }
        );

        if ( claimToDelete.length === 0 ) {
            throw ApiError.notFound(`El reclamo con id '${ req.params.claimId }' no se encontró para este vecino`);
        };

        if ( claimToDelete[0].statusId !== 1 ) {
            throw ApiError.badRequest(`El reclamo con id '${ req.params.claimId }' no se puede eliminar porque el estado es diferente a 'Pendiente'`);
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
            // Arma el path donde está alojada la foto en el servidor para eliminarla cuando se elimina el reclamo
            const pathPreviousPhoto = `${__dirname}/../../public/uploadedImages/${claimToDelete[0].photo}`;
            await deleteImage(pathPreviousPhoto);
        };

        return res.status(200).json({
            message: 'Reclamo eliminado correctamente'
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

        ValidateAuthorization.oneUserHasAuthorization(dataFromToken.neighborId);

        let where = setAndGetFiltersForInsecurityFacts(req.query);
        
        const myFavoritesInsecurityFacts = await models.Favorites.findAll({
            where: {
                neighborId: dataFromToken.neighborId
            },
            include: [
                {
                    model: models.Claim,
                    as: 'claim',
                    where: where.whereClaim,    // Solo en caso que se quiera filtrar por un rango de fechas
                    include: [
                        {
                            model: models.InsecurityFactType,
                            as: 'insecurityFactType',
                            where: where.whereInsecurityFactType      // Solo en caso que se quiera filtrar por tipo de hecho de inseguridad
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


// Devuelve los hechos de inseguridad creados en las últimas 48hs para mostrarlos en el mapa para un vecino.
const getInsecurityFactsForMapForNeighbor = async (req, res, next) => {
    try {
        // Obtiene la información contenida en el token para poder usar el neighborId
        const dataFromToken = getDataFromToken(req.headers['authorization']);

        ValidateAuthorization.oneUserHasAuthorization(dataFromToken.neighborId);

        // Lo que buscamos es que se muestren los HI realizados el mismo día y hace 2 días, por eso le sumo un día a la fecha de hoy (tomorrow) y le resto 2 (dateTwoDaysAgo)
        const tomorrow = calculateDate(dayjs(), 1);
        const dateTwoDaysAgo = calculateDate(dayjs(), -2);
        
        const insecurityFactsForMap = await models.Claim.findAll({
            where: {
                dateTimeCreation: {
                    [Op.between]: [dateTwoDaysAgo, tomorrow]
                },
                insecurityFactTypeId: {
                    [Op.not]: null
                }
            },
            include: [
                {
                    model: models.InsecurityFactType,
                    as: 'insecurityFactType'
                }
            ]
        });

        return res.status(200).json(insecurityFactsForMap);
    } catch (error) {
        next(error);
    }
};


// Devuelve los hechos de inseguridad creados en las últimas 48hs para mostrarlos en el mapa para un agente municipal.
const getInsecurityFactsForMapForMunicipalAgent = async (req, res, next) => {
    try {
        // Obtiene la información contenida en el token para poder usar el neighborId
        const dataFromToken = getDataFromToken(req.headers['authorization']);

        ValidateAuthorization.oneUserHasAuthorization(dataFromToken.municipalAgentId);

        // Lo que buscamos es que se muestren los HI realizados el mismo día y hace 2 días, por eso le sumo un día a la fecha de hoy (tomorrow) y le resto 2 (dateTwoDaysAgo)
        const tomorrow = calculateDate(dayjs(), 1);
        const dateTwoDaysAgo = calculateDate(dayjs(), -2);
        
        const insecurityFactsForMap = await models.Claim.findAll({
            where: {
                dateTimeCreation: {
                    [Op.between]: [dateTwoDaysAgo, tomorrow]
                },
                insecurityFactTypeId: {
                    [Op.not]: null
                }
            },
            include: [
                {
                    model: models.InsecurityFactType,
                    as: 'insecurityFactType',
                    required: true
                },
                {
                    model: models.Neighbor,
                    as: 'neighbor',
                    required: true,
                    attributes: ['firstName', 'lastName']
                }
            ]
        });

        return res.status(200).json(insecurityFactsForMap);
    } catch (error) {
        next(error);
    }
};


// Devuelve un hecho de inseguridad en específico por id
const getInsecurityFactById = async (req, res, next) => {
    try {
        // Obtiene la información contenida en el token para poder usar el neighborId
        const dataFromToken = getDataFromToken(req.headers['authorization']);

        ValidateAuthorization.bothUsersHaveAuthorization(dataFromToken.neighborId, dataFromToken.municipalAgentId);

        let insecurityFact = {};

        if ( dataFromToken.neighborId ) {
            insecurityFact = await models.Claim.findOne({
                where: {
                    claimId: req.params.claimId
                },
                include: [
                    {
                        model: models.InsecurityFactType,
                        as: 'insecurityFactType',
                        required: true                      // Para hacer un inner join
                    },
                    {
                        model: models.Favorites,
                        as: 'favorites',
                        required: true,
                        where: {
                            neighborId: dataFromToken.neighborId
                        }
                    }
                ]
            });
            
            if ( !insecurityFact ) {
                throw ApiError.notFound(`El hecho de inseguridad con id '${ req.params.claimId }' no se encontró para este vecino`);
            };
        };

        if ( dataFromToken.municipalAgentId ) {
            insecurityFact = await models.Claim.findOne({
                where: {
                    claimId: req.params.claimId
                },
                include: [
                    {
                        model: models.InsecurityFactType,
                        as: 'insecurityFactType',
                        required: true                      // Para hacer un inner join
                    },
                    {
                        model: models.Neighbor,
                        as: 'neighbor',
                        required: true,
                        attributes: ['firstName', 'lastName']
                    }
                ]
            });

            if ( !insecurityFact ) {
                throw ApiError.notFound(`No se encontró el hecho de inseguridad con id '${ req.params.claimId }'`);
            };
        };

        return res.status(200).json(insecurityFact);
    } catch (error) {
        next(error);
    }
};


// Eliminar solo un hecho de inseguridad
const deleteInsecurityFact = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        // Obtiene la información contenida en el token para poder usar el neighborId
        const dataFromToken = getDataFromToken(req.headers['authorization']);

        ValidateAuthorization.oneUserHasAuthorization(dataFromToken.neighborId);

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
            throw ApiError.notFound(`El hecho de inseguridad con id '${ req.params.claimId }' no se encontró para este vecino`);
        };
    
        const differenceInHours = calculateHoursOfDifference(insecurityFactToDelete.dateTimeCreation);
        // Valida que la diferencia entre la fecha de creación y la fecha de hoy no sea mayor a 24hs
        if ( differenceInHours >= 24 ) {
            throw ApiError.badRequest('El hecho de inseguridad no se puede eliminar porque fue creado hace más de 24hs');
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

        if ( insecurityFactToDelete.photo ) {
            // Arma el path donde está alojada la foto en el servidor para eliminarla cuando se elimina el hecho de inseguridad
            const pathPreviousPhoto = `${__dirname}/../../public/uploadedImages/${insecurityFactToDelete.photo}`;
            await deleteImage(pathPreviousPhoto);
        };

        await transaction.commit();

        return res.status(200).json({
            message: 'Hecho de inseguridad eliminado correctamente'
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
        let newPhoto = '';
        if ( previousPhoto ) { // Si el reclamo ya tenía foto
            const filename = previousPhoto;
            const pathPreviousPhoto = `${__dirname}/../../public/uploadedImages/${filename}`;
            // Borra la foto del servidor
            await deleteImage(pathPreviousPhoto);
        };

        if(file) {
            newPhoto = await saveImage(file);
        }

        return newPhoto;
    } catch (error) {
        throw error;
    }
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


/**
 * Función genérica para calcular fechas. Es necesario usar la librería dayjs().
 * @param {Date} date - Fecha original.
 * @param {number} days - Si el parámetro es positivo, suma los días. Si es negativo, los resta.
 * @returns Fecha calculada
 */
const calculateDate = (date, days) => {
    return date.add(days, 'day').format('YYYY-MM-DD');
};

module.exports = {
    getFavoriteClaims,
    getClaimTracking,
    getClaimsForMap,
    getPendingClaims,
    getTakenClaims,
    getClaimById,
    createClaim,
    markClaimOrInsecurityFactAsFavorite,
    deleteClaimOrInsecurityFactMarkedAsFavorite,
    editClaim,
    changeClaimStatus,
    deleteClaim,
    getFavoriteInsecurityFacts,
    getInsecurityFactsForMapForNeighbor,
    getInsecurityFactsForMapForMunicipalAgent,
    getInsecurityFactById,
    deleteInsecurityFact
}