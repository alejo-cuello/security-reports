const axios = require('axios').default;
const ApiError = require('../utils/apiError');

const getAddress = async (req, res, next) => {
    try {

        const lat = req.params.lat;
        const lng = req.params.lng;

        if ( !req.params.lat || !req.params.lng ) {
            throw ApiError.badRequest('Missing parameters');
        };

        let endPoint = 'https://nominatim.openstreetmap.org/reverse?'
            + 'lat=' + lat
            + '&lon=' + lng
            + '&format=' +  'json';

        console.log(lat, lng)
        const response = await axios.get(endPoint);
        console.log('RES PA?', response.data)
        const data = {
            street: response.data.address.road,
            streetNumber: response.data.address.house_number
        }

        res.status(200).json(data);

    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAddress
}