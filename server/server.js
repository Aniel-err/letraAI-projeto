const express = require('express');
const cors = require('cors');
const db = require('./src/models');
const path = require('path'); 

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


const authRoutes = require('./src/routes/authRoutes');
const redacaoRoutes = require('./src/routes/redacaoRoutes');
const turmaRoutes = require('./src/routes/turmaRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/redacoes', redacaoRoutes);
app.use('/api/turmas', turmaRoutes); 

app.get('/api/test', (req, res) => {
  res.json({ message: 'Olá! O Backend está funcionando!' });
});

db.sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}).catch(err => {
  console.error('Erro ao conectar com o banco de dados:', err);
});