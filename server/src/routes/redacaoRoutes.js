import express from 'express';
import { checkAuth } from '../middlewares/authMiddleware.js'; // <--- CORREÇÃO AQUI
import * as redacaoController from '../controllers/redacaoController.js';
import upload from '../config/multer.js'; // Import do multer para upload de imagens

const router = express.Router();

// Todas as rotas de redação exigem login
router.get('/', checkAuth, redacaoController.getAllRedacoes);
router.get('/:id', checkAuth, redacaoController.getRedacaoById);

// Enviar redação com imagem
router.post('/upload', checkAuth, upload.single('imagem'), redacaoController.createRedacao);

// Editar imagem da redação
router.put('/:id/imagem', checkAuth, upload.single('imagem'), redacaoController.updateRedacaoImage);

// Rotas de professor/correção e exclusão
router.put('/:id/corrigir', checkAuth, redacaoController.corrigirRedacao);
router.delete('/:id', checkAuth, redacaoController.deleteRedacao);

export default router;