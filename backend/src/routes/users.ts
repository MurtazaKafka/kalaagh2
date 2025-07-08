import { Router } from 'express';
import { userController } from '../controllers/users.js';
import { asyncHandler } from '../middleware/error.js';

const router = Router();

router.get('/profile', asyncHandler(userController.getProfile));
router.put('/profile', asyncHandler(userController.updateProfile));
router.delete('/profile', asyncHandler(userController.deleteProfile));
router.get('/progress', asyncHandler(userController.getUserProgress));
router.get('/certificates', asyncHandler(userController.getUserCertificates));

export { router as userRoutes };