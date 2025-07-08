import axios from 'axios';
import ytdl from 'ytdl-core';
import crypto from 'crypto';
import { createWriteStream } from 'fs';
import { promises as fs } from 'fs';
import path from 'path';
import { logger } from '../utils/logger';
import { ContentModel, ContentItem } from '../models/Content';
import { config } from '../utils/config';
import { contentDownloader } from './ContentDownloaderService';
import { db } from '../database';

export interface EnhancedKhanContent extends ContentItem {
  ibProgramme?: 'PYP' | 'MYP' | 'DP';
  ibUnit?: string;
  offlinePath?: string;
  downloadSizeMb?: number;
  offlineAvailable?: boolean;
  requiresInternet?: boolean;
  languageAvailable?: string[];
  licenseType?: string;
  attribution?: string;
  author?: string;
  sourceUrl?: string;
  interactive?: boolean;
  interactiveData?: any;
  culturalNotes?: string;
  culturalFlags?: any[];
  culturalReviewRequired?: boolean;
  videoQualities?: Record<string, string>;
}

export class EnhancedKhanAcademyService {
  private baseUrl = 'https://www.khanacademy.org/api/v1';
  private contentModel: ContentModel;
  private contentDir: string;
  
  // IB Programme mapping
  private ibProgrammeMapping = {
    'early-math': 'PYP',
    'arithmetic': 'PYP',
    'pre-algebra': 'MYP',
    'basic-geo': 'MYP',
    'algebra': 'MYP',
    'geometry': 'MYP',
    'algebra2': 'MYP',
    'trigonometry': 'DP',
    'precalculus': 'DP',
    'calculus-1': 'DP',
    'calculus-2': 'DP',
    'ap-calculus-ab': 'DP',
    'ap-calculus-bc': 'DP',
    'statistics-probability': 'DP',
    'ap-statistics': 'DP'
  };

  // IB Unit mapping
  private ibUnitMapping = {
    'counting': 'PYP.Mathematics.Number',
    'addition-subtraction': 'PYP.Mathematics.Number',
    'multiplication-division': 'PYP.Mathematics.Number',
    'fractions': 'MYP.Mathematics.Number',
    'decimals': 'MYP.Mathematics.Number',
    'ratios-proportions': 'MYP.Mathematics.AlgebraicConcepts',
    'linear-equations': 'MYP.Mathematics.AlgebraicConcepts',
    'quadratics': 'MYP.Mathematics.AlgebraicConcepts',
    'polynomials': 'DP.Mathematics.Algebra',
    'exponential-logarithms': 'DP.Mathematics.Functions',
    'derivatives': 'DP.Mathematics.Calculus',
    'integrals': 'DP.Mathematics.Calculus',
    'probability': 'DP.Mathematics.Statistics',
    'hypothesis-testing': 'DP.Mathematics.Statistics'
  };

  constructor(contentModel: ContentModel) {
    this.contentModel = contentModel;
    this.contentDir = process.env.CONTENT_DIR || './content';
  }

  /**
   * Enhanced content import with IB mapping and offline support
   */
  async importContentWithEnhancements(
    kaContent: any,
    sourceId: string,
    subjectId: string,
    gradeLevel: string
  ): Promise<string> {
    try {
      // Create enhanced content item
      const enhancedContent: EnhancedKhanContent = {
        sourceId,
        externalId: kaContent.id,
        title: kaContent.title,
        titleDari: null, // Will be translated
        titlePashto: null, // Will be translated
        description: kaContent.description,
        descriptionDari: null,
        descriptionPashto: null,
        subjectId,
        gradeLevel,
        contentType: kaContent.kind.toLowerCase() as 'video' | 'article' | 'exercise',
        difficulty: this.determineDifficulty(kaContent, gradeLevel),
        duration: kaContent.duration || 0,
        videoUrl: kaContent.youtube_id ? `https://www.youtube.com/watch?v=${kaContent.youtube_id}` : undefined,
        thumbnailUrl: kaContent.download_urls?.png,
        subtitles: await this.extractSubtitles(kaContent.youtube_id),
        transcript: null,
        transcriptDari: null,
        transcriptPashto: null,
        tags: kaContent.tags || [],
        prerequisites: [],
        learningObjectives: this.extractLearningObjectives(kaContent),
        isProcessed: false,
        isApproved: false,
        qualityScore: 0.85, // High quality for Khan Academy
        importedAt: new Date(),
        lastUpdatedAt: new Date(),
        metadata: {
          kaUrl: kaContent.ka_url,
          relativeUrl: kaContent.relative_url,
          youtubeId: kaContent.youtube_id
        },
        // Enhanced fields
        ibProgramme: this.mapToIBProgramme(kaContent),
        ibUnit: this.mapToIBUnit(kaContent),
        offlineAvailable: false,
        requiresInternet: true,
        languageAvailable: ['en'], // Start with English only
        licenseType: 'CC-BY-NC-SA',
        attribution: `Khan Academy - ${kaContent.title}`,
        author: 'Khan Academy',
        sourceUrl: kaContent.ka_url,
        interactive: kaContent.kind === 'Exercise',
        culturalReviewRequired: false
      };

      // Save to database
      const result = await db('content_items').insert(enhancedContent).returning('id');
      const contentId = result[0].id;

      // Queue for offline download if it's a video
      if (kaContent.youtube_id) {
        await contentDownloader.queueDownload({
          userId: 'system',
          contentId,
          quality: 'medium',
          priority: 'low'
        });
      }

      // Queue for translation
      await this.queueForTranslation(contentId, enhancedContent);

      return contentId;
    } catch (error) {
      logger.error('Failed to import enhanced content:', error);
      throw error;
    }
  }

