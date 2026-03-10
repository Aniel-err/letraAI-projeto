import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("--- DEBUG CLOUDINARY ---");
console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME ? "Sim" : "NÃO");
console.log("API Key:", process.env.CLOUDINARY_API_KEY ? "Sim" : "NÃO");
console.log("API Secret:", process.env.CLOUDINARY_API_SECRET ? "Sim" : "NÃO"); // Adicione esta linha!

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'letrai_uploads',
      format: 'png',
      public_id: `redacao-${Date.now()}-${Math.round(Math.random() * 1E9)}`
    };
  },
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Apenas imagens (JPG, PNG) são permitidas!'), false);
    }
  }
});

export default upload;