import { Router } from 'express';
import { integrationController } from '../controllers/integrationController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { validateRequest } from '../middleware/validateRequest';
import { body, query } from 'express-validator';

const router = Router();

// Sync all content sources (admin only)
router.post(
  '/sync',
  authenticate,
  authorize(['admin', 'content_manager']),
  validateRequest([
    query('gradeLevel').optional().isString(),
    query('subject').optional().isString(),
    query('programme').optional().isIn(['PYP', 'MYP', 'DP'])
  ]),
  integrationController.syncAllContent
);

// Get sync statistics
router.get(
  '/statistics',
  authenticate,
  integrationController.getSyncStatistics
);

// Search across all platforms
router.get(
  '/search',
  validateRequest([
    query('query').optional().isString(),
    query('subject').optional().isString(),
    query('gradeLevel').optional().isString(),
    query('contentType').optional().isIn(['video', 'article', 'interactive', 'exercise']),
    query('language').optional().isIn(['en', 'fa', 'ps'])
  ]),
  integrationController.searchContent
);

// Download content for offline use
router.post(
  '/download/:contentId',
  authenticate,
  validateRequest([
    body('quality').optional().isIn(['high', 'medium', 'low', 'ultra_low', 'audio_only'])
  ]),
  integrationController.downloadForOffline
);

// Get download queue status
router.get(
  '/downloads/status',
  authenticate,
  integrationController.getDownloadStatus
);

// Request content translation
router.post(
  '/translate/:contentId',
  authenticate,
  validateRequest([
    body('targetLanguage').isIn(['fa', 'ps']),
    body('translationType').isIn(['title', 'description', 'transcript'])
  ]),
  integrationController.requestTranslation
);

// Get cultural adaptation review
router.get(
  '/cultural-review/:contentId',
  authenticate,
  integrationController.getCulturalReview
);

// Get bandwidth recommendations
router.get(
  '/bandwidth/recommendations',
  authenticate,
  integrationController.getBandwidthRecommendations
);

// Get license compliance report (admin only)
router.get(
  '/license/compliance',
  authenticate,
  authorize(['admin']),
  integrationController.getLicenseCompliance
);

// Generate attribution page
router.get(
  '/attributions',
  validateRequest([
    query('format').optional().isIn(['html', 'markdown', 'json'])
  ]),
  integrationController.generateAttributions
);

// Setup LTI integration (admin only)
router.post(
  '/lti/setup',
  authenticate,
  authorize(['admin']),
  validateRequest([
    body('platform').isIn(['code.org']),
    body('consumerKey').isString().notEmpty(),
    body('sharedSecret').isString().notEmpty(),
    body('schoolId').isString().notEmpty()
  ]),
  integrationController.setupLTI
);

export { router as integrationRoutes };