  /**
   * Map content to IB Programme
   */
  private mapToIBProgramme(kaContent: any): 'PYP' | 'MYP' | 'DP' | undefined {
    const slug = kaContent.slug || kaContent.node_slug || '';
    
    for (const [key, programme] of Object.entries(this.ibProgrammeMapping)) {
      if (slug.includes(key)) {
        return programme as 'PYP' | 'MYP' | 'DP';
      }
    }

    // Grade-based fallback
    const gradeMatch = kaContent.title.match(/grade (\d+)/i);
    if (gradeMatch) {
      const grade = parseInt(gradeMatch[1]);
      if (grade <= 5) return 'PYP';
      if (grade <= 10) return 'MYP';
      return 'DP';
    }

    return undefined;
  }

  /**
   * Map content to IB Unit
   */
  private mapToIBUnit(kaContent: any): string | undefined {
    const slug = kaContent.slug || kaContent.node_slug || '';
    
    for (const [key, unit] of Object.entries(this.ibUnitMapping)) {
      if (slug.includes(key) || kaContent.title.toLowerCase().includes(key)) {
        return unit;
      }
    }

    return undefined;
  }

  /**
   * Extract subtitles from YouTube video
   */
  private async extractSubtitles(youtubeId: string): Promise<any[]> {
    if (!youtubeId) return [];

    try {
      const info = await ytdl.getInfo(`https://www.youtube.com/watch?v=${youtubeId}`);
      const tracks = info.player_response.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
      
      return tracks.map(track => ({
        language: track.languageCode,
        name: track.name.simpleText,
        url: track.baseUrl,
        autoGenerated: track.vssId?.includes('.auto')
      }));
    } catch (error) {
      logger.error('Failed to extract subtitles:', error);
      return [];
    }
  }

  /**
   * Queue content for translation
   */
  private async queueForTranslation(contentId: string, content: EnhancedKhanContent): Promise<void> {
    const languages = ['fa', 'ps']; // Dari and Pashto
    const types = ['title', 'description'];

    for (const lang of languages) {
      for (const type of types) {
        const originalText = type === 'title' ? content.title : content.description;
        
        if (originalText) {
          await db('translation_requests').insert({
            id: crypto.randomUUID(),
            content_id: contentId,
            target_language: lang,
            translation_type: type,
            status: 'pending',
            method: 'community',
            original_text: originalText,
            requested_at: new Date()
          }).onConflict(['content_id', 'target_language', 'translation_type']).ignore();
        }
      }
    }
  }

  /**
   * Download and process video for offline use
   */
  async downloadVideoForOffline(contentId: string, youtubeId: string): Promise<void> {
    try {
      const videoPath = path.join(this.contentDir, 'videos', 'khan-academy', `${contentId}.mp4`);
      
      // Ensure directory exists
      await fs.mkdir(path.dirname(videoPath), { recursive: true });

      // Download video
      const stream = ytdl(`https://www.youtube.com/watch?v=${youtubeId}`, {
        quality: 'highestaudio',
        filter: 'audioandvideo'
      });

      const writeStream = createWriteStream(videoPath);
      stream.pipe(writeStream);

      await new Promise((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });

      // Get file size
      const stats = await fs.stat(videoPath);
      const sizeMB = Math.round(stats.size / (1024 * 1024));

      // Update database
      await db('content_items')
        .where('id', contentId)
        .update({
          offline_path: videoPath,
          offline_available: true,
          download_size_mb: sizeMB,
          requires_internet: false
        });

      logger.info(`Downloaded video for offline use: ${contentId}`);
    } catch (error) {
      logger.error('Failed to download video for offline use:', error);
      throw error;
    }
  }

