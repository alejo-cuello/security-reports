/**
 * Valida que los campos obligatorios estén presentes en el body
 * @param {object} data - Objeto con los datos del body
 * @param {string[]} attrs - Array con los atributos obligatorios
 * @returns {string[]} Array con los atributos que faltan
*/
const checkMissingRequiredAttributes = (data, attrs) => {
    const missingAttrs = [];
    attrs.forEach( (attr) => {
        if ( !data[attr] ) {
            missingAttrs.push(attr);
        };
    });
    return missingAttrs;
};

module.exports = checkMissingRequiredAttributes;