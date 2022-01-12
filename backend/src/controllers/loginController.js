const models = require('../models');
const ApiError = require('../utils/apiError');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const validator = require('validator');
const sequelize = require('../database/db-connection');


const verifyToken = (req, res, next) => {
    try {
        if ( req.originalUrl === '/login' || req.originalUrl === '/signup' ) { // Si es una petición de login o de registro de nuevo usuario, no se valida el token
            next(); // // Ejecuta el la función login
            return;
        };

        const bearerHeader = req.headers['authorization'];
        
        if (typeof bearerHeader === 'undefined') {
            throw new Error('No token provided. You must login first');
        };

        const bearerToken = bearerHeader.split(' ')[1];

        jwt.verify(bearerToken, process.env.KEY, (err) => {
            if (err) {
                throw new Error('Invalid token');
            };
            next();
        });
    } catch (error) {
        next(ApiError.forbidden(error.message));
    }
};


const login = async (req, res, next) => {
    try {
        if ( req.originalUrl === '/signup' ) {
            next(); // Ejecuta el la función signup
            return;
        };
        
        if ( !req.body.email || !req.body.password ) {
            throw new Error('Email and password are required');
        };

        if ( !validator.isEmail(req.body.email)  ) {
            throw new Error('Invalid email');
        };
        
        if ( ! await userCredentialsAreValid(req.body) ) { 
            throw new Error('Invalid credentials');
        };

        jwt.sign(req.body, process.env.KEY, { expiresIn: '1h' }, (err, token) => {
            res.json({
                token: token
            });
        });

    } catch (error) {
        next(ApiError.badRequest(error.message));
    }
};


const signup = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        if ( !req.body.dni || 
             !req.body.tramiteNumberDNI || 
             !req.body.firstName || 
             !req.body.lastName || 
             !req.body.street || 
             !req.body.streetNumber || 
             !req.body.city || 
             !req.body.province || 
             !req.body.email || 
             !req.body.password ) {
            throw new Error('Missing data');
        };

        if ( !validator.isNumeric(req.body.dni) ) {
            throw new Error('DNI must be contains only numbers');
        };

        if ( !validator.isNumeric(req.body.tramiteNumberDNI) ) {
            throw new Error('tramiteNumberDNI must be contains only numbers');
        };

        if ( !validator.isEmail(req.body.email)  ) {
            throw new Error('Invalid email');
        };

        const saltRounds = 10;
        const salt = bcrypt.genSaltSync(saltRounds);
        const hash = bcrypt.hashSync(req.body.password, salt);

        req.body.password = hash;

        await models.Neighbor.create(req.body, { transaction });
        
        await transaction.commit();

        return res.status(201).json({
            message: 'Neighbor created successfully'
        });

    } catch (error) {
        await transaction.rollback();
        next(ApiError.badRequest(error.message));
    }
};


/**
* Validate that the email, password and user type (neighbor or municipalAgent) are correct
*/
const userCredentialsAreValid = async (userData) => {
    const NEIGHBOR = 'neighbor';
    const MUNICIPAL_AGENT = 'municipalAgent';
    try {
        if ( userData.role === NEIGHBOR ) { // Si es un vecino quien quiere ingresar, se valida que exista en la tabla Vecino

            const neighbor = await models.Neighbor.findOne({
                where: {
                    email: userData.email
                }
            });

            if ( neighbor ) {
                const match = await bcrypt.compare(userData.password, neighbor.password);
                return match; // Retorna 'true' si las contraseñas coinciden
                              // Retorna 'false' si las contraseñas no coinciden
            } else {
                return false;
            }
        };
        
        if ( userData.role === MUNICIPAL_AGENT ) { // Si es un agente municipal quien quiere ingresar, se valida que exista en la tabla AgenteMunicipal

            const municipalAgent = await models.MunicipalAgent.findOne({
                where: {
                    email: userData.email,
                }
            });

            if ( municipalAgent ) {
                const match = await bcrypt.compare(userData.password, municipalAgent.password);
                return match; // Retorna 'true' si las contraseñas coinciden
                              // Retorna 'false' si las contraseñas no coinciden
            } else {
                return false;
            }
        }
    } catch (error) {
        next(ApiError(error.message));
    }
}

module.exports = {
    verifyToken,
    login,
    signup
}