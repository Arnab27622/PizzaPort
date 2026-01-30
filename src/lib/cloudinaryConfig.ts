/**
 * This file configures Cloudinary, which is a service used to store
 * and manage images for our application.
 */

import { v2 as cloudinary } from 'cloudinary';

/**
 * Cloudinary Configuration
 * 
 * We set up our account details here using environment variables.
 * This way, we only have to configure it once and can use it anywhere in the app.
 */
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Your Cloudinary account name
    api_key: process.env.CLOUDINARY_API_KEY,      // Your unique API key
    api_secret: process.env.CLOUDINARY_API_SECRET, // Your secret key (keep this private!)
});

export default cloudinary;