  /**
   * Extract learning objectives with IB alignment
   */
  private extractLearningObjectives(content: any): string[] {
    const objectives: string[] = [];
    
    // Extract from description
    if (content.description) {
      const patterns = [
        /students will (?:be able to )?(.+?)(?:\.|,|$)/gi,
        /learn (?:how to |about )?(.+?)(?:\.|,|$)/gi,
        /understand (.+?)(?:\.|,|$)/gi,
        /practice (.+?)(?:\.|,|$)/gi,
        /explore (.+?)(?:\.|,|$)/gi,
        /develop (.+?)(?:\.|,|$)/gi,
        /analyze (.+?)(?:\.|,|$)/gi,
        /evaluate (.+?)(?:\.|,|$)/gi
      ];
      
      patterns.forEach(pattern => {
        const matches = content.description.matchAll(pattern);
        for (const match of matches) {
          if (match[1] && match[1].length > 5) {
            objectives.push(match[1].trim());
          }
        }
      });
    }

    // Add IB-aligned objectives based on content type
    const ibProgramme = this.mapToIBProgramme(content);
    
    if (ibProgramme === 'PYP') {
      objectives.push('Develop conceptual understanding through inquiry');
      objectives.push('Make connections to real-world contexts');
    } else if (ibProgramme === 'MYP') {
      objectives.push('Apply knowledge in unfamiliar situations');
      objectives.push('Develop ATL (Approaches to Learning) skills');
    } else if (ibProgramme === 'DP') {
      objectives.push('Prepare for IB assessments');
      objectives.push('Develop critical thinking and analysis skills');
    }

    return [...new Set(objectives)].slice(0, 5);
  }

  /**
   * Determine difficulty with IB alignment
   */
  private determineDifficulty(content: any, gradeLevel: string): 'beginner' | 'intermediate' | 'advanced' {
    const grade = parseInt(gradeLevel) || 0;
    const title = content.title.toLowerCase();
    const ibProgramme = this.mapToIBProgramme(content);
    
    // IB Programme-based difficulty
    if (ibProgramme === 'PYP') return 'beginner';
    if (ibProgramme === 'MYP') {
      if (title.includes('extended') || title.includes('advanced')) {
        return 'advanced';
      }
      return 'intermediate';
    }
    if (ibProgramme === 'DP') {
      if (title.includes('hl') || title.includes('higher level')) {
        return 'advanced';
      }
      return 'intermediate';
    }
    
    // Fallback to grade-based
    if (grade <= 5) return 'beginner';
    if (grade <= 10) return 'intermediate';
    return 'advanced';
  }

  /**
   * Sync all Khan Academy content for IB programmes
   */
  async syncIBContent(): Promise<void> {
    const ibSubjects = {
      'math': ['early-math', 'arithmetic', 'pre-algebra', 'algebra', 'geometry', 'algebra2', 'trigonometry', 'precalculus', 'calculus-1', 'calculus-2', 'statistics-probability'],
      'science': ['physics', 'chemistry', 'biology'],
      'computing': ['computing', 'computer-programming', 'computer-science'],
      'economics': ['microeconomics', 'macroeconomics', 'finance-capital-markets']
    };

    for (const [subject, topics] of Object.entries(ibSubjects)) {
      for (const topic of topics) {
        try {
          logger.info(`Syncing Khan Academy content for ${topic}`);
          await this.importTopicContent(topic, subject);
        } catch (error) {
          logger.error(`Failed to sync ${topic}:`, error);
        }
      }
    }
  }

  /**
   * Import content for a specific topic
   */
  private async importTopicContent(topicSlug: string, subject: string): Promise<void> {
    // Implementation would follow the pattern in the original KhanAcademyService
    // but with enhanced content processing
  }
}

export const enhancedKhanService = new EnhancedKhanAcademyService(
  new ContentModel(db)
);