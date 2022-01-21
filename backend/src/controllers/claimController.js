const { QueryTypes } = require('sequelize');
const sequelize = require('../database/db-connection');
const models = require('../models');
const dayjs = require('dayjs');
const ApiError = require('../utils/apiError');
const getDataFromToken = require('../utils/getDataFromToken');


// Se usa en la función getClaims
const queryMyFavoritesClaims = 
"SELECT " +
    "fav.idFavoritos 'favoriteId', " +
    "er.idEstadoReclamo 'statusClaimId', " +
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
    "er.fechaHoraInicioEstado 'dateTimeStatusStart' " +
"FROM estado_reclamo er " +
"INNER JOIN " + 
    "( SELECT " +
        "er.idReclamo, " +
        "max(er.fechaHoraInicioEstado) 'ultFechaHoraInicioEstado' " +
    "FROM estado_reclamo er " +
    "GROUP BY er.idReclamo ) ultimos_estado_reclamo " +
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
"WHERE fav.idVecino = ? " +               // Es importante el uso de '?' para evitar inyección SQL
"ORDER BY rec.fechaHoraCreacion DESC";


// Se usa en la función getClaimById
const queryClaimById = 
"SELECT " +
    "er.idEstadoReclamo 'statusClaimId', " +
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
    "er.fechaHoraInicioEstado 'dateTimeStatusStart' " +
"FROM estado_reclamo er " +
"INNER JOIN " + 
    "( SELECT " +
        "er.idReclamo, " +
        "max(er.fechaHoraInicioEstado) 'ultFechaHoraInicioEstado' " +
    "FROM estado_reclamo er " +
    "GROUP BY er.idReclamo ) ultimos_estado_reclamo " +
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


// Se usa en la función deleteClaim
const queryClaimToDelete = 
"SELECT " +
    "rec.idReclamo 'claimId', " +
    "rec.idVecino 'neighborId', " +
    "er.idEstado 'statusId' " +
"FROM estado_reclamo er " +
"INNER JOIN " + 
    "( SELECT " +
        "er.idReclamo, " +
        "max(er.fechaHoraInicioEstado) 'ultFechaHoraInicioEstado' " +
    "FROM estado_reclamo er " +
    "GROUP BY er.idReclamo ) ultimos_estado_reclamo " +
    "ON er.idReclamo = ultimos_estado_reclamo.idReclamo " +
        "AND er.fechaHoraInicioEstado = ultimos_estado_reclamo.ultFechaHoraInicioEstado " +
"INNER JOIN reclamo rec " +
    "ON er.idReclamo = rec.idReclamo " +
"WHERE rec.idReclamo = ? AND rec.idVecino = ?";


// Listar todos los reclamos
const getClaims = async (req, res, next) => {
    try {
        // Obtiene la información contenida en el token para poder usar el userId
        const dataFromToken = getDataFromToken(req.headers['authorization']);

        let myFavoritesClaims = [];

        if ( dataFromToken.neighborId ) {
            myFavoritesClaims = await sequelize.query( queryMyFavoritesClaims,
                {
                    replacements: [dataFromToken.neighborId],   // El signo '?' (ver query) se reemplaza por 
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
        // Obtiene la información contenida en el token para poder usar el userId
        const dataFromToken = getDataFromToken(req.headers['authorization']);

        const claim = await sequelize.query( queryClaimById,
            {
                replacements: [req.params.claimId, dataFromToken.neighborId],
                type: QueryTypes.SELECT
            }
        );

        if ( claim.length === 0 ) {
            throw ApiError.notFound(`Claim with id ${ req.params.claimId } not found for this neighbor`);
        };

        res.status(200).json(claim);
    } catch (error) {
        next(error);
    }
};


// Crear un nuevo reclamo
const createClaim = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        // Obtiene la información contenida en el token para poder usar el userId
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
        
        // Valida que la fecha de observación sea menor a la fecha actual
        if ( req.body.dateTimeObservation > dayjs().format('YYYY-MM-DD HH:mm:ss') ) {
            throw ApiError.badRequest('The date of observation is greater than the current date');
        };

        // Crea el nuevo reclamo
        const newClaim = await models.Claim.create(req.body, { transaction });

        // Crea un nuevo registro en favoritos que pertenece al vecino que lo crea
        await models.Favorites.create({
            neighborId: dataFromToken.neighborId,
            claimId: newClaim.claimId             // El claimId viene del id del reclamo que se crea arriba
        }, { transaction });

        if ( req.body.claimSubcategoryId ) {
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

        res.status(201).json({
            message: 'Claim created successfully',
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
        // Obtiene la información contenida en el token para poder usar el userId
        const dataFromToken = getDataFromToken(req.headers['authorization']);

        const claimToDelete = await sequelize.query( queryClaimToDelete, 
            {
                replacements: [req.params.claimId, dataFromToken.neighborId],
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

        res.status(200).json({
            message: 'Claim deleted successfully'
        });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};

module.exports = {
    getClaims,
    getClaimById,
    createClaim,
    deleteClaim
}