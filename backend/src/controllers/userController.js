const models = require('../models');
const path = require('path');
const ApiError = require('../utils/apiError');
const checkMissingRequiredAttributes = require('../utils/checkMissingRequiredAttributes');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const validator = require('validator');
const sequelize = require('../database/db-connection');
const { sendEmail, getEmailTemplateSignup, getEmailTemplateChangePassword } = require('../config/emailConfig');
const getDataFromToken = require('../utils/getDataFromToken');
const ValidateAuthorization = require('../utils/validateAuthorization');
const checkNonEditableAttributes = require('../utils/checkNonEditableAttributes');
const { Op } = require("sequelize");

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
        // const hashedPassword = await encryptAndGetPassword(req.body.password);

        // req.body.password = hashedPassword;

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
        const emailTemplate = getEmailTemplateSignup(req.body.firstName, token);

        if ( req.body.role === NEIGHBOR && !req.body.facebookId && !req.body.googleId ) {
            // Envía un correo al nuevo usuario para confirmar el email
            await sendEmail(req.body.email, 'Confirme su correo electrónico', emailTemplate);
        };

        if ( req.body.role === MUNICIPAL_AGENT ) {
            // Envía un correo a un mail predeterminado para notificar el registro de un nuevo agente municipal
            await sendEmail(process.env.EMAIL_MUNICIPAL_AGENT, 'Confirme su correo electrónico', emailTemplate);
        };

        await transaction.commit();

        // Cuando te registras con redes sociales, te loguea automáticamente
        let registerWithSocialMedia = null;
        if( req.body.role === NEIGHBOR && ( req.body.facebookId || req.body.googleId ) ) {
            
            let body = {
                email: req.body.email,
                role: req.body.role
            }

            if(req.body.facebookId) {
                body.facebookId = req.body.facebookId;
            }
            else if(req.body.googleId) {
                body.googleId = req.body.googleId;
            }

            registerWithSocialMedia = await loginWithSocialMedia(body);
        }

        return res.status(201).json({
            message: 'Cuenta creada correctamente. Por favor, verifique su casilla de correo electrónico',
            registerWithSocialMedia
        });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};


const changePassword = async (req, res, next) => {
    try {
        const missingAttributes = checkMissingRequiredAttributes(req.body, ['email', 'role', 'newPassword', 'confirmNewPassword']);
        if ( missingAttributes.length > 0 ) {
            throw ApiError.badRequest('Faltan datos obligatorios. Por favor complete todos los campos');
        };

        if ( !validator.isEmail(req.body.email) ) {
            throw ApiError.badRequest('El formato del email es inválido');
        };

        if ( req.body.newPassword !== req.body.confirmNewPassword ) {
            throw ApiError.badRequest('Las contraseñas no coinciden');
        };

        const user = await getUserByEmail(req.body);

        if ( !user ) {
            throw ApiError.notFound('No hay una cuenta registrada con ese email');
        };

        // Encripta la contraseña y la devuelve hasheada
        const hashedPassword = await encryptAndGetPassword(req.body.newPassword);

        // Genera y devuelve el token
        const token = await generateAndGetToken({ email: req.body.email, newPassword: hashedPassword, role: req.body.role });

        // Obtener el template para el email
        const emailTemplate = getEmailTemplateChangePassword(user.firstName, token);

        // Envía un correo al usuario para confirmar el cambio de contraseña
        await sendEmail(req.body.email, 'Cambio de contraseña', emailTemplate);

        res.status(200).json({
            message: 'Por favor verifique su casilla de correo electrónico para confirmar el cambio de contraseña'
        });
    } catch (error) {
        next(error);
    }
};


const confirmEmailChangePassword = async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
        // Obtener los datos del token
        const data = await getTokenData(req.params.token);

        const user = await getUserByEmail(data);

        // Verifica que el usuario con el email a confirmar exista
        if ( !user ) {
            await transaction.rollback();
            return res.sendFile(path.join(__dirname, '../../public/emailNotFound.html'));
        };

        await updatePassword(data, transaction);

        await transaction.commit();

        return res.sendFile(path.join(__dirname, '../../public/passwordChangedSuccessfully.html'));
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};


