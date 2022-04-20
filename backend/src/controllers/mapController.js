const axios = require('axios').default;
const ApiError = require('../utils/apiError');

const getAddress = async (req, res, next) => {
    try {
        if ( !req.params.lat || !req.params.lng ) {
            throw ApiError.badRequest('Faltan parámetros');
        };
        
        const lat = req.params.lat;
        const lng = req.params.lng;

        let endPoint = 'https://nominatim.openstreetmap.org/reverse?'
            + 'lat=' + lat
            + '&lon=' + lng
            + '&format=' +  'json';

        const response = await axios.get(endPoint);

        if ( !response ) {
            throw ApiError.badRequest('No se pudo obtener la dirección');
        };

        const data = {
            street: response.data.address.road,
            streetNumber: response.data.address.house_number
        };

        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAddress
}