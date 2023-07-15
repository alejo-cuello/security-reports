const cloudinary = require('cloudinary').v2;
const fs = require('fs/promises');


const saveImage = async (image) => {
    const imageName = await saveImageInLocal(image);
    return await uploadImage(imageName);
};


const saveImageInLocal = async (file) => {
    try {
        const destination = './public/uploadedImages/';
        const newFileName = Date.now() + '.jpg';
        // FIXME: Si el nombre coincide en la url de la imagen, ver si puedo recuperarlo así le seteo la misma imagen
        console.log('FILENAME: ', newFileName);

        await fs.writeFile(destination + newFileName, file, 'base64').catch((error) => {
            throw error;
        });

        return newFileName;
    }
    catch(error) {
        throw error;
    }
}


const uploadImage = async (imageName) => {
    const options = {
        // use_filename: true,
        overwrite: true
    };

    const imagePath = `./public/uploadedImages/${imageName}`;
  
    try {
        // Upload the image
        const uploadedImage = await cloudinary.uploader.upload(imagePath, options);
        return uploadedImage.secure_url;
    } catch (error) {
        console.log('ERROR LA SUBIR IMAGEN:', error);
        throw error;
    }
}

module.exports = {
    saveImage
}