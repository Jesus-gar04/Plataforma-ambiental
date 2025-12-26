import express from 'express';
import { 
  getAllCourses, getCourseById, createCourse, updateCourse, deleteCourse,
  createModule, getCourseModules, updateModule, deleteModule,
  createModuleContent, getModuleContents, enrollCourse, getMyCourses
} from '../controllers/courseController.js';
import { verifyToken, checkRole } from '../middlewares/auth.js';
import { uploadSingle, handleMulterError } from '../middlewares/upload.js';

const router = express.Router();

// Cursos
router.get('/', verifyToken, getAllCourses);
router.get('/my-courses', verifyToken, getMyCourses);
router.get('/:id', verifyToken, getCourseById);
router.post('/', verifyToken, checkRole('root', 'director'), createCourse);
router.put('/:id', verifyToken, checkRole('root', 'director'), updateCourse);
router.delete('/:id', verifyToken, checkRole('root'), deleteCourse);
router.post('/:courseId/enroll', verifyToken, checkRole('estudiante'), enrollCourse);

// Módulos
router.get('/:courseId/modules', verifyToken, getCourseModules);
router.post('/:courseId/modules', verifyToken, checkRole('root', 'director'), createModule);
router.put('/modules/:moduleId', verifyToken, checkRole('root', 'director'), updateModule);
router.delete('/modules/:moduleId', verifyToken, checkRole('root', 'director'), deleteModule);

// Contenidos
router.get('/modules/:moduleId/contents', verifyToken, getModuleContents);
router.post('/modules/:moduleId/contents', verifyToken, checkRole('root', 'director'), uploadSingle, handleMulterError, createModuleContent);

export default router;