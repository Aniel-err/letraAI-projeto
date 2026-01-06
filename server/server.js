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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/redacoes', redacaoRoutes);
app.use('/api/turmas', turmaRoutes);

app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend rodando no servidor do Prof. Bruno!' });
});


app.use(express.static(path.join(__dirname, '../client/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

db.sequelize.sync({ alter: true }).then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse em: http://69.62.97.146:${PORT}`);
  });
}).catch((err) => {
    console.error("Erro ao sincronizar banco de dados:", err);
});