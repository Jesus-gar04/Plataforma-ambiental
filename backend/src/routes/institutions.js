import express from 'express';
import { getAllInstitutions, createInstitution, createStudent, getInstitutionStudents, updateStudent } from '../controllers/institutionController.js';
import { verifyToken, checkRole } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', verifyToken, checkRole('root', 'director'), getAllInstitutions);
router.post('/', verifyToken, checkRole('root'), createInstitution);
router.post('/:institutionId/students', verifyToken, checkRole('root', 'director'), createStudent);
router.get('/:institutionId/students', verifyToken, checkRole('root', 'director', 'profesor'), getInstitutionStudents);
router.put('/students/:studentId', verifyToken, checkRole('root', 'director'), updateStudent);

export default router;