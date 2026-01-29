import { v2 as cloudinary } from 'cloudinary';

/**
 * Cloudinary Configuration
 * 
 * Centralizes Cloudinary API configuration to avoid duplication
 * across multiple files. All files should import this and use the
 * configured cloudinary instance.
 */
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
