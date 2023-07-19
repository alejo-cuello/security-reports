const cloudinary = require('cloudinary').v2;
const fs = require('fs/promises');


const saveImage = async (image, previousImage = null) => {
    try {
        let imageName = '';
        if (previousImage) {    //El nombre de la imagen previa debo obtenerlo indpendientemente de si hay nueva imagen o no
            console.log('hay imagen previa?', previousImage)
            imageName = getImageName(previousImage);
        }

        if (image) {
            console.log('hay imagen?', image)
            imageName = await saveImageInLocal(image, imageName);
            return await uploadImage(imageName);
        }
        else {  //Si no habia imagen previa, solo hay que borrar la imagen anterior, no sobreescribirla
            //Le puse que devuelva un null directamente
            return await deleteImage(imageName);
        }
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
        // const destination = './public/uploadedImages/';
        const newFileName = imageName || Date.now() + '.jpg';

        // await fs.writeFile(destination + newFileName, file, 'base64').catch((error) => {
        //     throw error;
        // });

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


const deleteImage = async (imageName) => {
    try {
        cloudinary.uploader.destroy(imageName,{resource_type: 'image'},(error, result) => {
            if (error) {
                console.error('Error al borrar la imagen:', error);
                return null;
            } else {
                console.log('Imagen borrada con éxito:', result);
                return null;
            }
          });
    } catch (error) {
        console.error('Error al eliminar imagen en cloudinary:', error);
        throw error;
    }
}

module.exports = {
    saveImage
}