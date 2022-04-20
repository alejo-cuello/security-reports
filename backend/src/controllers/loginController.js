const models = require('../models');
const path = require('path');
const ApiError = require('../utils/apiError');
const checkMissingRequiredAttributes = require('../utils/checkMissingRequiredAttributes');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const validator = require('validator');
const sequelize = require('../database/db-connection');
const { sendEmail, getEmailTemplate } = require('../config/emailConfig');

const NEIGHBOR = 'neighbor';
const MUNICIPAL_AGENT = 'municipalAgent';


const login = async (req, res, next) => {
    try {
        const missingAttributes = checkMissingRequiredAttributes(req.body, ['email', 'password']);
        if ( missingAttributes.length > 0 ) {
            throw ApiError.badRequest('El email y la contraseña son obligatorios');
        };

        if ( !validator.isEmail(req.body.email) ) {
            throw ApiError.badRequest('El formato del email es inválido');
        };
        
        const user = await getUserByEmail(req.body);

        if ( ! await userCredentialsAreValid(user, req.body) ) {
            throw ApiError.unauthorized('Credenciales inválidas');
        };

        if ( ! await isEmailVerified(req.body) ) {
            throw ApiError.badRequest('El email no está verificado. Por favor verifique su casilla de correo electrónico');
        };

        if ( req.body.role === NEIGHBOR ) {
            req.body.neighborId = user.neighborId;
        };
        
        if ( req.body.role === MUNICIPAL_AGENT ) {
            req.body.municipalAgentId = user.municipalAgentId;
        };

        // Encripta la contraseña y la devuelve hasheada
        const hashedPassword = await encryptAndGetPassword(req.body.password);

        req.body.password = hashedPassword;

        // Genera y devuelve el token
        const token = await generateAndGetToken(req.body);

        const responseUser = userWithoutPassword(user);

        let neighborContacts = [];
        if(responseUser.neighborId) {
            neighborContacts = await models.Contact.findAll({
                where: {
                    neighborId: responseUser.neighborId
                }
            });
        }

        return res.status(200).json({
            token,
            user: responseUser,
            neighborContacts
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
            throw ApiError.badRequest('Faltan datos obligatorios. Por favor, complete todos los campos');
        };
        
        // Verifica que los términos y condiciones estén aceptados
        if ( !req.body.termsAndConditionsAccepted ) {
            throw ApiError.badRequest('Debes aceptar los términos y condiciones');
        };

        // Verifica que el formato del email sea correcto
        if ( !validator.isEmail(req.body.email) ) {
            throw ApiError.badRequest('El formato del email es inválido');
        };

        if ( req.body.role === NEIGHBOR ) {
            if ( !validator.isNumeric(req.body.dni) ) {
                throw ApiError.badRequest('El DNI debe contener sólo números');
            };
    
            if ( !validator.isNumeric(req.body.tramiteNumberDNI) ) {
                throw ApiError.badRequest('El número de trámite del DNI debe contener sólo números');
            };

            const dniExists = await models.Neighbor.findOne({
                where: {
                    dni: req.body.dni
                }
            });

            // Verifica que el dni que ingresó no esté usado
            if ( dniExists ) {
                throw ApiError.badRequest('El DNI ya está registrado');
            };
        };

        if ( req.body.role === MUNICIPAL_AGENT ) {
            const registrationNumberExists = await models.MunicipalAgent.findOne({
                where: {
                    registrationNumber: req.body.registrationNumber
                }
            });

            // Verifica que el legajo que ingresó no esté usado
            if ( registrationNumberExists ) {
                throw ApiError.badRequest('El legajo ya está registrado');
            };
        };

        const emailExists = await getUserByEmail(req.body);

        // Verifica que el email que ingresó no esté usado
        if ( emailExists ) {
            throw ApiError.badRequest('El email ya está registrado');
        };

        // Encripta la contraseña y la devuelve hasheada
        const hash = await encryptAndGetPassword(req.body.password);

        req.body.password = hash;

        await createAccount(req.body, transaction);

        // Genera y devuelve el token
        const token = await generateAndGetToken({ email: req.body.email, role: req.body.role });

        // Obtener el template para el email
        const emailTemplate = getEmailTemplate(req.body.firstName, token);

        if ( req.body.role === NEIGHBOR ) {
            // Envía un correo al nuevo usuario para confirmar el email
            await sendEmail(req.body.email, 'Confirme su correo electrónico', emailTemplate);
        };

        if ( req.body.role === MUNICIPAL_AGENT ) {
            // Envía un correo a un mail predeterminado para notificar el registro de un nuevo agente municipal
            await sendEmail('agentemunicipal.proyecto@gmail.com', 'Confirme su correo electrónico', emailTemplate);
        };

        await transaction.commit();

        return res.status(201).json({
            message: 'Cuenta creada correctamente. Por favor, verifique su casilla de correo electrónico'
        });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};


const confirmEmail = async (req, res, next) => {
    try {
        // Obtener los datos del token
        const data = await getTokenData(req.params.token);

        const user = await getUserByEmail(data);

        // Verifica que el usuario con el email a confirmar exista
        if ( !user ) {
            return res.sendFile(path.join(__dirname, '../../public/emailNotFound.html'));
        };

        // Verifica que el usuario no tenga ya una cuenta activa
        if ( user.emailIsVerified ) {
            return res.sendFile(path.join(__dirname, '../../public/emailAlreadyVerified.html'));
        };
        
        const transaction = await sequelize.transaction();

        // Actualiza el email como verificado
        await updateConfirmedEmail(data, transaction);

        await transaction.commit();

        return res.sendFile(path.join(__dirname, '../../public/emailConfirmedSuccessfully.html'));
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};


/**
 * Valida que los campos obligatorios estén completos
 * @param {object} body - Datos de registro del usuario
 * @returns {boolean} True si los campos obligatorios están completos, false si no
*/
const requiredFieldsAreCompleted = (body) => {
    if ( body.role === NEIGHBOR ) {
        const missingAttributes = checkMissingRequiredAttributes(body, ['dni', 'tramiteNumberDNI', 'firstName', 'lastName', 'street', 'streetNumber', 'city', 'province', 'email', 'password']);
        return (missingAttributes.length > 0) ? false : true;
    };

    if ( body.role === MUNICIPAL_AGENT ) {
        const missingAttributes = checkMissingRequiredAttributes(body, ['registrationNumber', 'firstName', 'lastName', 'email', 'password']);
        return (missingAttributes.length > 0) ? false : true;
    };
};

/**
 * Devuelve los datos del usuario sin la password 
 * @param {object} user - Datos del usuario
 * @returns {object} Datos del usuario sin la password
*/
const userWithoutPassword = (user) => {
    const newUser = {};

    if ( user.neighborId ) {
        newUser.neighborId = user.neighborId;
        newUser.dni = user.dni;
        newUser.tramiteNumberDNI = user.tramiteNumberDNI;
        newUser.street = user.street;
        newUser.streetNumber = user.streetNumber;
        newUser.floor = user.floor;
        newUser.apartment = user.apartment;
        newUser.city = user.city;
        newUser.province = user.province;
        newUser.phoneNumber = user.phoneNumber;
    };

    if ( user.municipalAgentId ) {
        newUser.municipalAgentId = user.municipalAgentId;
        newUser.registrationNumber = user.registrationNumber;
    };

    newUser.firstName = user.firstName;
    newUser.lastName = user.lastName;
    newUser.email = user.email;

    return newUser;
};


/**
 * @param {object} userData - Object with the user data
 * @return {Promise<object>|null} Promise with the user model or null if not found
*/
const getUserByEmail = async (userData) => {
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
                    email: userData.email
                }
            });
        };

        return user;
    } catch (error) {
        throw error;
    };
};


