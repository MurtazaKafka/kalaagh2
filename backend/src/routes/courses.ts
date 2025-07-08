import { Router } from 'express';
import { courseController } from '../controllers/courses.js';
import { asyncHandler } from '../middleware/error.js';

const router = Router();

router.get('/', asyncHandler(courseController.getAllCourses));
router.get('/search', asyncHandler(courseController.searchCourses));
router.get('/categories', asyncHandler(courseController.getCategories));
router.get('/:id', asyncHandler(courseController.getCourseById));
router.post('/:id/enroll', asyncHandler(courseController.enrollInCourse));
router.delete('/:id/unenroll', asyncHandler(courseController.unenrollFromCourse));
router.get('/:id/lessons', asyncHandler(courseController.getCourseLessons));
router.get('/:id/progress', asyncHandler(courseController.getCourseProgress));

export { router as courseRoutes };