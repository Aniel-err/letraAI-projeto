const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const turmaController = require('../controllers/turmaController');

router.use(authMiddleware);

router.post('/', turmaController.createTurma);
router.get('/', turmaController.getMinhasTurmas);
router.get('/:id', turmaController.getTurmaById);

router.post('/:turmaId/alunos', turmaController.addAlunoToTurma);
router.delete('/:turmaId/alunos/:alunoId', turmaController.removeAlunoFromTurma);

module.exports = router;