/**
 * Genera un nuevo registro en la BD para un vecino o agente municipal según corresponda 
 * @param {object} userData - Objeto con los datos del usuario
 * @param {Transaction} transaction - Transacción para el insert en la base de datos
*/
const createAccount = async (userData, transaction) => {
    try {
        if ( userData.role === NEIGHBOR ) {
            await models.Neighbor.create(userData, { transaction });
        };

        if ( userData.role === MUNICIPAL_AGENT ) {
            await models.MunicipalAgent.create(userData, { transaction });
        };
    } catch (error) {
        throw error;
    }
};


/**
 * Función para actualizar el campo emailIsVerified de un usuario para que se pueda loguear
 * @param {object} data - Objeto con los datos del token (contiene email y role)
 * @param {Transaction} transaction - Transacción para el update en la base de datos
*/
const updateConfirmedEmail = async (data, transaction) => {
    try {
        if ( data.role === NEIGHBOR ) {
            // Actualizar el vecino con el email confirmado
            await models.Neighbor.update({
                emailIsVerified: 1
            }, { 
                where: {
                    email: data.email
            }, transaction });
        };
        
        if ( data.role === MUNICIPAL_AGENT ) {
            // Actualizar el agente municipal con el email confirmado
            await models.MunicipalAgent.update({
                emailIsVerified: 1
            }, { 
                where: {
                    email: data.email
            }, transaction });
        };
    } catch (error) {
        throw error;
    }
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
 * @return {Promise<boolean>} Promise with the result of the validation
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
 * @return {Promise<string>} Promise with the token
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
 * @return {Promise<object>} Promise with the token data
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
 * @return {Promise<string>} Promise with the password hashed
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