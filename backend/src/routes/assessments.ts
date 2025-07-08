import { Router } from 'express';
import { assessmentController } from '../controllers/assessments.js';
import { asyncHandler } from '../middleware/error.js';

const router = Router();

router.get('/:id', asyncHandler(assessmentController.getAssessmentById));
router.post('/:id/submit', asyncHandler(assessmentController.submitAssessment));
router.get('/:id/results', asyncHandler(assessmentController.getAssessmentResults));
router.get('/course/:courseId', asyncHandler(assessmentController.getCourseAssessments));

export { router as assessmentRoutes };