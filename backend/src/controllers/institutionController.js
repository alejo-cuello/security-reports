const axios = require('axios').default;

const getSecurityInstitutions = async (req, res, next) => {
    try {
        const limit = req.query.limit || 6; // Si no se especifió un limite, se asigna 6 por defecto
        const offset = req.query.offset || 0; // Si no se especifió un offset, se asigna 0 por defecto
        const query = req.query.query || ""; // Si no se especifió un query, se asigna una cadena vacía por defecto

        // Trae los datos de las comisarías y centros de denuncias
        const response = await axios.get(`https://datosabiertos.rosario.gob.ar/api/1/datastore/query/7b66561a-29e3-527b-ba2f-7901236f4ffb`);

        let institutions = [];
        let total = 0;
        if (response.data.results) {
            if (query !== '') {
                institutions = response.data.results.filter((result) => {
                    return result.name.toLowerCase().includes(query.toLowerCase());
                })
            } else {
                institutions = response.data.results;
            }
            total = institutions.length;
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
        const response = await axios.get(`https://datosabiertos.rosario.gob.ar/api/1/datastore/query/78e9b54a-5063-563f-88f8-81c1a30e7df5`);

        let institutions = [];
        let total = 0;
        if (response.data.results) {
            if (query !== '') {
                institutions = response.data.results.filter((result) => {
                    return result.name.toLowerCase().includes(query.toLowerCase());
                })
            } else {
                institutions = response.data.results;
            }
            total = institutions.length;
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