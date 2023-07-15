const cloudinary = require('cloudinary').v2;
const fs = require('fs/promises');


const saveImage = async (image, previousImage = null) => {
    try {
        let imageName = '';
        if (image) {
            if (previousImage) {
                imageName = getImageName(previousImage)
            }
            imageName = await saveImageInLocal(image, imageName);
            return await uploadImage(imageName);
        }
        return imageName;
    } catch (error) {
        throw error;
    }
}


const getImageName = (image) => {
    const imageUrlPartsArray = image.split('/');
    return imageUrlPartsArray[imageUrlPartsArray.length - 1];
}


const saveImageInLocal = async (file, imageName = null) => {
    try {
        const destination = './public/uploadedImages/';
        const newFileName = imageName || Date.now() + '.jpg';

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
        overwrite: true
    };

    const imagePath = `./public/uploadedImages/${imageName}`;
  
    try {
        // Upload the image
        const uploadedImage = await cloudinary.uploader.upload(imagePath, options);
        return uploadedImage.secure_url;
    } catch (error) {
        console.error('Error al subir la imagen a cloudinary:', error);
        throw error;
    }
}

module.exports = {
    saveImage
}