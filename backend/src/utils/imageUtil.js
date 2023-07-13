const cloudinary = require('cloudinary').v2;


const saveImage = async (image) => {
    const options = {
        use_filename: true,
        unique_filename: true,
        overwrite: true
    };
  
    try {
        // Upload the image
        const result = await cloudinary.uploader.upload(image, options);
        return result.secure_url;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    saveImage
}