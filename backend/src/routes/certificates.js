import express from 'express';
import { generateCertificate, verifyCertificate, getMyCertificates } from '../controllers/certificateController.js';
import { verifyToken } from '../middlewares/auth.js';

const router = express.Router();

router.post('/generate/:enrollmentId', verifyToken, generateCertificate);
router.get('/verify/:code', verifyCertificate);
router.get('/my-certificates', verifyToken, getMyCertificates);

export default router;