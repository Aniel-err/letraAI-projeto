import express from 'express';
import { checkAuth } from '../middlewares/authMiddleware.js'; 
import * as authController from '../controllers/authController.js';
import upload from '../config/multer.js'; 

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

router.get('/me', checkAuth, authController.getMe);

router.put('/profile', checkAuth, upload.single('avatar'), authController.updateProfile);

export default router;