import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ContentModel } from '../models/Content.js';
import { KhanAcademyService } from '../services/KhanAcademyService.js';
import { asyncHandler } from '../middleware/error.js';
import { logger } from '../utils/logger.js';

// Initialize services (this would normally be done via dependency injection)
let contentModel: ContentModel;
let khanAcademyService: KhanAcademyService;

// Initialize services when database is available
export const initializeContentServices = (db: any) => {
  contentModel = new ContentModel(db);
  khanAcademyService = new KhanAcademyService(contentModel);
};

export const contentManagementController = {
  // Content Sources Management
  getContentSources: asyncHandler(async (req: Request, res: Response) => {
    const sources = await contentModel.getContentSources();
    res.json({
      success: true,
      data: sources
    });
  }),

  createContentSource: asyncHandler(async (req: Request, res: Response) => {
    const { name, baseUrl, apiKey } = req.body;
    
    const source = await contentModel.createContentSource({
      name,
      baseUrl,
      apiKey,
      isActive: true,
      totalContent: 0,
      importedContent: 0
    });

    res.status(201).json({
      success: true,
      data: source
    });
  }),

  updateContentSource: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body;
    
    const source = await contentModel.updateContentSource(id, updates);
    
    res.json({
      success: true,
      data: source
    });
  }),

  // Content Items Management
  getContentItems: asyncHandler(async (req: Request, res: Response) => {
    const {
      sourceId,
      subjectId,
      gradeLevel,
      contentType,
      isProcessed,
      isApproved,
      page = 1,
      limit = 50,
      search
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    let result;
    
    if (search) {
      // Use search functionality
      const items = await contentModel.searchContent(search as string, {
        subjectId: subjectId as string,
        gradeLevel: gradeLevel as string,
        contentType: contentType as string,
        limit: Number(limit)
      });
      
      result = {
        items,
        total: items.length
      };
    } else {
      // Use filter functionality
      result = await contentModel.getContentItems({
        sourceId: sourceId as string,
        subjectId: subjectId as string,
        gradeLevel: gradeLevel as string,
        contentType: contentType as string,
        isProcessed: isProcessed ? isProcessed === 'true' : undefined,
        isApproved: isApproved ? isApproved === 'true' : undefined,
        limit: Number(limit),
        offset
      });
    }

    res.json({
      success: true,
      data: result.items,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: result.total,
        pages: Math.ceil(result.total / Number(limit))
      }
    });
  }),

  getContentItem: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const content = await contentModel.getContentItem(id);
    
    if (!content) {
      return res.status(404).json({
        success: false,
        error: 'Content item not found'
      });
    }

    res.json({
      success: true,
      data: content
    });
  }),

  updateContentItem: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body;
    
    const content = await contentModel.updateContentItem(id, updates);
    
    res.json({
      success: true,
      data: content
    });
  }),

  deleteContentItem: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    await contentModel.deleteContentItem(id);
    
    res.json({
      success: true,
      message: 'Content item deleted successfully'
    });
  }),

  // Khan Academy Integration
  getKhanAcademyTopics: asyncHandler(async (req: Request, res: Response) => {
    const { subject } = req.query;
    
    try {
      let topics;
      if (subject) {
        topics = await khanAcademyService.getTopicsBySubject(subject as string);
      } else {
        topics = await khanAcademyService.getTopicTree();
      }
      
      res.json({
        success: true,
        data: topics
      });
    } catch (error) {
      logger.error('Failed to fetch Khan Academy topics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch Khan Academy content'
      });
    }
  }),

  startKhanAcademyImport: asyncHandler(async (req: Request, res: Response) => {
    const { subjectSlug, subjectId } = req.body;
    
    if (!subjectSlug || !subjectId) {
      return res.status(400).json({
        success: false,
        error: 'Subject slug and subject ID are required'
      });
    }

    try {
      const progressId = uuidv4();
      await khanAcademyService.startBulkImport(subjectSlug, subjectId, progressId);
      
      res.json({
        success: true,
        data: {
          progressId,
          message: 'Import started successfully'
        }
      });
    } catch (error) {
      logger.error('Failed to start Khan Academy import:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to start import process'
      });
    }
  }),

  getImportProgress: asyncHandler(async (req: Request, res: Response) => {
    const { progressId } = req.params;
    
    const progress = khanAcademyService.getImportProgress(progressId);
    
    if (!progress) {
      return res.status(404).json({
        success: false,
        error: 'Import progress not found'
      });
    }

    res.json({
      success: true,
      data: progress
    });
  }),

  getAllImportProgress: asyncHandler(async (req: Request, res: Response) => {
    const activeImports = khanAcademyService.getActiveImports();
    
    res.json({
      success: true,
      data: activeImports
    });
  }),

  // Content Review System
  getContentReviews: asyncHandler(async (req: Request, res: Response) => {
    const { contentId } = req.params;
    const reviews = await contentModel.getContentReviews(contentId);
    
    res.json({
      success: true,
      data: reviews
    });
  }),

  createContentReview: asyncHandler(async (req: Request, res: Response) => {
    const { contentId } = req.params;
    const {
      status,
      qualityScore,
      educationalValue,
      culturalAppropriateness,
      technicalQuality,
      notes,
      suggestions
    } = req.body;
    
    // TODO: Get reviewer ID from authenticated user
    const reviewerId = req.user?.id || 'admin-user-id';
    
    const review = await contentModel.createContentReview({
      contentId,
      reviewerId,
      status,
      qualityScore,
      educationalValue,
      culturalAppropriateness,
      technicalQuality,
      notes,
      suggestions,
      reviewedAt: new Date()
    });

    // Update content item based on review
    if (status === 'approved') {
      await contentModel.updateContentItem(contentId, {
        isApproved: true,
        isProcessed: true,
        qualityScore
      });
    } else if (status === 'rejected') {
      await contentModel.updateContentItem(contentId, {
        isApproved: false,
        isProcessed: true,
        qualityScore
      });
    }

    res.status(201).json({
      success: true,
      data: review
    });
  }),

  getPendingReviews: asyncHandler(async (req: Request, res: Response) => {
    const reviews = await contentModel.getPendingReviews();
    
    res.json({
      success: true,
      data: reviews
    });
  }),

  // Curriculum Mapping
  getCurriculumMappings: asyncHandler(async (req: Request, res: Response) => {
    const { subjectId, gradeLevel, unit } = req.query;
    
    const mappings = await contentModel.getCurriculumMappings({
      subjectId: subjectId as string,
      gradeLevel: gradeLevel as string,
      unit: unit as string
    });
    
    res.json({
      success: true,
      data: mappings
    });
  }),

  createCurriculumMapping: asyncHandler(async (req: Request, res: Response) => {
    const {
      contentId,
      subjectId,
      gradeLevel,
      unit,
      chapter,
      lesson,
      orderInSequence,
      isCore,
      estimatedTimeHours,
      prerequisites,
      learningOutcomes
    } = req.body;
    
    const mapping = await contentModel.createCurriculumMapping({
      contentId,
      subjectId,
      gradeLevel,
      unit,
      chapter,
      lesson,
      orderInSequence,
      isCore,
      estimatedTimeHours,
      prerequisites,
      learningOutcomes
    });
    
    res.status(201).json({
      success: true,
      data: mapping
    });
  }),

  // Analytics and Statistics
  getContentStats: asyncHandler(async (req: Request, res: Response) => {
    const stats = await contentModel.getContentStats();
    
    res.json({
      success: true,
      data: stats
    });
  }),

  // Bulk Operations
  bulkApproveContent: asyncHandler(async (req: Request, res: Response) => {
    const { contentIds } = req.body;
    
    if (!Array.isArray(contentIds) || contentIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Content IDs array is required'
      });
    }

    const results = [];
    for (const contentId of contentIds) {
      try {
        const content = await contentModel.updateContentItem(contentId, {
          isApproved: true,
          isProcessed: true
        });
        results.push({ contentId, success: true, content });
      } catch (error) {
        results.push({ contentId, success: false, error: error.message });
      }
    }
    
    res.json({
      success: true,
      data: results
    });
  }),

  bulkRejectContent: asyncHandler(async (req: Request, res: Response) => {
    const { contentIds, reason } = req.body;
    
    if (!Array.isArray(contentIds) || contentIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Content IDs array is required'
      });
    }

    const results = [];
    for (const contentId of contentIds) {
      try {
        const content = await contentModel.updateContentItem(contentId, {
          isApproved: false,
          isProcessed: true,
          reviewNotes: reason || 'Bulk rejection'
        });
        results.push({ contentId, success: true, content });
      } catch (error) {
        results.push({ contentId, success: false, error: error.message });
      }
    }
    
    res.json({
      success: true,
      data: results
    });
  }),

  // Content Export
  exportContent: asyncHandler(async (req: Request, res: Response) => {
    const { format = 'json', filters } = req.query;
    
    const result = await contentModel.getContentItems({
      isApproved: true,
      ...filters
    });
    
    if (format === 'csv') {
      // TODO: Implement CSV export
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=content-export.csv');
      res.send('CSV export not implemented yet');
    } else {
      res.json({
        success: true,
        data: result.items,
        exportedAt: new Date().toISOString(),
        totalItems: result.total
      });
    }
  })
};