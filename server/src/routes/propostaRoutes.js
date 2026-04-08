import express from 'express';
import { 
    createProposta, 
    getPropostasByTurma, 
    getPropostaById, 
    updateProposta, 
    deleteProposta 
} from '../controllers/propostaController.js';
import { checkAuth } from '../middlewares/authMiddleware.js'; 

const router = express.Router();

router.use(checkAuth);

router.post('/', createProposta);

router.get('/turma/:turmaId', getPropostasByTurma);

router.get('/:id', getPropostaById);

router.put('/:id', updateProposta);


router.delete('/:id', deleteProposta);

export default router;