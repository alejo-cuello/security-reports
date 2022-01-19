const { QueryTypes } = require('sequelize');
const sequelize = require('../database/db-connection');
const models = require('../models');
const ApiError = require('../utils/apiError');
const getDataFromToken = require('../utils/getDataFromToken');


const queryMyFavoritesClaims = 
"SELECT \n" +
    "fav.idFavoritos 'favoriteId', \n" +
    "er.idEstadoReclamo 'statusClaimId', \n" +
    "rec.idReclamo 'claimId', \n" + 
    "rec.fechaHoraCreacion 'dateTimeCreation', \n" +
    "rec.fechaHoraObservacion 'dateTimeObservation', \n" +
    "rec.fechaHoraFin 'dateTimeEnd', \n" +
    "rec.calle 'street', \n" +
    "rec.numeroCalle 'streetNumber', \n" +
    "rec.latitud 'latitude', \n" +
    "rec.longitud 'longitude', \n" +
    "rec.direccionMapa 'mapAddress', \n" +
    "rec.comentario 'comment', \n" +
    "rec.calificacionResolucion 'resolutionQualification', \n" +
    "rec.foto 'photo', \n" +
    "rec.idAgenteMunicipal 'municipalAgentId', \n" +
    "rec.idVecino 'neighborId', \n" +
    "scr.idSubcategoriaReclamo 'claimSubcategoryId', \n" +
    "scr.descripcionSCR 'CSCdescription', \n" +
    "tr.idTipoReclamo 'claimTypeId', \n" +
    "tr.descripcionTR 'CTdescription', \n" +
    "est.idEstado 'statusId', \n" +
    "est.descripcionEST 'STAdescription', \n" +
    "er.fechaHoraInicioEstado 'dateTimeStatusStart' \n" +
"FROM estado_reclamo er \n" +
"INNER JOIN \n" + 
    "( SELECT \n" +
        "er.idReclamo, \n" +
        "max(er.fechaHoraInicioEstado) 'ultFechaHoraInicioEstado' \n" +
    "FROM estado_reclamo er \n" +
    "GROUP BY er.idReclamo ) ultimos_estado_reclamo \n" +
    "ON er.idReclamo = ultimos_estado_reclamo.idReclamo \n" +
        "AND er.fechaHoraInicioEstado = ultimos_estado_reclamo.ultFechaHoraInicioEstado \n" +
"LEFT JOIN reclamo rec \n" +
    "ON er.idReclamo = rec.idReclamo \n" +
"LEFT JOIN favoritos fav \n" +
    "ON fav.idReclamo = rec.idReclamo \n" +
"LEFT JOIN subcategoria_reclamo scr \n" +
    "ON rec.idSubcategoriaReclamo = scr.idSubcategoriaReclamo \n" +
"LEFT JOIN tipo_reclamo tr \n" +
    "ON scr.idTipoReclamo = tr.idTipoReclamo \n" +
"LEFT JOIN estado est \n" +
    "ON er.idEstado = est.idEstado \n" +
"WHERE fav.idVecino = ? \n" +               // Es importante el uso de '?'
"ORDER BY rec.fechaHoraCreacion DESC";


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

module.exports = {
    getClaims
}