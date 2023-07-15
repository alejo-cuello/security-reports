const cloudinary = require('cloudinary').v2;
const fs = require('fs/promises');


const saveImage = async (image, previousImage = null) => {
    try {
        let imageName = '';
        console.log('IMAGE PARAM: ', image);
        console.log('IMAGE PARAM typeof: ', typeof image);
        console.log('PREVIOUS IMAGE PARAM: ', previousImage);
        if (image) {
            if (previousImage) {
                console.log('PREVIOUS IMAGE EXISTE');
                imageName = getImageName(previousImage)
            }
            console.log('IMAGENAME: ', imageName);
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