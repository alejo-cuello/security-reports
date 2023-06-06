const ApiError = require('./apiError');

const nonEditableAttributesArray = ['neighborId', 'dni', 'email', 'password', 'emailIsVerified', 'municipalAgentId', 'registrationNumber'];

/**
 * Función que permite comparar los atributos de un modelo con un array de atributos que no se pueden editar.
 * @param {String[]} attributes - Array de atributos que se desea verificar si son editables o no.
 */
const checkNonEditableAttributes = (attributes) => {
    const nonEditableAttributes = attributes.filter(attribute => nonEditableAttributesArray.includes(attribute));
    if ( nonEditableAttributes.length > 0 ) {
        throw ApiError.badRequest(`Los siguientes atributos no pueden ser editados: ${nonEditableAttributes.join(', ')}`);
    };
    return;
};

module.exports = checkNonEditableAttributes;