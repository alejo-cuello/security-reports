const axios = require('axios').default;

const getSecurityInstitutions = async (req, res, next) => {
    try {
        const limit = req.query.limit || 6; // Si no se especifió un limite, se asigna 6 por defecto
        const offset = req.query.offset || 0; // Si no se especifió un offset, se asigna 0 por defecto
        const query = req.query.query || ""; // Si no se especifió un query, se asigna una cadena vacía por defecto

        // Trae los datos de las comisarías y centros de denuncias
        const response = await axios.get(`https://datosabiertos.rosario.gob.ar/api/action/datastore/search.json?resource_id=2b62f9d3-2d77-4c0a-a030-c237a0ee8aee&limit=${ limit }&offset=${ offset }&query=${ query }`);

        let institutions = response.data.result.records;
        const total = response.data.result.total;
        
        // Agrego este for para poder obtener las coordenadas en el front
        for(let institution of institutions) {
            if(institution.geojson) institution.geojson = JSON.parse(institution.geojson);
        }

        return res.status(200).json({
            institutions,
            total
        });
    } catch (error) {
        next(error);
    }
};


const getHealthInstitutions = async (req, res, next) => {
    try {
        const limit = req.query.limit || 6; // Si no se especifió un limite, se asigna 6 por defecto
        const offset = req.query.offset || 0; // Si no se especifió un offset, se asigna 0 por defecto
        const query = req.query.query || ""; // Si no se especifió un query, se asigna una cadena vacía por defecto
        
        // Trae los datos de los centros de salud
        const response = await axios.get(`https://datosabiertos.rosario.gob.ar/api/action/datastore/search.json?resource_id=7e14955e-8ef4-4ce8-a7d1-3bb19793f53a&limit=${ limit }&offset=${ offset }&query=${ query }`);

        const institutions = response.data.result.records;
        const total = response.data.result.total;

        // Agrego este for para poder obtener las coordenadas en el front
        for(let institution of institutions) {
            if(institution.geojson) institution.geojson = JSON.parse(institution.geojson);
        }

        return res.status(200).json({
            institutions,
            total
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getSecurityInstitutions,
    getHealthInstitutions
}