const ApiError = require('../utils/apiError');

class ValidateAuthorization {

    static oneUserHasAuthorization(id) {
        if ( !id ) {
            throw ApiError.forbidden(`No tienes permisos para acceder a este recurso`);
        };
    };

    static bothUsersHaveAuthorization(id1, id2) {
        if ( !id1 && !id2 ) {
            throw ApiError.forbidden(`No tienes permisos para acceder a este recurso`);
        };
    };

}

module.exports = ValidateAuthorization;