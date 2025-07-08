import axios from 'axios';
import { logger } from '../utils/logger.js';
import { ContentModel, ContentItem } from '../models/Content.js';
import { config } from '../utils/config.js';

export interface KhanAcademyTopic {
  id: string;
  title: string;
  description: string;
  kind: string;
  children?: KhanAcademyTopic[];
  content_items?: KhanAcademyContent[];
}

export interface KhanAcademyContent {
  id: string;
  title: string;
  description: string;
  kind: 'Video' | 'Exercise' | 'Article';
  duration: number;
  youtube_id?: string;
  download_urls?: {
    mp4?: string;
    png?: string;
  };
  translated_youtube_id?: string;
  translated_download_urls?: any;
  ka_url: string;
  relative_url: string;
  tags: string[];
  creation_date: string;
  update_date: string;
}

export interface ImportProgress {
  totalItems: number;
  processedItems: number;
  successfulImports: number;
  failedImports: number;
  currentItem?: string;
  startTime: Date;
  estimatedTimeRemaining?: number;
}

export class KhanAcademyService {
  private baseUrl = 'https://www.khanacademy.org/api/v1';
  private contentModel: ContentModel;
  private importProgress: Map<string, ImportProgress> = new Map();

  constructor(contentModel: ContentModel) {
    this.contentModel = contentModel;
  }

  /**
   * Get the Khan Academy topic tree
   */
  async getTopicTree(): Promise<KhanAcademyTopic> {
    try {
      const response = await axios.get(`${this.baseUrl}/topic/topictree`);
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch Khan Academy topic tree:', error);
      throw new Error('Unable to fetch Khan Academy content structure');
    }
  }

  /**
   * Get topics for a specific subject
   */
  async getTopicsBySubject(subjectSlug: string): Promise<KhanAcademyTopic> {
    try {
      const response = await axios.get(`${this.baseUrl}/topic/${subjectSlug}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to fetch Khan Academy topics for ${subjectSlug}:`, error);
      throw new Error(`Unable to fetch content for subject: ${subjectSlug}`);
    }
  }

  /**
   * Get detailed content information
   */
  async getContentDetails(contentId: string): Promise<KhanAcademyContent> {
    try {
      const response = await axios.get(`${this.baseUrl}/videos/${contentId}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to fetch content details for ${contentId}:`, error);
      throw new Error(`Unable to fetch content details: ${contentId}`);
    }
  }

  /**
   * Map Khan Academy subject to our subject system
   */
  private mapSubjectToKalaagh(kaSubject: string): string {
    const subjectMapping: Record<string, string> = {
      'math': 'Mathematics',
      'science': 'Science',
      'computing': 'Computer Science',
      'arts-humanities': 'Language Arts',
      'economics-finance-domain': 'Social Studies',
      'life-skills': 'Life Skills'
    };

    return subjectMapping[kaSubject] || 'Mathematics';
  }

  /**
   * Map Khan Academy grade level to our system
   */
  private mapGradeLevel(topic: KhanAcademyTopic): string {
    const title = topic.title.toLowerCase();
    
    if (title.includes('kindergarten')) return 'K';
    if (title.includes('1st grade') || title.includes('grade 1')) return '1';
    if (title.includes('2nd grade') || title.includes('grade 2')) return '2';
    if (title.includes('3rd grade') || title.includes('grade 3')) return '3';
    if (title.includes('4th grade') || title.includes('grade 4')) return '4';
    if (title.includes('5th grade') || title.includes('grade 5')) return '5';
    if (title.includes('6th grade') || title.includes('grade 6')) return '6';
    if (title.includes('7th grade') || title.includes('grade 7')) return '7';
    if (title.includes('8th grade') || title.includes('grade 8')) return '8';
    if (title.includes('9th grade') || title.includes('grade 9')) return '9';
    if (title.includes('10th grade') || title.includes('grade 10')) return '10';
    if (title.includes('11th grade') || title.includes('grade 11')) return '11';
    if (title.includes('12th grade') || title.includes('grade 12')) return '12';
    
    // Advanced content
    if (title.includes('algebra') && title.includes('basic')) return '8';
    if (title.includes('algebra ii') || title.includes('algebra 2')) return '10';
    if (title.includes('geometry')) return '9';
    if (title.includes('trigonometry')) return '11';
    if (title.includes('calculus')) return '12';
    if (title.includes('statistics')) return '11';
    
    // Elementary defaults
    if (title.includes('basic') || title.includes('intro')) return '5';
    
    return '8'; // Default to middle school
  }

