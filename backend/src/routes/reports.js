import express from 'express';
import { getGeneralStats, getCourseStats, getInstitutionReport } from '../controllers/reportController.js';
import { verifyToken, checkRole } from '../middlewares/auth.js';

const router = express.Router();

router.get('/stats', verifyToken, checkRole('root', 'director'), getGeneralStats);
router.get('/courses/:courseId/stats', verifyToken, checkRole('root', 'director', 'profesor'), getCourseStats);
router.get('/institutions/:institutionId/report', verifyToken, checkRole('root', 'director'), getInstitutionReport);

export default router;