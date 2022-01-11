class ApiError {
    constructor(statusCode, message) {
        this.statusCode = statusCode;
        this.message = message;
    }

    static badRequest(message) {
        return new ApiError(400, message);
    }

    static notFound(message) {
        return new ApiError(404, message);
    }

    static internalError(message) {
        return new ApiError(500, message);
    }
}

module.exports = ApiError;