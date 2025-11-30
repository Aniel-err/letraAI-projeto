import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import * as turmaController from '../controllers/turmaController.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', turmaController.createTurma);
router.get('/', turmaController.getMinhasTurmas);
router.get('/:id', turmaController.getTurmaById);

router.post('/:turmaId/alunos', turmaController.addAlunoToTurma);
router.delete('/:turmaId/alunos/:alunoId', turmaController.removeAlunoFromTurma);

export default router;