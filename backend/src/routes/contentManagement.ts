import { Router } from 'express';
import { contentManagementController } from '../controllers/contentManagement.js';
import { asyncHandler } from '../middleware/error.js';

const router = Router();

// Content Sources Routes
router.get('/sources', asyncHandler(contentManagementController.getContentSources));
router.post('/sources', asyncHandler(contentManagementController.createContentSource));
router.put('/sources/:id', asyncHandler(contentManagementController.updateContentSource));

// Content Items Routes
router.get('/items', asyncHandler(contentManagementController.getContentItems));
router.get('/items/:id', asyncHandler(contentManagementController.getContentItem));
router.put('/items/:id', asyncHandler(contentManagementController.updateContentItem));
router.delete('/items/:id', asyncHandler(contentManagementController.deleteContentItem));

// Khan Academy Integration Routes
router.get('/khan-academy/topics', asyncHandler(contentManagementController.getKhanAcademyTopics));
router.post('/khan-academy/import', asyncHandler(contentManagementController.startKhanAcademyImport));
router.get('/khan-academy/import/:progressId', asyncHandler(contentManagementController.getImportProgress));
router.get('/khan-academy/imports', asyncHandler(contentManagementController.getAllImportProgress));

// Content Review Routes
router.get('/items/:contentId/reviews', asyncHandler(contentManagementController.getContentReviews));
router.post('/items/:contentId/reviews', asyncHandler(contentManagementController.createContentReview));
router.get('/reviews/pending', asyncHandler(contentManagementController.getPendingReviews));

// Curriculum Mapping Routes
router.get('/curriculum', asyncHandler(contentManagementController.getCurriculumMappings));
router.post('/curriculum', asyncHandler(contentManagementController.createCurriculumMapping));

// Analytics Routes
router.get('/stats', asyncHandler(contentManagementController.getContentStats));

// Bulk Operations Routes
router.post('/bulk/approve', asyncHandler(contentManagementController.bulkApproveContent));
router.post('/bulk/reject', asyncHandler(contentManagementController.bulkRejectContent));

// Export Routes
router.get('/export', asyncHandler(contentManagementController.exportContent));

export { router as contentManagementRoutes };