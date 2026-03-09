import express from 'express';
import { checkAuth } from '../middlewares/authMiddleware.js'; 
import * as redacaoController from '../controllers/redacaoController.js';
import upload from '../config/multer.js'; 

const router = express.Router();

router.get('/', checkAuth, redacaoController.getAllRedacoes);
router.get('/:id', checkAuth, redacaoController.getRedacaoById);

router.post('/upload', checkAuth, upload.single('imagem'), redacaoController.createRedacao);

router.put('/:id/imagem', checkAuth, upload.single('imagem'), redacaoController.updateRedacaoImage);


router.put('/:id/corrigir', checkAuth, upload.single('imagem'), redacaoController.corrigirRedacao);
router.delete('/:id', checkAuth, redacaoController.deleteRedacao);

router.put('/:id/solicitar-reenvio', checkAuth, redacaoController.solicitarReenvio);
router.put('/:id/autorizar-reenvio', checkAuth, redacaoController.autorizarReenvio);
export default router;

