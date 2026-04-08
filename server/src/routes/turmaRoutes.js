import express from 'express';
import { checkAuth } from '../middlewares/authMiddleware.js'; 
import * as turmaController from '../controllers/turmaController.js';

const router = express.Router();

router.post('/', checkAuth, turmaController.createTurma);
router.get('/', checkAuth, turmaController.getMinhasTurmas);
router.get('/:id', checkAuth, turmaController.getTurmaById);
router.put('/:id', checkAuth, turmaController.updateTurma);
router.delete('/:id', checkAuth, turmaController.deleteTurma);

router.post('/solicitar', checkAuth, turmaController.solicitarEntrada);
router.post('/aprovar', checkAuth, turmaController.tratarSolicitacao);
router.post('/:id/alunos', checkAuth, turmaController.addAlunoToTurma);

export default router;