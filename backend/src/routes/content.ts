import { Router } from 'express';
import { contentController } from '../controllers/content.js';
import { asyncHandler } from '../middleware/error.js';

const router = Router();

router.get('/lessons/:id', asyncHandler(contentController.getLessonById));
router.post('/lessons/:id/complete', asyncHandler(contentController.markLessonComplete));
router.get('/videos/:id', asyncHandler(contentController.getVideoById));
router.post('/videos/:id/progress', asyncHandler(contentController.updateVideoProgress));
router.get('/resources/:id', asyncHandler(contentController.getResourceById));

export { router as contentRoutes };