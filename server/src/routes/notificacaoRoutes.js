import express from 'express';
import { checkAuth } from '../middlewares/authMiddleware.js';
import * as notificacaoController from '../controllers/notificacaoController.js';

const router = express.Router();

router.get('/', checkAuth, notificacaoController.getNotificacoes);
router.get('/contador/nao-lidas', checkAuth, notificacaoController.getContadorNaoLidas);
router.put('/marcar-todas/lidas', checkAuth, notificacaoController.marcarTodasComoLidas);
router.put('/:id/lida', checkAuth, notificacaoController.marcarComoLida);

export default router;