const confirmEmailSignup = async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
        // Obtener los datos del token
        const data = await getTokenData(req.params.token);

        const user = await getUserByEmail(data);

        // Verifica que el usuario con el email a confirmar exista
        if ( !user ) {
            await transaction.rollback();
            return res.sendFile(path.join(__dirname, '../../public/emailNotFound.html'));
        };

        // Verifica que el usuario no tenga ya una cuenta activa
        if ( user.emailIsVerified ) {
            await transaction.rollback();
            return res.sendFile(path.join(__dirname, '../../public/emailAlreadyVerified.html'));
        };
        
        // Actualiza el email como verificado
        await updateConfirmedEmail(data, transaction);

        await transaction.commit();

        return res.sendFile(path.join(__dirname, '../../public/emailConfirmedSuccessfully.html'));
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};


const editProfileData = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        // Obtiene la información contenida en el token para poder usar el neighborId
        const dataFromToken = getDataFromToken(req.headers['authorization']);

        ValidateAuthorization.bothUsersHaveAuthorization(dataFromToken.neighborId, dataFromToken.municipalAgentId);
        
        let updatedUserData;

        if ( dataFromToken.neighborId ) {
            // Verifica que el usuario al que se quiere editar los datos, sea el mismo al que está loggeado
            if ( req.params.userId != dataFromToken.neighborId ) {
                throw ApiError.forbidden('No puedes editar este perfil');
            };
            
            // Verifica que en el body no manden un atributo que no se puede editar
            checkNonEditableAttributes(Object.keys(req.body));

            await models.Neighbor.update(req.body, {
                where: {
                    neighborId: dataFromToken.neighborId
                },
                transaction
            });
            
            await transaction.commit();

            const user = await models.Neighbor.findByPk(dataFromToken.neighborId);
            updatedUserData = userWithoutPassword(user);
        };

        if ( dataFromToken.municipalAgentId ) {
            // Verifica que el usuario al que se quiere editar los datos, sea el mismo al que está loggeado
            if ( req.params.userId != dataFromToken.municipalAgentId ) {
                throw ApiError.forbidden('No puedes editar este perfil');
            };
            
            // Verifica que en el body no manden un atributo que no se puede editar
            checkNonEditableAttributes(Object.keys(req.body));

            await models.MunicipalAgent.update(req.body, {
                where: {
                    municipalAgentId: dataFromToken.municipalAgentId
                },
                transaction
            });
            
            await transaction.commit();

            const user = await models.MunicipalAgent.findByPk(dataFromToken.municipalAgentId);
            updatedUserData = userWithoutPassword(user);
        };

        return res.status(200).json(updatedUserData);
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};


