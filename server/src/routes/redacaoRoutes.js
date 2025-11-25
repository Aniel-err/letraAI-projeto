const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware'); 
const upload = require('../config/multer'); // Certifique-se que multer.js está na pasta src/config
const redacaoController = require('../controllers/redacaoController');

router.post('/upload', authMiddleware, upload.single('imagem'), redacaoController.uploadRedacao);
router.get('/', authMiddleware, redacaoController.getRedacoes);
router.get('/:id', authMiddleware, redacaoController.getRedacaoById);
router.put('/:id/corrigir', authMiddleware, redacaoController.corrigirRedacao);

module.exports = router;