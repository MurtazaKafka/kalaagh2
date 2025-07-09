import { Router } from 'express';
import { userController } from '../controllers/users.js';
import { asyncHandler } from '../middleware/error.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All user routes require authentication
router.use(authenticate);

router.get('/profile', asyncHandler(userController.getProfile));
router.put('/profile', asyncHandler(userController.updateProfile));
router.delete('/profile', asyncHandler(userController.deleteProfile));
router.get('/progress', asyncHandler(userController.getUserProgress));
router.get('/certificates', asyncHandler(userController.getUserCertificates));

export { router as userRoutes };