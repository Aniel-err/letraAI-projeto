import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// No Render, não precisamos do dotenv.config() se as variáveis estiverem no painel
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'letrai_redacoes',
    format: async (req, file) => 'png', 
    public_id: (req, file) => `redacao-${Date.now()}`,
  },
});

const upload = multer({ storage });
export default upload;