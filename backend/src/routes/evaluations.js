import express from 'express';
import { createEvaluation, getEvaluation, submitEvaluation, getMyAttempts } from '../controllers/evaluationController.js';
import { verifyToken, checkRole } from '../middlewares/auth.js';

const router = express.Router();

router.post('/modules/:moduleId/evaluations', verifyToken, checkRole('root', 'director'), createEvaluation);
router.get('/:evaluationId', verifyToken, getEvaluation);
router.post('/:evaluationId/submit', verifyToken, checkRole('estudiante'), submitEvaluation);
router.get('/:evaluationId/attempts', verifyToken, getMyAttempts);

export default router;