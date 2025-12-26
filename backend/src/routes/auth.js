import express from 'express';
import { register, login, getProfile, updateProfile, changePassword, verifyToken as verifyTokenController } from '../controllers/authController.js';
import { verifyToken } from '../middlewares/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);
router.post('/change-password', verifyToken, changePassword);
router.get('/verify', verifyToken, verifyTokenController);

export default router;