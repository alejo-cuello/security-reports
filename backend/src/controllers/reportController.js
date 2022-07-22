const models = require('../models');
const sequelize = require('../database/db-connection');
const { QueryTypes, Op } = require('sequelize');
const ApiError = require('../utils/apiError');
const getDataFromToken = require("../utils/getDataFromToken");
const ValidateAuthorization = require("../utils/validateAuthorization");
const validator = require('validator');


let replacements = [];

const getReport = async (req, res, next) => {
    try {
        // Obtiene la información contenida en el token para poder usar el neighborId
        const dataFromToken = getDataFromToken(req.headers['authorization']);

        ValidateAuthorization.oneUserHasAuthorization(dataFromToken.municipalAgentId);

        replacements = [];
        let query = `SELECT 
                        insecurityFactType.idTipoHechoDeInseguridad AS insecurityFactTypeId,
                        insecurityFactType.descripcionTHI AS IFTdescription,
                        COUNT(claim.idTipoHechoDeInseguridad) AS count
                    FROM
                        tipo_hecho_de_inseguridad AS insecurityFactType
                    LEFT JOIN
                        reclamo AS claim 
                            ON insecurityFactType.idTipoHechoDeInseguridad = claim.idTipoHechoDeInseguridad`;
        
        if ( Object.keys(req.query).length ) query = setAndGetFilterByDateRange(req.query, query);

        query = query + ` GROUP BY claim.idTipoHechoDeInseguridad`;

        const countInsecurityFactsGroupedByInsecurityFactTypeId = await sequelize.query(query, 
            { 
                replacements,
                type: QueryTypes.SELECT 
            }
        );

        let series = [];
        let labels = [];
        let totalRecords = 0;

        if ( countInsecurityFactsGroupedByInsecurityFactTypeId.length ) {
            series = getSeries(countInsecurityFactsGroupedByInsecurityFactTypeId);
            labels = getLabels(countInsecurityFactsGroupedByInsecurityFactTypeId);
            totalRecords = getTotalRecords(countInsecurityFactsGroupedByInsecurityFactTypeId);
        };
        
        return res.status(200).json({
            series,
            labels,
            totalRecords
        });
    } catch (error) {
        next(error);
    }
};


/**
 * Setea el filtro por fecha de creación y retorna la query con el filtro
 * @param {object} filter - Objeto con los filtros
 * @param {string} query - Query base
 * @returns {string} Query con el filtro
 */
const setAndGetFilterByDateRange = (filter, query) => {
    if ( filter.startDate && filter.endDate ) {
        if ( !validator.isDate(filter.startDate) || !validator.isDate(filter.endDate) ) {
            throw ApiError.badRequest('Formato de fecha inválido. Asegurese que coincida con el formato YYYY-MM-DD');
        };
        if ( new Date(filter.startDate) > new Date(filter.endDate) ) {
            throw ApiError.badRequest('La fecha de inicio debe ser menor a la fecha de fin');
        };

        query = query + ` WHERE claim.fechaHoraCreacion BETWEEN ? AND ?`;
        replacements.push(filter.startDate, filter.endDate);
    } else if ( filter.startDate ) {
        if ( !validator.isDate(filter.startDate) ) {
            throw ApiError.badRequest('Formato de fecha inválido. Asegurese que coincida con el formato YYYY-MM-DD');
        };

        query = query + ` WHERE claim.fechaHoraCreacion >= ?`;
        replacements.push(filter.startDate);
    } else if ( filter.endDate ) {
        if ( !validator.isDate(filter.endDate) ) {
            throw ApiError.badRequest('Formato de fecha inválido. Asegurese que coincida con el formato YYYY-MM-DD');
        };

        query = query + ` WHERE claim.fechaHoraCreacion <= ?`;
        replacements.push(filter.endDate);
    };

    return query;
};


/**
 * Crea y retorna el arreglo series con los datos para el gráfico
 * @param {object} data - Datos devueltos por la query
 * @returns {number[]} Arreglo con los datos para el gráfico
 */
const getSeries = (data) => {
    const series = [];
    data.forEach(element => {
        series.push(element.count);
    });
    return series;
};


/**
 * Crea y retorna el arreglo labels para el gráfico
 * @param {object} data - Datos devueltos por la query
 * @returns {string[]} Arreglo con los labels para el gráfico
 */
const getLabels = (data) => {
    const labels = [];
    data.forEach(element => {
        labels.push(element.IFTdescription);
    });
    return labels;
};


/**
 * Obtiene el total de registros
 * @param {object} data - Datos devueltos por la query
 * @returns {number} Cantidad total de registros
 */
const getTotalRecords = (data) => {
    let totalRecords = 0;
    data.forEach(element => {
        totalRecords += element.count;
    });
    return totalRecords;
};


// FIXME: BORRARME SI NO ME USAN
const setAndGetFilters = (filter) => {
    let whereInsecurityFactType = {};
    let whereClaimType = {};
    let whereClaimSubcategory = {};
    let whereDateTimeRange = {};

    // Si se quiere filtrar por tipo de hecho de inseguridad
    if ( filter.insecurityFactType ) {
        filter.insecurityFactType = filter.insecurityFactType.split(',');
        whereInsecurityFactType = {
            insecurityFactTypeId: filter.insecurityFactType
        };
    };

    // Si se quiere filtrar por tipo de reclamo
    if ( filter.claimType ) {
        filter.claimType = filter.claimType.split(',');
        whereClaimType = {
            claimTypeId: filter.claimType
        };
    };

    // Si se quiere filtrar por subcategoría de reclamo
    if ( filter.claimSubcategory ) {
        filter.claimSubcategory = filter.claimSubcategory.split(',');
        whereClaimSubcategory = {
            claimSubcategoryId: filter.claimSubcategory
        };
    };

    // Si se quiere filtrar por fecha de creación
    if ( filter.startDate && filter.endDate ) { // Si ingresa una fecha de inicio y una de fin
        if ( !validator.isDate(filter.startDate) || !validator.isDate(filter.endDate) ) {
            throw ApiError.badRequest('Formato de fecha inválido. Asegurese que coincida con el formato YYYY-MM-DD');
        };
        if ( new Date(filter.startDate) > new Date(filter.endDate) ) {
            throw ApiError.badRequest('La fecha de inicio debe ser menor a la fecha de fin');
        };

        whereDateTimeRange = {
            dateTimeCreation: {
                [Op.between]: [filter.startDate, filter.endDate]
            }
        };
    } else if ( filter.startDate ) { // Si sólo ingresa la fecha de inicio
        if ( !validator.isDate(filter.startDate) ) {
            throw ApiError.badRequest('Formato de fecha inválido. Asegurese que coincida con el formato YYYY-MM-DD');
        };

        whereDateTimeRange = {
            dateTimeCreation: {
                [Op.gte]: filter.startDate
            }
        };
    } else if ( filter.endDate ) { // Si sólo ingresa la fecha de fin
        if ( !validator.isDate(filter.endDate) ) {
            throw ApiError.badRequest('Formato de fecha inválido. Asegurese que coincida con el formato YYYY-MM-DD');
        };

        whereDateTimeRange = {
            dateTimeCreation: {
                [Op.lte]: filter.endDate
            }
        };
    };

    return {
        whereInsecurityFactType,
        whereClaimType,
        whereClaimSubcategory,
        whereDateTimeRange
    };
};


module.exports = {
    getReport
};