const loginWithFacebook = async (req, res, next) => {
    
    try {
        const missingAttributes = checkMissingRequiredAttributes(req.body, ['email', 'facebookId']);
        if ( missingAttributes.length > 0 ) {
            throw ApiError.badRequest('Faltan el email o el facebookId');
        };

        const response = await loginWithSocialMedia(req.body);

        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};


const loginWithGoogle = async (req, res, next) => {

    try {
        const missingAttributes = checkMissingRequiredAttributes(req.body, ['email', 'googleId']);
        if ( missingAttributes.length > 0 ) {
            throw ApiError.badRequest('Faltan el email o el googleId');
        };

        const response = await loginWithSocialMedia(req.body);

        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};


const loginWithSocialMedia = async (data) => {
    const email = data.email;

    try {
        if ( !validator.isEmail(email) ) {
            throw ApiError.badRequest('El formato del email es inválido');
        };

        let user;
        let otherUser;

        if (data.facebookId) {
            user = await searchUserByFacebookId(data.facebookId, email);
            otherUser = await validateDuplicateEmailFacebook(data.googleId, email);
        } else if (data.googleId) {
            user = await searchUserByGoogleId(data.googleId, email);
            otherUser = await validateDuplicateEmailGoogle(data.googleId, email);
        }

        if (otherUser) {
            throw ApiError.badRequest('Este email ya ha sido utilizado');
        }

        if (!user) {
            return {
                user: null
            };
        };

        // Genera y devuelve el token
        data.neighborId = user.neighborId;
        const token = await generateAndGetToken(data);

        const responseUser = userWithoutPassword(user);

        let neighborContacts = [];
        if (responseUser.neighborId) {
            neighborContacts = await models.Contact.findAll({
                where: {
                    neighborId: responseUser.neighborId
                }
            });
        };

        return {
            token,
            user: responseUser,
            neighborContacts
        };
    } catch (error) {
        throw error;
    }
};


/**
 * 
 * @param {object} userData - Datos del usuario
 * @param {Transaction} transaction - Transacción para el update en la base de datos
*/
const updatePassword = async (userData, transaction) => {
    try {
        if (userData.role === NEIGHBOR) {
            await models.Neighbor.update({
                password: userData.newPassword
            },
            { 
                where: {
                    email: userData.email
            }, transaction });
        };

        if (userData.role === MUNICIPAL_AGENT) {
            await models.MunicipalAgent.update({
                password: userData.newPassword
            },
            { 
                where: {
                    email: userData.email
            }, transaction });
        };
    } catch (error) {
        throw error;
    }
};


/**
 * Valida que los campos obligatorios estén completos
 * @param {object} body - Datos de registro del usuario
 * @returns {boolean} True si los campos obligatorios están completos, false si no
*/
const requiredFieldsAreCompleted = (body) => {
    if ( body.role === NEIGHBOR ) {
        const missingAttributes = checkMissingRequiredAttributes(body, ['dni', 'firstName', 'lastName', 'street', 'streetNumber', 'city', 'province', 'email', 'password']);
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
        newUser.street = user.street;
        newUser.streetNumber = user.streetNumber;
        newUser.floor = user.floor;
        newUser.apartment = user.apartment;
        newUser.city = user.city;
        newUser.province = user.province;
        newUser.phoneNumber = user.phoneNumber;
        newUser.facebookId = user.facebookId;
        newUser.googleId = user.googleId;
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


/**
 * Search a neighbor by its Facebook ID.
 * @param {string} facebookId 
 * @param {string} email 
 */
const searchUserByFacebookId = async (facebookId, email) => {
    return await models.Neighbor.findOne({
        attributes: {
            exclude: ["password", "emailIsVerified"]
        },
        where: {
            facebookId: facebookId,
            email: email
        }
    });
};


/**
 * Search a neighbor by its email and different Facebook ID.
 * @param {string} facebookId 
 * @param {string} email 
 */
const validateDuplicateEmailFacebook = async (facebookId, email) => {
    return await models.Neighbor.findOne({
        attributes: {
            exclude: ["password", "emailIsVerified"]
        },
        where: {
            [Op.and]: [
                { email: email },
                {
                    [Op.or]: [
                        { facebookId: { [Op.is]: null } },
                        { facebookId: { [Op.notLike]: facebookId } }
                    ]
                }

            ]
        }
    });
};


/**
 * Search a neighbor by its Google ID.
 * @param {string} googleId 
 * @param {string} email 
 */
const searchUserByGoogleId = async (googleId, email) => {
    return await models.Neighbor.findOne({
        attributes: {
            exclude: ["password", "emailIsVerified"]
        },
        where: {
            googleId: googleId,
            email: email
        }
    });
};


/**
 * Search a neighbor by its email and different Google ID.
 * @param {string} googleId 
 * @param {string} email 
 */
const validateDuplicateEmailGoogle = async (googleId, email) => {
    return await models.Neighbor.findOne({
        attributes: {
            exclude: ["password", "emailIsVerified"]
        },
        where: {
            [Op.and]: [
                { email: email },
                {
                    [Op.or]: [
                        { googleId: { [Op.is]: null } },
                        { googleId: { [Op.notLike]: googleId } }
                    ]
                }

            ]
        }
    });
};


module.exports = {
    login,
    signup,
    changePassword,
    confirmEmailSignup,
    confirmEmailChangePassword,
    editProfileData,
    loginWithFacebook,
    loginWithGoogle
}