  /**
   * Extract learning objectives from content
   */
  private extractLearningObjectives(content: KhanAcademyContent): string[] {
    const objectives: string[] = [];
    
    if (content.description) {
      // Extract objectives from description using common patterns
      const objectivePatterns = [
        /learn (?:how to |about )?(.+?)(?:\.|,|$)/gi,
        /understand (.+?)(?:\.|,|$)/gi,
        /practice (.+?)(?:\.|,|$)/gi,
        /explore (.+?)(?:\.|,|$)/gi
      ];
      
      objectivePatterns.forEach(pattern => {
        const matches = content.description.matchAll(pattern);
        for (const match of matches) {
          if (match[1] && match[1].length > 5) {
            objectives.push(match[1].trim());
          }
        }
      });
    }
    
    // Add default objectives based on content type
    if (content.kind === 'Video') {
      objectives.push(`Watch and understand ${content.title}`);
    } else if (content.kind === 'Exercise') {
      objectives.push(`Practice ${content.title} skills`);
    }
    
    return objectives.slice(0, 5); // Limit to 5 objectives
  }

  /**
   * Convert Khan Academy content to our ContentItem format
   */
  private async convertToContentItem(
    kaContent: KhanAcademyContent,
    sourceId: string,
    subjectId: string,
    gradeLevel: string
  ): Promise<Omit<ContentItem, 'id'>> {
    return {
      sourceId,
      externalId: kaContent.id,
      title: kaContent.title,
      description: kaContent.description,
      subjectId,
      gradeLevel,
      contentType: kaContent.kind.toLowerCase() as 'video' | 'article' | 'exercise',
      difficulty: this.determineDifficulty(kaContent, gradeLevel),
      duration: kaContent.duration || 0,
      videoUrl: kaContent.youtube_id ? `https://www.youtube.com/watch?v=${kaContent.youtube_id}` : undefined,
      thumbnailUrl: kaContent.download_urls?.png,
      subtitles: [], // To be populated later
      transcript: undefined, // To be extracted later
      tags: kaContent.tags || [],
      prerequisites: [], // To be determined from topic structure
      learningObjectives: this.extractLearningObjectives(kaContent),
      isProcessed: false,
      isApproved: false,
      qualityScore: 0.8, // Default high score for Khan Academy content
      importedAt: new Date(),
      lastUpdatedAt: new Date(),
      metadata: {
        kaUrl: kaContent.ka_url,
        relativeUrl: kaContent.relative_url,
        creationDate: kaContent.creation_date,
        updateDate: kaContent.update_date,
        youtubeId: kaContent.youtube_id
      }
    };
  }

  /**
   * Determine content difficulty based on grade level and content
   */
  private determineDifficulty(content: KhanAcademyContent, gradeLevel: string): 'beginner' | 'intermediate' | 'advanced' {
    const grade = parseInt(gradeLevel) || 0;
    const title = content.title.toLowerCase();
    
    if (grade <= 5) return 'beginner';
    if (grade <= 8) return 'intermediate';
    
    // High school content
    if (title.includes('advanced') || title.includes('ap ') || title.includes('calculus')) {
      return 'advanced';
    }
    
    return 'intermediate';
  }

  /**
   * Start bulk import process for a subject
   */
  async startBulkImport(
    subjectSlug: string,
    kalaghSubjectId: string,
    progressId: string
  ): Promise<string> {
    try {
      // Initialize progress tracking
      const progress: ImportProgress = {
        totalItems: 0,
        processedItems: 0,
        successfulImports: 0,
        failedImports: 0,
        startTime: new Date()
      };
      this.importProgress.set(progressId, progress);

      // Get or create content source
      let source = await this.contentModel.getContentSources(true)
        .then(sources => sources.find(s => s.name === 'Khan Academy'));
      
      if (!source) {
        source = await this.contentModel.createContentSource({
          name: 'Khan Academy',
          baseUrl: this.baseUrl,
          isActive: true,
          totalContent: 0,
          importedContent: 0,
          metadata: { subjectSlug }
        });
      }

      // Start import process in background
      this.processSubjectImport(subjectSlug, source.id, kalaghSubjectId, progressId)
        .catch(error => {
          logger.error(`Bulk import failed for ${subjectSlug}:`, error);
          const currentProgress = this.importProgress.get(progressId);
          if (currentProgress) {
            currentProgress.currentItem = `Failed: ${error.message}`;
            this.importProgress.set(progressId, currentProgress);
          }
        });

      return progressId;
    } catch (error) {
      logger.error(`Failed to start bulk import for ${subjectSlug}:`, error);
      throw error;
    }
  }

