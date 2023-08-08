const axios = require('axios').default;

const getBase64FromUrl = async (req, res, next) => {
    try {
        const response = await axios.get(req.query.imageUrl, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(response.data, 'binary');
        const base64Image = imageBuffer.toString('base64');
        return res.status(200).json({base64Image});
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getBase64FromUrl
};