import { Router } from 'express';
import { progressController } from '../controllers/progress.js';
import { asyncHandler } from '../middleware/error.js';

const router = Router();

router.get('/overview', asyncHandler(progressController.getProgressOverview));
router.get('/courses/:courseId', asyncHandler(progressController.getCourseProgress));
router.get('/lessons/:lessonId', asyncHandler(progressController.getLessonProgress));
router.post('/lessons/:lessonId', asyncHandler(progressController.updateLessonProgress));
router.get('/analytics', asyncHandler(progressController.getAnalytics));

export { router as progressRoutes };