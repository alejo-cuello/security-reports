const models = require('../models');
const ApiError = require('../utils/apiError');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const validator = require('validator');
const sequelize = require('../database/db-connection');
const { sendEmail, getEmailTemplate } = require('../config/email-config');

const NEIGHBOR = 'neighbor';
const MUNICIPAL_AGENT = 'municipalAgent';


const login = async (req, res, next) => {
    try {        
        if ( !req.body.email || !req.body.password ) {
            throw ApiError.badRequest('Email and password are required');
        };

        if ( !validator.isEmail(req.body.email)  ) {
            throw ApiError.badRequest('Invalid email');
        };
        
        const user = await getUser(req.body);
        
        // if ( ! await userCredentialsAreValid(user, req.body) ) { 
        //     throw ApiError.badRequest('Invalid credentials');
        // };

        // if ( ! await isEmailVerified(req.body) ) {
        //     throw ApiError.badRequest('Email is not verified. Please check your mailbox');
        // };

        if ( req.body.role === NEIGHBOR ) {

            if ( ! await userCredentialsAreValid(user, req.body) ) { 
                throw ApiError.badRequest('Invalid credentials');
            };
    
            if ( ! await isEmailVerified(req.body) ) {
                throw ApiError.badRequest('Email is not verified. Please check your mailbox');
            };
            
            req.body.neighborId = user.neighborId;
        };
        
        if ( req.body.role === MUNICIPAL_AGENT ) {
            req.body.municipalAgentId = user.municipalAgentId;
        };

        // Genera y devuelve el token
        const token = await generateAndGetToken(req.body);

        return res.json({
            token
        });
    } catch (error) {
        next(error);
    }
};


const signup = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        // Valida que los campos obligatorios estén completos
        if ( !requiredFieldsAreCompleted(req.body) ) {
            throw ApiError.badRequest('Missing data. Please, fill all the fields');
        };
        
        // Verifica que los términos y condiciones estén aceptados
        if ( !req.body.termsAndConditionsAccepted ) {
            throw ApiError.badRequest('You must accept the terms and conditions');
        };

        if ( !validator.isNumeric(req.body.dni) ) {
            throw ApiError.badRequest('DNI must be contains only numbers');
        };

        if ( !validator.isNumeric(req.body.tramiteNumberDNI) ) {
            throw ApiError.badRequest('tramiteNumberDNI must be contains only numbers');
        };

        if ( !validator.isEmail(req.body.email)  ) {
            throw ApiError.badRequest('Invalid email');
        };

        const emailExists = await models.Neighbor.findOne({
            where: {
                email: req.body.email
            }
        });

        // Verifica que el email que ingresó no esté usado
        if ( emailExists ) {
            throw ApiError.badRequest('Email already exists');
        };

        const dniExists = await models.Neighbor.findOne({
            where: {
                dni: req.body.dni
            }
        });

        // Verifica que el dni que ingresó no esté usado
        if ( dniExists ) {
            throw ApiError.badRequest('An account with that dni already exists');
        };

        // Encripta la contraseña y la devuelve hasheada
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
            message: 'Account created successfully. Please check your mailbox'
        });
    } catch (error) {
        await transaction.rollback();
        next(error);
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
            throw ApiError.notFound('User with that email not found');
        };

        if ( neighborToUpdate.emailIsVerified ) {
            throw ApiError.badRequest('Email is already verified');
        };

        // Actualizar el neighbor con el email confirmado
        await models.Neighbor.update({
            emailIsVerified: 1
        }, { 
            where: {
                email: data.email
        }, transaction });

        await transaction.commit();

        return res.status(200).json({
            message: 'Email confirmed successfully'
        });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};


/**
 * Valida que los campos obligatorios estén completos
*/
const requiredFieldsAreCompleted = (body) => {
    if ( body.dni && 
         body.tramiteNumberDNI && 
         body.firstName && 
         body.lastName && 
         body.street && 
         body.streetNumber && 
         body.city && 
         body.province && 
         body.email && 
         body.password ) {
       return true;
   } else {
       return false;
   };
};


/**
 * @param {object} userData - Object with the user data
 * @return {Promise<object>} Promise with the user model
*/
const getUser = async (userData) => {
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

        return user;
    } catch (error) {
        throw error;
    };
};

/**
 * Validate that the user credentials are correct
 * @param {Model<any>} user - Neighbor or MunicipalAgent model
 * @param {object} userData - Object with the user data
 * @return {Promise<boolean>} Promise with the result of the validation
*/
const userCredentialsAreValid = async (user, userData) => {
    try {
        if ( user ) { // Si existe el usuario, verifica que la password coincida con la guardada y que pertenezcan a ese usuario
            const match = await bcrypt.compare(userData.password, user.password);
            return match; // Retorna true si las credenciales son correctas
                          // Retorna false si las credenciales son incorrectas
        } else {  // Si no existe el usuario, lanza un error de credenciales inválidas
            return false;
        };
    } catch (error) {
        throw error;
    }
};


/**
 * Validate that the email is verified before logging in
 * @param {object} userData - Object with the user data
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
 * @param {object} payload - Object with the data to generate the token
*/
const generateAndGetToken = (payload) => {
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
 * @param {string} token - Token to validate
*/
const getTokenData = async (token) => {
    try {
        let data = null;
        jwt.verify(token, process.env.TOKEN_KEY, (err, decoded) => {
            if ( err ) {
                throw new Error(err);
            };
            data = decoded;
        });
        return data;
    } catch (error) {
        throw error;
    }
};


/**
 * Encrypt password and return it hashed
 * @param {string} password - Password to encrypt
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
    login,
    signup,
    confirmEmail
}