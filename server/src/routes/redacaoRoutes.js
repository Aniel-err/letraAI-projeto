import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import upload from '../config/multer.js';
import * as redacaoController from '../controllers/redacaoController.js';

const router = express.Router();

router.post('/upload', authMiddleware, upload.single('imagem'), redacaoController.uploadRedacao);

router.get('/', authMiddleware, redacaoController.getRedacoes);

router.get('/:id', authMiddleware, redacaoController.getRedacaoById);

router.put('/:id/corrigir', authMiddleware, redacaoController.corrigirRedacao);

export default router;