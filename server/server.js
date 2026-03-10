import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import db from './src/models/index.js';
import authRoutes from './src/routes/authRoutes.js';
import redacaoRoutes from './src/routes/redacaoRoutes.js';
import turmaRoutes from './src/routes/turmaRoutes.js';
import propostaRoutes from './src/routes/propostaRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const allowedOrigins = [
  'https://letraai.online',
  'https://www.letraai.online',
  'http://localhost:5173' 
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Bloqueado pela política de CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/redacoes', redacaoRoutes);
app.use('/api/turmas', turmaRoutes);
app.use('/api/propostas', propostaRoutes);

app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend LetrAI Online!' });
});

db.sequelize.sync({ alter: true }).then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
  });
}).catch((err) => {
    console.error("❌ Erro ao sincronizar banco de dados:", err);
});