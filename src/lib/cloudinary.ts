import { v2 as cloudinary } from 'cloudinary';

// Configuration Cloudinary
const config = {
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dwobmx6zy',
  api_key: process.env.CLOUDINARY_API_KEY || '825178941816529',
  api_secret: process.env.CLOUDINARY_API_SECRET || '7JHtq74fqCsUBSj7uau9h2e5xvI',
  secure: true,
};

console.log('🔧 Configuration Cloudinary chargée:', {
  cloud_name: config.cloud_name,
  api_key: config.api_key ? `${config.api_key.substring(0, 6)}...` : 'MANQUANT',
  api_secret: config.api_secret ? 'OK' : 'MANQUANT'
});

cloudinary.config(config);

export default cloudinary;