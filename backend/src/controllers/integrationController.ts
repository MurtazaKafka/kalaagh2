import { Request, Response } from 'express';
import { enhancedKhanService } from '../services/EnhancedKhanAcademyService';
import { ck12Service } from '../services/CK12Service';
import { phetService } from '../services/PhETService';
import { codeOrgService } from '../services/CodeOrgService';
import { contentDownloader } from '../services/ContentDownloaderService';
import { translationService } from '../services/TranslationService';
import { culturalAdaptationService } from '../services/CulturalAdaptationService';
import { bandwidthOptimizer } from '../services/BandwidthOptimizationService';
import { licenseComplianceService } from '../services/LicenseComplianceService';
import { db } from '../database';
import { logger } from '../utils/logger';

export class IntegrationController {
  /**
   * Sync all educational content sources
   */
  async syncAllContent(req: Request, res: Response): Promise<void> {
    try {
      const { gradeLevel, subject, programme } = req.query;
      
      const syncTasks = [];
      
      // Sync Khan Academy
      if (!subject || subject === 'all' || subject === 'mathematics') {
        syncTasks.push(enhancedKhanService.syncIBContent());
      }
      
      // Import CK-12 FlexBooks
      if (!subject || subject === 'all') {
        syncTasks.push(ck12Service.importFlexBooks(
          subject as string || 'mathematics',
          gradeLevel as string || '8'
        ));
      }
      
      // Import PhET simulations
      syncTasks.push(phetService.importAllSimulations());
      
      // Import Code.org courses
      syncTasks.push(codeOrgService.importCourses(gradeLevel as string));
      
      await Promise.allSettled(syncTasks);
      
      // Get sync statistics
      const stats = await this.getSyncStatistics();
      
      res.json({
        success: true,
        message: 'Content sync initiated',
        statistics: stats
      });
    } catch (error) {
      logger.error('Content sync failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to sync content'
      });
    }
  }

  /**
   * Get integration statistics
   */
  async getSyncStatistics(): Promise<any> {
    const sources = await db('content_sources').select('*');
    const contentBySource = await db('content_items')
      .select('source_id')
      .count('* as count')
      .groupBy('source_id');
    
    const statistics = sources.map(source => {
      const content = contentBySource.find(c => c.source_id === source.id);
      return {
        source: source.name,
        totalContent: content?.count || 0,
        lastSync: source.last_sync_at,
        isActive: source.is_active
      };
    });
    
    const totalContent = await db('content_items').count('* as total').first();
    const offlineContent = await db('content_items')
      .where('offline_available', true)
      .count('* as total')
      .first();
    
    return {
      sources: statistics,
      totals: {
        allContent: totalContent?.total || 0,
        offlineAvailable: offlineContent?.total || 0,
        languages: ['en', 'fa', 'ps']
      }
    };
  }

  /**
   * Search across all platforms
   */
  async searchContent(req: Request, res: Response): Promise<void> {
    try {
      const { query, subject, gradeLevel, contentType, language } = req.query;
      
      let searchQuery = db('content_items')
        .leftJoin('content_sources', 'content_items.source_id', 'content_sources.id')
        .select(
          'content_items.*',
          'content_sources.name as source_name'
        );
      
      // Apply filters
      if (query) {
        searchQuery = searchQuery.where(function() {
          this.where('content_items.title', 'ilike', `%${query}%`)
            .orWhere('content_items.description', 'ilike', `%${query}%`)
            .orWhere('content_items.tags', 'ilike', `%${query}%`);
        });
      }
      
      if (subject) {
        const subjectRecord = await db('subjects').where('name', subject).first();
        if (subjectRecord) {
          searchQuery = searchQuery.where('content_items.subject_id', subjectRecord.id);
        }
      }
      
      if (gradeLevel) {
        searchQuery = searchQuery.where('content_items.grade_level', gradeLevel);
      }
      
      if (contentType) {
        searchQuery = searchQuery.where('content_items.content_type', contentType);
      }
      
      if (language) {
        searchQuery = searchQuery.whereRaw('? = ANY(language_available::text[])', [language]);
      }
      
      const results = await searchQuery.limit(50);
      
      // Check cultural adaptation for each result
      const adaptedResults = await Promise.all(results.map(async (item) => {
        const culturalReview = await culturalAdaptationService.reviewContent(item.id);
        return {
          ...item,
          culturalFlags: culturalReview.flags,
          requiresCulturalReview: culturalReview.requiresReview
        };
      }));
      
      res.json({
        success: true,
        results: adaptedResults,
        total: adaptedResults.length
      });
    } catch (error) {
      logger.error('Content search failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search content'
      });
    }
  }

  /**
   * Download content for offline use
   */
  async downloadForOffline(req: Request, res: Response): Promise<void> {
    try {
      const { contentId } = req.params;
      const { quality } = req.body;
      const userId = req.user?.id || 'anonymous';
      
      // Check bandwidth and select quality
      const userBandwidth = await bandwidthOptimizer.getAverageBandwidth();
      const selectedQuality = quality || bandwidthOptimizer.selectQualityForBandwidth(userBandwidth);
      
      // Queue download
      const queueId = await contentDownloader.queueDownload({
        userId,
        contentId,
        quality: selectedQuality,
        priority: 'high'
      });
      
      res.json({
        success: true,
        queueId,
        quality: selectedQuality,
        estimatedSize: await this.estimateDownloadSize(contentId, selectedQuality)
      });
    } catch (error) {
      logger.error('Offline download failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to queue download'
      });
    }
  }

  /**
   * Get download queue status
   */
  async getDownloadStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || 'anonymous';
      const queue = await contentDownloader.getQueueStatus(userId);
      
      res.json({
        success: true,
        queue
      });
    } catch (error) {
      logger.error('Failed to get download status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get download status'
      });
    }
  }

  /**
   * Request content translation
   */
  async requestTranslation(req: Request, res: Response): Promise<void> {
    try {
      const { contentId } = req.params;
      const { targetLanguage, translationType } = req.body;
      
      const content = await db('content_items').where('id', contentId).first();
      
      if (!content) {
        res.status(404).json({
          success: false,
          error: 'Content not found'
        });
        return;
      }
      
      const requestId = await translationService.requestCommunityTranslation(
        contentId,
        content[translationType] || content.title,
        translationType,
        targetLanguage
      );
      
      res.json({
        success: true,
        requestId,
        message: 'Translation request submitted'
      });
    } catch (error) {
      logger.error('Translation request failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to request translation'
      });
    }
  }

  /**
   * Get cultural adaptation review
   */
  async getCulturalReview(req: Request, res: Response): Promise<void> {
    try {
      const { contentId } = req.params;
      
      const review = await culturalAdaptationService.reviewContent(contentId);
      
      res.json({
        success: true,
        review
      });
    } catch (error) {
      logger.error('Cultural review failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to perform cultural review'
      });
    }
  }

  /**
   * Get bandwidth optimization recommendations
   */
  async getBandwidthRecommendations(req: Request, res: Response): Promise<void> {
    try {
      const userBandwidth = await bandwidthOptimizer.getAverageBandwidth();
      const quality = bandwidthOptimizer.selectQualityForBandwidth(userBandwidth);
      
      res.json({
        success: true,
        currentBandwidth: userBandwidth,
        recommendedQuality: quality,
        bandwidthMbps: userBandwidth / 1000000,
        recommendations: {
          videoQuality: quality,
          preloadContent: userBandwidth > 1000000,
          downloadDuringOffPeak: userBandwidth < 500000,
          useAudioOnly: userBandwidth < 200000
        }
      });
    } catch (error) {
      logger.error('Bandwidth recommendations failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get bandwidth recommendations'
      });
    }
  }

  /**
   * Get license compliance report
   */
  async getLicenseCompliance(req: Request, res: Response): Promise<void> {
    try {
      const report = await licenseComplianceService.generateLicenseReport();
      
      res.json({
        success: true,
        report
      });
    } catch (error) {
      logger.error('License compliance report failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate license report'
      });
    }
  }

  /**
   * Generate attribution page
   */
  async generateAttributions(req: Request, res: Response): Promise<void> {
    try {
      const { format = 'html' } = req.query;
      
      const attributions = await licenseComplianceService.generateAttributionPage(
        format as 'html' | 'markdown' | 'json'
      );
      
      const contentType = format === 'html' ? 'text/html' : 
                         format === 'markdown' ? 'text/markdown' : 
                         'application/json';
      
      res.contentType(contentType).send(attributions);
    } catch (error) {
      logger.error('Attribution generation failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate attributions'
      });
    }
  }

  /**
   * Estimate download size
   */
  private async estimateDownloadSize(contentId: string, quality: string): Promise<number> {
    const content = await db('content_items').where('id', contentId).first();
    
    if (!content) return 0;
    
    // Estimate based on duration and quality
    const baseSizeMB = (content.duration_seconds || 0) / 60 * 10; // 10MB per minute baseline
    
    const qualityMultipliers: Record<string, number> = {
      high: 1.0,
      medium: 0.5,
      low: 0.25,
      ultra_low: 0.1,
      audio_only: 0.05
    };
    
    return Math.round(baseSizeMB * (qualityMultipliers[quality] || 0.5));
  }

  /**
   * Setup LTI integration
   */
  async setupLTI(req: Request, res: Response): Promise<void> {
    try {
      const { platform, consumerKey, sharedSecret, schoolId } = req.body;
      
      let result;
      
      switch (platform) {
        case 'code.org':
          result = await codeOrgService.setupLTI(consumerKey, sharedSecret, schoolId);
          break;
        default:
          throw new Error(`LTI not supported for platform: ${platform}`);
      }
      
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      logger.error('LTI setup failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to setup LTI integration'
      });
    }
  }
}

export const integrationController = new IntegrationController();