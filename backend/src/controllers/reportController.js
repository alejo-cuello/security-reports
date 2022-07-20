const models = require('../models');
const sequelize = require('../database/db-connection');
const { QueryTypes, Op } = require('sequelize');
const ApiError = require('../utils/apiError');
const getDataFromToken = require("../utils/getDataFromToken");
const ValidateAuthorization = require("../utils/validateAuthorization");
const validator = require('validator');


// Variables globales
let replacements = [];
// -----------------------------


// Devuelve un json con los datos preparados para hacer un // * GRÁFICO DE TORTA.
// Devuelve la cantidad de hechos de inseguridad agrupados por tipo de hecho de inseguridad.
// Además se pueden filtrar por un rango de fecha.
const getReportByInsecurityFactType = async (req, res, next) => {
    try {
        // Obtiene la información contenida en el token para poder usar el neighborId
        const dataFromToken = getDataFromToken(req.headers['authorization']);

        ValidateAuthorization.oneUserHasAuthorization(dataFromToken.municipalAgentId);

        replacements = [];
        let query = `SELECT 
                        insecurityFactType.idTipoHechoDeInseguridad AS insecurityFactTypeId,
                        insecurityFactType.descripcionTHI AS description,
                        COUNT(claim.idTipoHechoDeInseguridad) AS count
                    FROM
                        tipo_hecho_de_inseguridad AS insecurityFactType
                    LEFT JOIN
                        reclamo AS claim 
                            ON insecurityFactType.idTipoHechoDeInseguridad = claim.idTipoHechoDeInseguridad`;
        
        if ( Object.keys(req.query).length ) query = setAndGetFilterByDateRange(req.query, query);

        query = query + ` GROUP BY insecurityFactTypeId`
                      + ` ORDER BY insecurityFactTypeId ASC`;

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


// Devuelve un json con los datos preparados para hacer un // * GRÁFICO DE BARRAS.
// Devuelve la cantidad de reclamos agrupados por tipo de reclamo.
// Además se pueden filtrar por un rango de fecha.
const getReportByClaimType = async (req, res, next) => {
    try {
        // Obtiene la información contenida en el token para poder usar el neighborId
        const dataFromToken = getDataFromToken(req.headers['authorization']);

        ValidateAuthorization.oneUserHasAuthorization(dataFromToken.municipalAgentId);

        replacements = [];
        let query = `SELECT
                        tr.idTipoReclamo AS claimTypeId,
                        tr.descripcionTR AS description,
                        COUNT(claim.idSubcategoriaReclamo) AS count
                    FROM
                        tipo_reclamo AS tr
                    LEFT JOIN subcategoria_reclamo AS scr
                        ON tr.idTipoReclamo = scr.idTipoReclamo
                    LEFT JOIN reclamo AS claim
                        ON scr.idSubcategoriaReclamo = claim.idSubcategoriaReclamo`;
        
        if ( Object.keys(req.query).length ) query = setAndGetFilterByDateRange(req.query, query);

        query = query + ` GROUP BY claimTypeId`
                      + ` ORDER BY claimTypeId ASC`;

        const countClaimsGroupedByClaimTypeId = await sequelize.query(query, 
            { 
                replacements,
                type: QueryTypes.SELECT 
            }
        );

        let series = [];
        let categories = [];
        let totalRecords = 0;

        if ( countClaimsGroupedByClaimTypeId.length ) {
            series = getSeries(countClaimsGroupedByClaimTypeId);
            categories = getLabels(countClaimsGroupedByClaimTypeId);
            totalRecords = getTotalRecords(countClaimsGroupedByClaimTypeId);
        };
        
        return res.status(200).json({
            series,
            categories,
            totalRecords
        });
    } catch (error) {
        next(error);
    }
};


// Devuelve un json con los datos preparados para hacer un // * GRÁFICO DE BARRAS.
// Devuelve la cantidad de reclamos tomados por cada agente agrupados por agente.
// Además se pueden filtrar por un rango de fecha.
const getReportByMunicipalAgent = async (req, res, next) => {
    try {
        // Obtiene la información contenida en el token para poder usar el neighborId
        const dataFromToken = getDataFromToken(req.headers['authorization']);

        ValidateAuthorization.oneUserHasAuthorization(dataFromToken.municipalAgentId);

        replacements = [];
        let query = `SELECT 
                        am.idAgenteMunicipal AS municipalAgentId,
                        concat(am.nombre, ' ', am.apellido) AS description,
                        count(claim.idAgenteMunicipal) AS count
                    FROM agente_municipal AS am
                    LEFT JOIN reclamo AS claim
                        ON am.idAgenteMunicipal = claim.idAgenteMunicipal`;
        
        if ( Object.keys(req.query).length ) query = setAndGetFilterByDateRange(req.query, query);

        query = query + ` GROUP BY municipalAgentId`
                      + ` ORDER BY municipalAgentId ASC`;

        const countTakenClaimsGroupedByMunicipalAgent = await sequelize.query(query, 
            { 
                replacements,
                type: QueryTypes.SELECT 
            }
        );

        let series = [];
        let categories = [];
        let totalRecords = 0;

        if ( countTakenClaimsGroupedByMunicipalAgent.length ) {
            series = getSeries(countTakenClaimsGroupedByMunicipalAgent);
            categories = getLabels(countTakenClaimsGroupedByMunicipalAgent);
            totalRecords = getTotalRecords(countTakenClaimsGroupedByMunicipalAgent);
        };
        
        return res.status(200).json({
            series,
            categories,
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
        labels.push(element.description);
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


module.exports = {
    getReportByInsecurityFactType,
    getReportByClaimType,
    getReportByMunicipalAgent
};