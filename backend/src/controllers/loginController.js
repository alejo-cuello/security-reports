const models = require('../models');
const ApiError = require('../utils/apiError');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const validator = require('validator');
const sequelize = require('../database/db-connection');
const { sendEmail, getEmailTemplate } = require('../config/email-config');

const NEIGHBOR = 'neighbor';
const MUNICIPAL_AGENT = 'municipalAgent';


const verifyToken = (req, res, next) => {
    try {
        const bearerHeader = req.headers['authorization'];
        
        if (typeof bearerHeader === 'undefined') {
            throw new Error('No token provided. You must login first');
        };

        const bearerToken = bearerHeader.split(' ')[1];

        jwt.verify(bearerToken, process.env.TOKEN_KEY, (err) => {
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
        if ( !req.body.email || !req.body.password ) {
            throw new Error('Email and password are required');
        };

        if ( !validator.isEmail(req.body.email)  ) {
            throw new Error('Invalid email');
        };
        
        if ( ! await userCredentialsAreValid(req.body) ) { 
            throw new Error('Invalid credentials');
        };

        if ( ! await isEmailVerified(req.body) ) {
            throw new Error('Email is not verified. Please check your mailbox');
        };

        // Genera y devuelve el token
        const token = await generateAndGetToken(req.body);

        return res.json({
            token
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
             !req.body.password ||
             !req.body.termsAndConditionsAccepted ) {
            throw new Error('Missing data. Please, fill all the fields');
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

        const emailExists = await models.Neighbor.findOne({
            where: {
                email: req.body.email
            }
        });

        if ( emailExists ) { // Verifica que el email que intenta registrar no esté usado
            throw new Error('Email already exists');
        };

        const dniExists = await models.Neighbor.findOne({
            where: {
                dni: req.body.dni
            }
        });

        if ( dniExists ) {
            throw new Error('An account with that dni already exists');
        };

        if ( req.body.termsAndConditionsAccepted === "false" ) {
            throw new Error('You must accept the terms and conditions');
        };

        // Encripta la contraseña y la duelve hasheada
        const hash = await encryptAndGetPassword(req.body.password);

        req.body.password = hash;

        await models.Neighbor.create(req.body, { transaction });

        // Genera y devuelve el token
        const token = await generateAndGetToken({ email: req.body.email });

        // Obtener el template para el email
        const emailTemplate = getEmailTemplate(req.body.firstName, token);

        // Envía un correo al nuevo usuario para confirmar el email
        await sendEmail(req.body.email, 'Confirme su correo electrónico', emailTemplate);
        
        await transaction.commit();

        return res.status(201).json({
            message: 'Account created successfully'
        });

    } catch (error) {
        await transaction.rollback();
        next(ApiError.badRequest(error.message));
    }
};


const confirmEmail = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        // Obtener los datos del token
        const data = await getTokenData(req.params.token);
        
        // Verifica que el usuario con el email a confirmar exista y que ya no haya sido confirmado
        const neighborToUpdate = await models.Neighbor.findOne({
            where: {
                email: data.email
            }
        });

        if ( !neighborToUpdate ) {
            throw new Error('User with that email not found');
        };

        if ( neighborToUpdate.emailIsVerified ) {
            throw new Error('Email is already verified');
        };

        // Actualizar el neighbor con el email confirmado
        const updatedNeighbor = await models.Neighbor.update({
            emailIsVerified: 1
        }, { 
            where: {
                email: data.email
        }, transaction });

        if ( updatedNeighbor === 0 ) {
            throw new Error('Email not found');
        };

        await transaction.commit();

        return res.status(200).json({
            message: 'Email confirmed successfully'
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
    try {
        let user = null;
        if ( userData.role === NEIGHBOR ) { // Si es un vecino quien quiere ingresar, se valida que exista en la tabla Vecino
            user = await models.Neighbor.findOne({
                where: {
                    email: userData.email
                }
            });
        };
        
        if ( userData.role === MUNICIPAL_AGENT ) { // Si es un agente municipal quien quiere ingresar, se valida que exista en la tabla AgenteMunicipal
            user = await models.MunicipalAgent.findOne({
                where: {
                    email: userData.email,
                }
            });
        };

        if ( user ) {
            const match = await bcrypt.compare(userData.password, user.password);
            return match; // Retorna 'true' si las contraseñas coinciden
                          // Retorna 'false' si las contraseñas no coinciden
        } else {
            return false;
        };
    } catch (error) {
        throw error;
    };
};

/**
* Validate that the email is verified before logging in
*/
const isEmailVerified = async (userData) => {
    try {
        let user = null;
        if ( userData.role === NEIGHBOR ) {
            user = await models.Neighbor.findOne({
                attributes: ['emailIsVerified'],
                where: {
                    email: userData.email
                }
            });
        };

        if ( userData.role === MUNICIPAL_AGENT ) {
            user = await models.MunicipalAgent.findOne({
                attributes: ['emailIsVerified'],
                where: {
                    email: userData.email
                }
            });
        };

        if ( user.emailIsVerified ) {
            return true;
        } else {
            return false;
        };
    } catch (error) {
        throw error;
    };
};

/**
 * Generate token and return it
*/
const generateAndGetToken = ( payload ) => {
    return new Promise( (resolve, reject) => {
        jwt.sign(payload, process.env.TOKEN_KEY, { expiresIn: '1h' }, (err, token) => {
            if ( err ) {
                reject(err);
            } else {
                resolve(token);
            }
        });
    });
};

/**
 * Validate token and return its data 
*/
const getTokenData = async (token) => {
    let data = null;
    jwt.verify(token, process.env.TOKEN_KEY, (err, decoded) => {
        if ( err ) {
            throw new Error(err);
        };
        data = decoded;
    });
    return data;
};

/**
 * Encrypt password and return it hashed
*/
const encryptAndGetPassword = (password) => {
    return new Promise( (resolve, reject) => {
        const saltRounds = 10;
        bcrypt.genSalt(saltRounds, (err, salt) => {
            if ( err ) {
                reject(err);
            } else {
                bcrypt.hash(password, salt, (err, hash) => {
                    if ( err ) {
                        reject(err);
                    } else {
                        resolve(hash);
                    };
                });
            };
        });
    });
};


module.exports = {
    verifyToken,
    login,
    signup,
    confirmEmail
}