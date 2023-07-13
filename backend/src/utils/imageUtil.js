const cloudinary = require('cloudinary').v2;

function getImageName() {
    return Date.now() + '.jpg';
}

const saveImage = async (image) => {
    const options = {
        use_filename: true,
        // unique_filename: true,
        overwrite: true
    };

    const imageName = getImageName();
  
    try {
        // Upload the image
        const result = await cloudinary.uploader.upload(imageName, options);
        return result.secure_url;
    } catch (error) {
        console.log('ERROR LA SUBIR IMAGEN:', error);
        throw error;
    }
}

module.exports = {
    saveImage
}