  /**
   * Process subject import in background
   */
  private async processSubjectImport(
    subjectSlug: string,
    sourceId: string,
    subjectId: string,
    progressId: string
  ): Promise<void> {
    const progress = this.importProgress.get(progressId)!;
    
    try {
      // Get subject topics
      const topicTree = await this.getTopicsBySubject(subjectSlug);
      
      // Collect all content items
      const allContent = this.collectContentFromTopic(topicTree);
      progress.totalItems = allContent.length;
      this.importProgress.set(progressId, progress);

      logger.info(`Starting import of ${allContent.length} items for ${subjectSlug}`);

      // Process each content item
      for (const { content, gradeLevel } of allContent) {
        progress.currentItem = content.title;
        progress.processedItems++;
        
        // Calculate estimated time remaining
        if (progress.processedItems > 1) {
          const elapsedMs = Date.now() - progress.startTime.getTime();
          const avgTimePerItem = elapsedMs / progress.processedItems;
          const remainingItems = progress.totalItems - progress.processedItems;
          progress.estimatedTimeRemaining = Math.round((remainingItems * avgTimePerItem) / 1000);
        }
        
        this.importProgress.set(progressId, progress);

        try {
          // Check if content already exists
          const existingContent = await this.contentModel.getContentByExternalId(sourceId, content.id);
          if (existingContent) {
            logger.debug(`Content already exists: ${content.title}`);
            progress.successfulImports++;
            continue;
          }

          // Convert and save content
          const contentItem = await this.convertToContentItem(content, sourceId, subjectId, gradeLevel);
          await this.contentModel.createContentItem(contentItem);
          
          progress.successfulImports++;
          logger.debug(`Imported content: ${content.title}`);
          
          // Add small delay to avoid overwhelming the API
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          progress.failedImports++;
          logger.error(`Failed to import content ${content.title}:`, error);
        }
      }

      // Update content source statistics
      await this.contentModel.updateContentSource(sourceId, {
        totalContent: progress.totalItems,
        importedContent: progress.successfulImports,
        lastSyncAt: new Date()
      });

      logger.info(`Import completed for ${subjectSlug}: ${progress.successfulImports} successful, ${progress.failedImports} failed`);
      
    } catch (error) {
      logger.error(`Subject import failed for ${subjectSlug}:`, error);
      throw error;
    }
  }

  /**
   * Recursively collect all content from a topic tree
   */
  private collectContentFromTopic(topic: KhanAcademyTopic): Array<{ content: KhanAcademyContent; gradeLevel: string }> {
    const results: Array<{ content: KhanAcademyContent; gradeLevel: string }> = [];
    const gradeLevel = this.mapGradeLevel(topic);

    // Add content items from this topic
    if (topic.content_items) {
      for (const content of topic.content_items) {
        if (content.kind === 'Video' || content.kind === 'Exercise' || content.kind === 'Article') {
          results.push({ content, gradeLevel });
        }
      }
    }

    // Recursively process children
    if (topic.children) {
      for (const child of topic.children) {
        results.push(...this.collectContentFromTopic(child));
      }
    }

    return results;
  }

  /**
   * Get import progress
   */
  getImportProgress(progressId: string): ImportProgress | null {
    return this.importProgress.get(progressId) || null;
  }

  /**
   * Clear completed import progress
   */
  clearImportProgress(progressId: string): void {
    this.importProgress.delete(progressId);
  }

  /**
   * Get all active import processes
   */
  getActiveImports(): Record<string, ImportProgress> {
    return Object.fromEntries(this.importProgress.entries());
  }
}